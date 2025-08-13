import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Masar",
  slug: "masar",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["ios", "android", "web"],
  web: {
    bundler: "metro"      // Expo SDK 53 uses Metro for web
  },
  
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: "Masar uses the camera to capture receipts.",
      NSPhotoLibraryUsageDescription: "Masar needs access to photos to attach receipts.",
      NSPhotoLibraryAddUsageDescription: "Allow Masar to save receipt images.",
      NSFaceIDUsageDescription: "Use Face ID to unlock Masar quickly."
    }
  },
  
  android: {
    adaptiveIcon: { 
      foregroundImage: "./assets/adaptive-icon.png", 
      backgroundColor: "#ffffff" 
    },
    permissions: ["CAMERA", "READ_MEDIA_IMAGES", "USE_BIOMETRIC"],
    // Allow http only in dev; prod should be https-only
    allowBackup: false
  },
  
  scheme: "masar",
  
  extra: {
    eas: {
      projectId: "your-project-id-here"
    }
  }
});
