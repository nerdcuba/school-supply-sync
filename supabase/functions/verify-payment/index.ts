
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('🔍 verify-payment function called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log('🎯 Verifying session:', sessionId);

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase with service role for writing
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Session status:', session.payment_status);
    console.log('📋 Session metadata:', JSON.stringify(session.metadata, null, 2));

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid');

      // Parse metadata
      const userId = session.metadata?.user_id;
      const total = parseFloat(session.metadata?.total || '0');
      const school = session.metadata?.school || '';
      const grade = session.metadata?.grade || '';
      
      console.log('🏫 Escuela extraída del metadata:', school);
      console.log('📚 Grado extraído del metadata:', grade);
      
      // Reconstruir información del cliente desde metadata
      const customerInfo = {
        fullName: session.metadata?.customer_name || '',
        email: session.metadata?.customer_email || '',
        phone: session.metadata?.customer_phone || '',
        address: '',
        city: '',
        zipCode: '',
        deliveryName: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryZipCode: '',
        sameAsDelivery: session.metadata?.delivery_same === '1',
        school: school,
        grade: grade
      };

      // Extraer dirección de facturación
      const billingAddress = session.metadata?.billing_address || '';
      const billingParts = billingAddress.split(', ');
      if (billingParts.length >= 3) {
        customerInfo.address = billingParts[0] || '';
        customerInfo.city = billingParts[1] || '';
        customerInfo.zipCode = billingParts[2] || '';
      } else if (billingParts.length === 1) {
        customerInfo.city = billingParts[0] || '';
      }

      // Extraer dirección de entrega
      const deliveryAddress = session.metadata?.delivery_address || '';
      if (deliveryAddress === 'same' || customerInfo.sameAsDelivery) {
        customerInfo.deliveryName = customerInfo.fullName;
        customerInfo.deliveryAddress = customerInfo.address;
        customerInfo.deliveryCity = customerInfo.city;
        customerInfo.deliveryZipCode = customerInfo.zipCode;
      } else {
        customerInfo.deliveryName = session.metadata?.delivery_name || '';
        const deliveryParts = deliveryAddress.split(', ');
        if (deliveryParts.length >= 3) {
          customerInfo.deliveryAddress = deliveryParts[0] || '';
          customerInfo.deliveryCity = deliveryParts[1] || '';
          customerInfo.deliveryZipCode = deliveryParts[2] || '';
        } else if (deliveryParts.length === 1) {
          customerInfo.deliveryCity = deliveryParts[0] || '';
        }
      }

      console.log('💾 Creating order for user:', userId);
      console.log('📋 Customer data reconstructed:', customerInfo);

      // Crear items con información del cliente incluida
      const itemsWithCustomerInfo = [{
        id: `order-${sessionId}`,
        name: `Orden de ${session.metadata?.items_count || 1} artículo(s) - ${school} - ${grade}`,
        quantity: parseInt(session.metadata?.items_count || '1'),
        price: total,
        ...customerInfo,
        customerInfo: {
          billing: {
            fullName: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            zipCode: customerInfo.zipCode
          },
          delivery: {
            deliveryName: customerInfo.deliveryName,
            deliveryAddress: customerInfo.deliveryAddress,
            deliveryCity: customerInfo.deliveryCity,
            deliveryZipCode: customerInfo.deliveryZipCode,
            sameAsBilling: customerInfo.sameAsDelivery
          },
          school: school,
          grade: grade
        }
      }];

      // Usar la función PostgreSQL para insertar de forma atómica
      console.log('🔒 Using atomic insert function to prevent duplicates...');
      
      const { data: orderResult, error: insertError } = await supabaseService.rpc('insert_order_if_not_exists', {
        p_stripe_session_id: sessionId,
        p_user_id: userId !== 'guest' ? userId : null,
        p_items: itemsWithCustomerInfo,
        p_total: total,
        p_status: "pendiente",
        p_school_name: school,
        p_grade: grade
      });

      if (insertError) {
        console.error('❌ Error in atomic insert function:', insertError);
        throw new Error('Failed to create order: ' + insertError.message);
      }

      console.log('✅ Order processed successfully with ID:', orderResult);

      // Obtener la orden creada o existente
      const { data: finalOrder, error: finalFetchError } = await supabaseService
        .from("orders")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single();

      if (finalFetchError) {
        console.error('❌ Error fetching final order:', finalFetchError);
        throw new Error('Error fetching created order: ' + finalFetchError.message);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          paid: true,
          order: finalOrder 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log('❌ Payment not completed, status:', session.payment_status);
      return new Response(
        JSON.stringify({ 
          success: false,
          paid: false,
          status: session.payment_status 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error verifying payment" 
      }),
      {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
