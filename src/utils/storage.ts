import browser from 'webextension-polyfill';

const hasExtensionApi = () => {
  try {
    return typeof browser !== 'undefined' && browser.storage && browser.storage.sync;
  } catch {
    return false;
  }
};

export const getStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  if (hasExtensionApi()) {
    try {
      const result = await browser.storage.sync.get([key]);
      return result[key] !== undefined ? result[key] as T : defaultValue;
    } catch (error) {
      console.warn('Extension storage sync failed, falling back to localStorage', error);
    }
  }
  
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setStorage = async <T>(key: string, value: T): Promise<void> => {
  if (hasExtensionApi()) {
    try {
      await browser.storage.sync.set({ [key]: value });
      return;
    } catch (error) {
      console.warn('Extension storage sync failed, falling back to localStorage', error);
    }
  }
  
  localStorage.setItem(key, JSON.stringify(value));
};
