import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get request body
    const { successUrl, cancelUrl, priceId } = await req.json();

    // Check if customer already exists
    const customers = await stripe.customers.list({ 
      email: user.email!, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Determine line items from provided price or env
    const envPriceId = Deno.env.get('STRIPE_PRICE_ID');
    const usePriceId = (priceId && String(priceId).startsWith('price_')) ? priceId : envPriceId;

    const baseSession: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get("origin")}/ai?upgraded=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/ai`,
      metadata: { user_id: user.id },
    } as const;

    let session: Stripe.Checkout.Session;
    if (usePriceId) {
      session = await stripe.checkout.sessions.create({
        ...baseSession,
        line_items: [ { price: usePriceId, quantity: 1 } ],
      });
    } else {
      // Fallback to inline price definition if no price id is configured
      session = await stripe.checkout.sessions.create({
        ...baseSession,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: "Plan Pro - Acceso Ilimitado IA",
                description: "Generaciones ilimitadas de circulares semanales y planes de lección"
              },
              unit_amount: 800,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
      });
    }

    console.log('Created checkout session:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});