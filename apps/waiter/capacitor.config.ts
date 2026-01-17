import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cloud.pixpos.waiter',
  appName: 'PIXPOS Garson',
  webDir: 'dist',
  server: {
    // Production API URL - APK bu URL'e bağlanacak
    url: 'https://queen.pixpos.cloud/waiter',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A0A0A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0A',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Debug için açık
    appendUserAgent: 'PIXPOS-Waiter', // CloudFront bypass için
  },
};

export default config;
// APK Build trigger: Sat Jan 17 14:31:49 +03 2026
