import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Infinity } from 'lucide-react';
interface AIUsageIndicatorProps {
  usageCount: number;
  subscriptionStatus: string;
  isLoading?: boolean;
  onUpgradeClick?: () => void;
}
export const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({
  usageCount,
  subscriptionStatus,
  isLoading = false,
  onUpgradeClick
}) => {
  if (isLoading) {
    return <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Cargando uso...</span>
      </div>;
  }
  if (subscriptionStatus === 'pro') {
    return <div className="flex items-center justify-between p-3 bg-primary border border-primary rounded-lg">
        <div className="flex items-center gap-2">
          <Infinity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Uso ilimitado</span>
        </div>
        <Badge variant="secondary" className="bg-primary text-primary-foreground">
          Pro
        </Badge>
      </div>;
  }
  const progressPercentage = usageCount / 15 * 100;
  const isNearLimit = usageCount >= 12;
  const isAtLimit = usageCount >= 15;
  return <div className="space-y-2 my-0 py-[6px]">
      <div className="flex items-center justify-between py-[9px]">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground bg-[#f4f0ef]/0" />
          <span className="text-sm font-semibold">
            Uso mensual: {usageCount}/15
          </span>
        </div>
        {isNearLimit && !isAtLimit && <Badge variant="outline" className="text-xs">
            Casi al límite
          </Badge>}
        {isAtLimit && <Badge variant="destructive" className="text-xs">
            Límite alcanzado
          </Badge>}
      </div>
      
      <Progress value={progressPercentage} className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-yellow-500' : '[&>div]:bg-primary'}`} />
      
      {onUpgradeClick && <Button onClick={onUpgradeClick} size="sm" className="w-full bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-primary-foreground font-medium transition-all duration-300 hover:scale-105 py-0 my-[17px]">
          <Zap className="h-4 w-4 mr-2" />
          ¡Acceso Ilimitado!
        </Button>}
      
      {isAtLimit && <p className="text-xs text-muted-foreground mt-2">
          Actualiza a Pro para acceso ilimitado
        </p>}
    </div>;
};