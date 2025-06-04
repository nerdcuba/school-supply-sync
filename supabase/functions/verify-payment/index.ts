
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

    // PRIMERO: Verificar si ya existe una orden con este stripe_session_id
    console.log('🔍 Checking for existing order with session ID:', sessionId);
    const { data: existingOrder, error: checkError } = await supabaseService
      .from("orders")
      .select("id, total, created_at")
      .eq("stripe_session_id", sessionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 significa "no rows found", cualquier otro error es problemático
      console.error('❌ Error checking for existing order:', checkError);
      throw new Error('Error checking for existing order: ' + checkError.message);
    }

    if (existingOrder) {
      console.log('✅ Order already exists for this session:', existingOrder.id);
      return new Response(
        JSON.stringify({ 
          success: true,
          paid: true,
          order: existingOrder,
          note: "Order already exists for this session"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Si no existe la orden, proceder con la verificación de Stripe
    console.log('📋 No existing order found, proceeding with Stripe verification');

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed as paid');

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

      // Usar INSERT con verificación adicional para evitar duplicados
      const { data: orderResult, error: orderError } = await supabaseService
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        // Si el error es por clave duplicada (aunque no deberíamos llegar aquí), verificar nuevamente
        if (orderError.code === '23505') {
          console.log('🔄 Duplicate key error, checking for existing order again');
          const { data: duplicateOrder } = await supabaseService
            .from("orders")
            .select("*")
            .eq("stripe_session_id", sessionId)
            .single();
          
          if (duplicateOrder) {
            console.log('✅ Found existing order after duplicate error:', duplicateOrder.id);
            return new Response(
              JSON.stringify({ 
                success: true,
                paid: true,
                order: duplicateOrder 
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }
        }
        
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
