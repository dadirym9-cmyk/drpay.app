import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.drpay.app',
  appName: 'DRPay',
  webDir: 'out',
  server: {
    url: 'https://www.drpay.online',
    cleartext: false
  }
};

export default config;
