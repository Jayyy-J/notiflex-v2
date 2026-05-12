import { NativeModules, Platform } from 'react-native';

const { ScraperModule } = NativeModules;

export const scraperBridge = {
  saveConfig: async (apiUrl: string, apiKey: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await ScraperModule.saveConfig(apiUrl, apiKey);
    } catch { return false; }
  },

  isAccessibilityEnabled: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await ScraperModule.isAccessibilityEnabled();
    } catch { return false; }
  },

  openAccessibilitySettings: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      await ScraperModule.openAccessibilitySettings();
    } catch {}
  },

  getConfig: async (): Promise<{ apiUrl: string; apiKey: string }> => {
    if (Platform.OS !== 'android') return { apiUrl: '', apiKey: '' };
    try {
      return await ScraperModule.getConfig();
    } catch { return { apiUrl: '', apiKey: '' }; }
  },
};
