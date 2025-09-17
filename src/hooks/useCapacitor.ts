import { useState, useEffect } from 'react';

export const useCapacitor = () => {
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    const checkCapacitor = async () => {
      // Check if running in Capacitor
      const capacitorExists = (window as any).Capacitor !== undefined;
      setIsCapacitor(capacitorExists);

      if (capacitorExists) {
        const { Capacitor } = await import('@capacitor/core');
        const currentPlatform = Capacitor.getPlatform();
        setPlatform(currentPlatform as 'web' | 'ios' | 'android');
      }
    };

    checkCapacitor();
  }, []);

  return {
    isCapacitor,
    platform,
    isNative: platform !== 'web',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
  };
};