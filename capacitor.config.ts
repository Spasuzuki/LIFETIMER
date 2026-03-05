import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spasuzuking.lifetimer',
  appName: 'LIFE TIMER',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
