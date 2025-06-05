
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
    console.log('🚀 create-payment function called');
    
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Auth header present:', !!authHeader);
    
    const { 
      items, 
      customerEmail, 
      customerInfo // Customer information from checkout form
    } = await req.json()
    
    console.log('📦 Received payment request:', { 
      itemsCount: items?.length, 
      total: items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0), 
      customerEmail,
      hasCustomerInfo: !!customerInfo
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader! },
      },
    })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    console.log('👤 User authenticated:', user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Check if customer exists in Stripe
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    })

    let customerId: string | undefined
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
      console.log('👤 Using existing Stripe customer:', customerId);
    } else {
      console.log('📝 Will create new Stripe customer for:', customerEmail);
    }

    // Calculate total
    const totalCents = Math.round(items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) * 100)

    console.log('💳 Creating Stripe session with', items.length, 'items');

    // Prepare session parameters - SIMPLIFIED for payment only
    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `${item.brand || ''} - ${item.school || ''} - ${item.grade || ''}`.trim(),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-canceled`,
      metadata: {
        userId: user.id,
        items: JSON.stringify(items),
        schoolName: items[0]?.school || '',
        grade: items[0]?.grade || '',
        // Store customer info in metadata for retrieval later
        customerInfo: customerInfo ? JSON.stringify(customerInfo) : undefined,
      },
      // SIMPLIFIED: Only ask for email, not full address collection
      customer_creation: 'always',
    }

    // Add customer if exists
    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_email = customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log('🎉 Stripe session created:', session.id);
    console.log('⏳ Orden se creará después del pago exitoso en Stripe');

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in create-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
