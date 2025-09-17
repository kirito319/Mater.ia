import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface AIUsageData {
  usageCount: number;
  canUseAI: boolean;
  isLoading: boolean;
  incrementUsage: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

export const useAIUsage = (): AIUsageData => {
  const { user } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchUsageData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get user's subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setSubscriptionStatus(profile.subscription_status || 'free');
      }

      // Get current month's usage
      const currentMonth = getCurrentMonthYear();
      const { data: usage } = await supabase
        .from('user_ai_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      setUsageCount(usage?.usage_count || 0);
    } catch (error) {
      console.error('Error fetching AI usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user) return;

    const currentMonth = getCurrentMonthYear();

    try {
      // Atomic increment via RPC
      const { data, error } = await supabase.rpc('increment_ai_usage', { p_month_year: currentMonth });
      if (error) throw error;
      if (typeof data === 'number') {
        setUsageCount(data);
      } else {
        // Fallback: refresh usage to stay consistent
        await fetchUsageData();
      }
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
    }
  };

  const refreshUsage = async () => {
    setIsLoading(true);
    await fetchUsageData();
  };

  useEffect(() => {
    fetchUsageData();
  }, [user]);

  const canUseAI = subscriptionStatus === 'pro' || usageCount < 15;

  return {
    usageCount,
    canUseAI,
    isLoading,
    incrementUsage,
    refreshUsage,
  };
};