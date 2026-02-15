export const getStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result: { [key: string]: any }) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  }
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setStorage = async <T>(key: string, value: T): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
  localStorage.setItem(key, JSON.stringify(value));
};
