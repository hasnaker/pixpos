import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cloud.pixpos.waiter',
  appName: 'PIXPOS Garson',
  webDir: 'dist',
  server: {
    // Production URL - APK bu URL'i yükleyecek
    url: 'https://queen.pixpos.cloud/waiter',
    cleartext: true,
    // User-Agent ekleme - CloudFront bypass için
    androidScheme: 'https',
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
    webContentsDebuggingEnabled: true,
    // User-Agent'ı burada da bırakalım
    appendUserAgent: 'PIXPOS-Waiter',
  },
};

export default config;
// APK Build trigger: Sat Jan 17 14:31:49 +03 2026
