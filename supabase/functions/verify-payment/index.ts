
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

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    console.log(`📋 Session status: ${session.payment_status}`);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid');
      
      // Extract customer information from session metadata first, then fallback to Stripe data
      let customerInfo = {
        billing: {
          fullName: 'No disponible',
          email: session.customer_details?.email || 'No disponible',
          phone: 'No disponible',
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

      // First, try to get customer info from metadata (sent from frontend)
      if (session.metadata?.customerInfo) {
        try {
          const metadataCustomerInfo = JSON.parse(session.metadata.customerInfo);
          console.log('📋 Found customer info in metadata:', metadataCustomerInfo);
          customerInfo = metadataCustomerInfo;
        } catch (error) {
          console.log('⚠️ Could not parse customer info from metadata:', error);
        }
      }

      // Fallback: Extract basic info from Stripe customer details if metadata is empty
      if (customerInfo.billing.fullName === 'No disponible' && session.customer_details) {
        customerInfo.billing.fullName = session.customer_details.name || 'No disponible';
        customerInfo.billing.email = session.customer_details.email || 'No disponible';
        customerInfo.billing.phone = session.customer_details.phone || 'No disponible';
        
        // Set delivery same as billing if no specific delivery info
        customerInfo.delivery.deliveryName = customerInfo.billing.fullName;
        customerInfo.delivery.sameAsBilling = true;
        
        console.log('📋 Used Stripe customer details as fallback');
      }

      console.log('💾 Final customer info:', JSON.stringify(customerInfo, null, 2));

      // Get items from session metadata
      const items = JSON.parse(session.metadata?.items || '[]');
      
      // Enhance items with customer information
      const enhancedItems = items.map((item: any) => ({
        ...item,
        // Add customer info to each item for backward compatibility
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
