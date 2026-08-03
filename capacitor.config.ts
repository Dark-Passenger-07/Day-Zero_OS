import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dayzeroos.app',
  appName: 'Day Zero OS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
