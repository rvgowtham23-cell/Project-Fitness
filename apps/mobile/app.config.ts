import type { ExpoConfig } from 'expo/config';

// app.config.ts (not app.json) so EXPO_PUBLIC_ env vars and future per-environment
// overrides (dev/staging/prod API URLs, EAS build profiles) can be computed in code.
const config: ExpoConfig = {
  name: 'Fitness AI',
  slug: 'fitness-ai-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'fitnessai',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fitnessai.mobile',
    infoPlist: {
      NSCameraUsageDescription: 'Used to photograph meals for AI nutrition estimation and to scan barcodes.',
      NSMicrophoneUsageDescription: 'Used for voice workout logging.',
      NSPhotoLibraryUsageDescription: 'Used to pick meal photos from your library.',
    },
  },
  android: {
    package: 'com.fitnessai.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#14161A',
    },
    permissions: ['CAMERA', 'RECORD_AUDIO'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to log meals and scan barcodes.',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone for voice workout logging.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos to log meals from your library.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#14161A',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  // Runtime config (API base URL, etc.) is read from EXPO_PUBLIC_* env vars directly
  // via process.env in src/lib/config.ts — nothing secret belongs in `extra`, since it
  // ships inside the client bundle same as any other config here.
};

export default config;
