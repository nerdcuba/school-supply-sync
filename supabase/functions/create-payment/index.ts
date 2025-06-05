
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
    const requestData = await req.json();
    console.log('📦 Received payment request:', requestData);

    // Extraer datos del request
    const { 
      items = [], 
      total, 
      customerInfo = {}, 
      school = '', 
      grade = '', 
      customerEmail,
      itemsCount 
    } = requestData;

    console.log('🏫 School received:', school);
    console.log('📚 Grade received:', grade);
    console.log('👤 Customer info received:', customerInfo);

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
      console.log('👤 User authenticated:', user?.email);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const email = customerEmail || user?.email || 'guest@example.com';
    console.log('📧 Using email for Stripe:', email);

    // Buscar o crear customer en Stripe
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customerId;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log('✅ Found existing Stripe customer:', customerId);
    } else {
      const newCustomer = await stripe.customers.create({
        email: email,
        name: customerInfo.fullName || user?.user_metadata?.name || '',
      });
      customerId = newCustomer.id;
      console.log('🆕 Created new Stripe customer:', customerId);
    }

    // Construir metadata completo con TODA la información
    const metadata = {
      user_id: user?.id || 'guest',
      customer_name: customerInfo.fullName || user?.user_metadata?.name || '',
      customer_email: email,
      customer_phone: customerInfo.phone || '',
      billing_address: customerInfo.address && customerInfo.city && customerInfo.zipCode 
        ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}`
        : '',
      delivery_address: customerInfo.sameAsDelivery ? 'same' : 
        (customerInfo.deliveryAddress && customerInfo.deliveryCity && customerInfo.deliveryZipCode 
          ? `${customerInfo.deliveryAddress}, ${customerInfo.deliveryCity}, ${customerInfo.deliveryZipCode}`
          : ''),
      delivery_name: customerInfo.sameAsDelivery ? 'same' : (customerInfo.deliveryName || ''),
      delivery_same: customerInfo.sameAsDelivery ? '1' : '0',
      items_count: itemsCount?.toString() || items.length.toString(),
      total: total?.toString() || '0',
      // AGREGAR INFORMACIÓN DE ESCUELA Y GRADO AL METADATA
      school: school || '',
      grade: grade || '',
    };

    console.log('📏 Metadata to be sent to Stripe:', JSON.stringify(metadata, null, 2));
    console.log('📏 Metadata size:', JSON.stringify(metadata).length, 'characters');

    // Crear line items para Stripe
    const lineItems = [];
    
    if (items && items.length > 0) {
      // Si tenemos items específicos, usarlos
      for (const item of items) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name || 'Product',
              description: item.description || `Pack de útiles escolares - ${school || 'Escuela'} - ${grade || 'Grado'}`,
            },
            unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
          },
          quantity: item.quantity || 1,
        });
      }
    } else {
      // Fallback: crear un item genérico
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Pack de útiles escolares - ${school || 'Escuela'} - ${grade || 'Grado'}`,
            description: `Pack completo de útiles escolares`,
          },
          unit_amount: Math.round((total || 0) * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    console.log('💳 Creating Stripe session with', lineItems.length, 'items');

    // Crear la sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: metadata,
      payment_intent_data: {
        metadata: metadata, // También incluir en payment_intent para mayor seguridad
      },
    });

    console.log('🎉 Stripe session created:', session.id);
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
    console.error('❌ Error creating payment session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error creating payment session" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
