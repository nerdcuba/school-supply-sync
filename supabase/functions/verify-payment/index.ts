
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

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid');

      // Initialize Supabase with service role for writing
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Parse metadata
      const userId = session.metadata?.user_id;
      const total = parseFloat(session.metadata?.total || '0');
      const itemsData = JSON.parse(session.metadata?.items_data || '[]');
      const customerData = JSON.parse(session.metadata?.customer_data || '{}');

      console.log('💾 Creating order for user:', userId);

      // Create the order with "pendiente" status (initial state after payment)
      const orderData = {
        user_id: userId !== 'guest' ? userId : null,
        items: itemsData,
        total: total,
        status: "pendiente", // Estado inicial después del pago confirmado
        stripe_session_id: sessionId,
        created_at: new Date().toISOString()
      };

      const { data: orderResult, error: orderError } = await supabaseService
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error('Failed to create order: ' + orderError.message);
      }

      console.log('✅ Order created successfully:', orderResult.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          paid: true,
          order: orderResult 
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
