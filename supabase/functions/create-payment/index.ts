
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('🚀 create-payment function called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, total, customerData } = await req.json();
    console.log('📦 Received payment request:', { 
      itemsCount: items?.length, 
      total, 
      customerEmail: customerData?.email 
    });

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    console.log('🔐 Auth header present:', !!authHeader);
    
    let user = null;
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      console.log('👤 User authenticated:', user?.email || 'No user');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customerEmail = user?.email || customerData?.email || "guest@example.com";
    const customers = await stripe.customers.list({ 
      email: customerEmail, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ Found existing Stripe customer:', customerId);
    } else {
      console.log('📝 Will create new Stripe customer for:', customerEmail);
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || "Product",
          description: item.description || undefined,
        },
        unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    console.log('💳 Creating Stripe session with', lineItems.length, 'items');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        user_id: user?.id || 'guest',
        total: total.toString(),
        items_count: items.length.toString(),
        items_data: JSON.stringify(items),
        customer_data: JSON.stringify(customerData)
      }
    });

    console.log('🎉 Stripe session created:', session.id);

    // NO CREAR LA ORDEN AQUÍ - Solo crear después del pago exitoso
    console.log('⏳ Orden se creará después del pago exitoso en Stripe');

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Payment creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error processing payment" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
