import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d4cd8ebff4c34ee78bc9458623778f06',
  appName: 'pixel-edtech-v1',
  webDir: 'dist',
  server: {
    url: 'https://d4cd8ebf-f4c3-4ee7-8bc9-458623778f06.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      showSpinner: false
    }
  }
};

export default config;