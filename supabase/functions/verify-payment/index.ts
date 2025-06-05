
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 verify-payment function called');
    
    const { sessionId } = await req.json()
    console.log(`🎯 Verifying session: ${sessionId}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if order already exists
    console.log(`🔍 Checking for existing order with session ID: ${sessionId}`);
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (existingOrder) {
      console.log('✅ Order already exists, returning existing order');
      return new Response(
        JSON.stringify({ success: true, orderId: existingOrder.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('📋 No existing order found, proceeding with Stripe verification');

    // Get session from Stripe with expanded customer and payment_intent data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent']
    })
    
    console.log(`📋 Session status: ${session.payment_status}`);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid');
      
      // Extract customer information from Stripe session
      let customerInfo = {
        billing: {
          fullName: 'No disponible',
          email: session.customer_details?.email || 'No disponible',
          phone: session.customer_details?.phone || 'No disponible',
          address: 'No disponible',
          city: 'No disponible',
          zipCode: 'No disponible'
        },
        delivery: {
          deliveryName: 'No disponible',
          deliveryAddress: 'No disponible',
          deliveryCity: 'No disponible',
          deliveryZipCode: 'No disponible',
          sameAsBilling: false
        }
      };

      // Extract billing address if available
      if (session.customer_details?.address) {
        const address = session.customer_details.address;
        customerInfo.billing = {
          fullName: session.customer_details.name || 'No disponible',
          email: session.customer_details.email || 'No disponible',
          phone: session.customer_details.phone || 'No disponible',
          address: [address.line1, address.line2].filter(Boolean).join(', ') || 'No disponible',
          city: address.city || 'No disponible',
          zipCode: address.postal_code || 'No disponible'
        };
      }

      // Extract shipping address if available
      if (session.shipping_details?.address) {
        const shippingAddress = session.shipping_details.address;
        customerInfo.delivery = {
          deliveryName: session.shipping_details.name || customerInfo.billing.fullName,
          deliveryAddress: [shippingAddress.line1, shippingAddress.line2].filter(Boolean).join(', ') || 'No disponible',
          deliveryCity: shippingAddress.city || 'No disponible',
          deliveryZipCode: shippingAddress.postal_code || 'No disponible',
          sameAsBilling: false
        };
      } else {
        // If no shipping address, assume same as billing
        customerInfo.delivery = {
          deliveryName: customerInfo.billing.fullName,
          deliveryAddress: customerInfo.billing.address,
          deliveryCity: customerInfo.billing.city,
          deliveryZipCode: customerInfo.billing.zipCode,
          sameAsBilling: true
        };
      }

      console.log('💾 Customer info extracted:', JSON.stringify(customerInfo, null, 2));

      // Get items from session metadata
      const items = JSON.parse(session.metadata?.items || '[]');
      
      // Enhance items with customer information for backward compatibility
      const enhancedItems = items.map((item: any) => ({
        ...item,
        // Add customer info to each item for compatibility
        customerInfo: customerInfo,
        // Also add individual fields for easier access
        fullName: customerInfo.billing.fullName,
        email: customerInfo.billing.email,
        phone: customerInfo.billing.phone,
        address: customerInfo.billing.address,
        city: customerInfo.billing.city,
        zipCode: customerInfo.billing.zipCode,
        deliveryName: customerInfo.delivery.deliveryName,
        deliveryAddress: customerInfo.delivery.deliveryAddress,
        deliveryCity: customerInfo.delivery.deliveryCity,
        deliveryZipCode: customerInfo.delivery.deliveryZipCode,
        sameAsBilling: customerInfo.delivery.sameAsBilling
      }));

      console.log(`💾 Creating order for user: ${session.metadata?.userId}`);
      
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: session.metadata?.userId,
            items: enhancedItems,
            total: session.amount_total ? session.amount_total / 100 : 0,
            status: 'pendiente',
            stripe_session_id: sessionId,
            school_name: session.metadata?.schoolName,
            grade: session.metadata?.grade,
          }
        ])
        .select()
        .single()

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw orderError;
      }

      console.log(`✅ Order created successfully: ${order.id}`);

      return new Response(
        JSON.stringify({ success: true, orderId: order.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      console.log(`❌ Payment not completed. Status: ${session.payment_status}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not completed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('❌ Error in verify-payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
