import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ajo.platform',
  appName: 'Ajo',
  webDir: 'dist',
  server: {
    // For development: point to your local dev server
    // Remove this for production builds
    url: 'http://localhost:5173',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#f7f4ef',
    scrollEnabled: false,
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    backgroundColor: '#f7f4ef',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#f7f4ef'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0e0e0e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
