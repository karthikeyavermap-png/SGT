import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore: Record<string, string> = {};

export const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return memoryStore[key] || null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        memoryStore[key] = value;
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore setItem failed', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        delete memoryStore[key];
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore deleteItem failed', e);
    }
  },
};

