import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Infinity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  onUpgradeSuccess?: () => void;
}
export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUsage,
  onUpgradeSuccess
}) => {
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: 'pro_plan',
          successUrl: window.location.origin + '/ai?upgraded=true',
          cancelUrl: window.location.origin + '/ai'
        }
      });
      if (error) throw error;
      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">¡Accede a todo el poder de la IA!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-muted-foreground">
              Has utilizado <span className="font-semibold text-foreground">{currentUsage}/15</span> generaciones de IA este mes
            </div>
          </div>

          <Card className="border-primary">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Plan Pro
              </CardTitle>
              <CardDescription>Acceso ILIMITADO a todas las herramientas IA para Docentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">$8</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Generaciones de IA ilimitadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cursos Pro Mensuales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Boletin Informativo Mensual</span>
                </div>
                <div className="flex items-center gap-2">
                  <Infinity className="h-4 w-4 text-primary" />
                  <span className="text-sm">Acceso Anticipado a Funciones</span>
                </div>
              </div>

              <Button onClick={handleUpgrade} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? 'Procesando...' : 'Actualizar a Pro'}
              </Button>
              
              <div className="text-center">
                <Button variant="ghost" onClick={onClose} className="text-sm">
                  Tal vez más tarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>;
};