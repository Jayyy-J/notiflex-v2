module.exports = {
  expo: {
    name: 'FlexNotify Scraper',
    slug: 'flexnotify-scraper-v2',
    version: '2.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0F1E',
    },
    android: {
      package: 'app.flexnotify.scraper2',
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0F1E',
      },
      permissions: [
        'INTERNET',
        'RECEIVE_BOOT_COMPLETED',
        'FOREGROUND_SERVICE',
        'WAKE_LOCK',
        'ACCESS_NETWORK_STATE',
        'BIND_ACCESSIBILITY_SERVICE',
      ],
    },
    plugins: [
      ['expo-build-properties', {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
        },
      }],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://notiflex-production.up.railway.app',
      eas: {
        projectId: "dcc70998-74cc-4ed7-9e83-c87bc048ee9f"
      }
    }
  }
}
