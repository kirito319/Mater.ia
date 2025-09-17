import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SubscriptionState {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscribers")
        .select("subscribed, subscription_tier, subscription_end")
        .maybeSingle();

      if (error) throw error;

      setState({
        subscribed: !!data?.subscribed,
        subscriptionTier: (data?.subscription_tier as string) ?? null,
        subscriptionEnd: (data?.subscription_end as string) ?? null,
      });
    } catch (e: any) {
      console.warn("Failed to load subscription from DB, attempting sync:", e?.message || e);
      try {
        await supabase.functions.invoke("check-subscription");
        const { data, error } = await supabase
          .from("subscribers")
          .select("subscribed, subscription_tier, subscription_end")
          .maybeSingle();
        if (error) throw error;
        setState({
          subscribed: !!data?.subscribed,
          subscriptionTier: (data?.subscription_tier as string) ?? null,
          subscriptionEnd: (data?.subscription_end as string) ?? null,
        });
      } catch (err: any) {
        console.error("Subscription sync failed:", err?.message || err);
        toast({ title: "No se pudo cargar la suscripción", description: "Intenta de nuevo más tarde." });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke("check-subscription");
      await load();
    } finally {
      setLoading(false);
    }
  }, [load]);

  const upgrade = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {},
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url as string, "_blank");
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (e: any) {
      console.error("Upgrade error:", e?.message || e);
      toast({ title: "Error", description: "No se pudo iniciar el pago." });
    }
  }, []);

  const manage = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", { body: {} });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url as string, "_blank");
      } else {
        throw new Error("No se recibió el enlace del portal");
      }
    } catch (e: any) {
      console.error("Manage sub error:", e?.message || e);
      toast({ title: "Error", description: "No se pudo abrir el portal de pagos." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, loading, refresh, upgrade, manage };
}
