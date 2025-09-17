import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
const setMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};
const setCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};
const Subscription: React.FC = () => {
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    refresh,
    upgrade,
    manage
  } = useSubscription();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Plan Pro IA – Suscripción $8/mes";
    setMeta("description", "Suscríbete al Plan Pro de IA por $8/mes: acceso ilimitado a circulares semanales y planes de lección.");
    setCanonical(`${window.location.origin}/subscription`);
  }, []);
  return <div className="min-h-screen bg-[#555555]">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <button onClick={() => navigate(-1)} className="text-pixel-dark hover:text-pixel-orange mb-6 bg-[#5d5f61]">&larr; Volver</button>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Suscripción IA Pro</h1>
          <p className="text-pixel-muted mt-2">Obtén acceso ilimitado a las herramientas de IA por solo $8/mes.</p>
        </header>

        <Card className="border-pixel-dark/10 shadow-sm">
          <CardHeader className="bg-[#3e3e3e]">
            <CardTitle className="flex items-center justify-between">
              <span className="text-slate-50">Plan Pro</span>
              {subscribed ? <Badge className="bg-pixel-orange text-white">Activo</Badge> : <Badge variant="secondary">Disponible</Badge>}
            </CardTitle>
            <CardDescription className="text-slate-50">¡Ahorra tiempo, y esfuerzo. Accede a todo el poder de la IA!</CardDescription>
          </CardHeader>
          <CardContent className="bg-[#3e3e3e]">
            <div className="flex items-end gap-2 mb-4">
              <div className="text-3xl font-bold text-pixel-dark">$8</div>
              <div className="text-pixel-muted mb-1">/mes</div>
            </div>
            <ul className="list-disc list-inside text-pixel-dark/80 space-y-1 mb-6">
              <li>Generaciones ilimitadas de IA</li>
              <li>1 Cursos Pro Exclusivo / mes</li>
              <li className="">Boletin informativo mensual</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              {subscribed ? <Button onClick={manage} className="bg-pixel-dark text-white hover:bg-pixel-orange">Gestionar suscripción</Button> : <Button onClick={upgrade} className="text-white bg-[3383c5] bg-[#3383c5]">Actualizar a Pro</Button>}
              <Button variant="outline" onClick={refresh} className="border-pixel-dark hover:bg-pixel-dark text-slate-50">Actualizar estado</Button>
            </div>

            <Separator className="my-6" />
            <div className="text-sm text-pixel-muted">
              {loading && <span>Comprobando estado de suscripción…</span>}
              {!loading && subscribed && <span>
                  Tu plan: <strong>{subscriptionTier || "Pro"}</strong>
                  {subscriptionEnd ? ` • Renueva el ${new Date(subscriptionEnd).toLocaleDateString()}` : null}
                </span>}
              {!loading && !subscribed && <span className="text-zinc-50">No tienes una suscripción activa.</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Subscription;