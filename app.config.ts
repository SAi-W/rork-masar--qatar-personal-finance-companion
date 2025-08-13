import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Masar: Qatar Personal Finance Companion",
  slug: "masar-qatar-personal-finance",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "masar",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["ios", "android", "web"],
  web: {
    bundler: "metro"      // Expo SDK 53 uses Metro for web
  },
  
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#8B0000"
  },
  
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.rork.masar-qatar-personal-finance",
    buildNumber: "1",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "Masar needs access to your photos to upload receipts and documents",
      NSCameraUsageDescription: "Masar needs camera access to scan receipts and documents",
      NSCalendarsUsageDescription: "Masar needs calendar access to schedule reminders and track recurring expenses",
      NSLocationWhenInUseUsageDescription: "Masar needs location access to suggest nearby merchants and track spending patterns",
      CFBundleDisplayName: "Masar",
      CFBundleName: "Masar"
    }
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#8B0000"
    },
    package: "app.rork.masar.qatar.personal.finance",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "masar"
          }
        ],
        category: [
          "BROWSABLE",
          "DEFAULT"
        ]
      }
    ]
  },
  
  plugins: [
    "expo-router",
    [
      "expo-sqlite",
      {
        enableFTS: true,
        useSQLCipher: true,
        android: {
          enableFTS: false,
          useSQLCipher: false
        },
        ios: {
          customBuildFlags: [
            "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1"
          ]
        }
      }
    ],
    [
      "expo-document-picker",
      {
        iCloudContainerEnvironment: "Production"
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Masar needs access to your photos to upload receipts and documents."
      }
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Masar needs location access to suggest nearby merchants and track spending patterns."
      }
    ]
  ],
  
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  
  assetBundlePatterns: [
    "assets/**/*"
  ],
  
  extra: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://rork-masar-qatar-personal-finance.onrender.com",
    EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV || "production",
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "your-eas-project-id-here"
    }
  }
});
