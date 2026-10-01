import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage utility using Expo SecureStore
 * Uses iOS Keychain and Android Keystore for encrypted storage
 */

const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export default secureStorage;
