import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage utility for the app
// Note: In a production app, you'd want to use SecureStore for sensitive data
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.from(keys);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
};

// Alias for backward compatibility
export const secureStorage = storage;

// Storage keys that should be treated as sensitive (for future SecureStore implementation)
export const SECURE_KEYS: string[] = [
  'auth_token',
  'refresh_token',
  'user_credentials',
  'biometric_enabled',
  'push_token'
];

// Storage keys that can be stored in regular storage
export const REGULAR_KEYS: string[] = [
  'language',
  'theme',
  'onboarding_completed',
  'intro_seen',
  'user_preferences',
  'app_settings'
];

// Migration helper for future SecureStore implementation
export const migrateToSecureStorage = async (secureKeys: string[]) => {
  try {
    console.log('Migration to secure storage not yet implemented');
    // TODO: Implement when SecureStore is available
    return true;
  } catch (error) {
    console.error('Error migrating to secure storage:', error);
    return false;
  }
};