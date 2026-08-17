import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.drpay.app', 
  appName: 'DRPay',
  webDir: 'out',
  server: {
    cleartext: true,
    allowNavigation: ['www.drpay.online', 'drpay.online', '://google.com']
  }
};

export default config;
