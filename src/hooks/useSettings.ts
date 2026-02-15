import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

import type { Language } from '../utils/i18n';

export interface BackgroundImage {
  id: string;
  url: string;
  name: string;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
}

export interface Settings {
  backgrounds: BackgroundImage[];
  currentBackgroundId: string;
  autoRotate: boolean;
  rotationInterval: number;
  showClock: boolean;
  timezone: string;
  searchEngineId: string;
  customSearchEngines: SearchEngine[];
  language: Language;
  showDefaultBookmarks: boolean;
}

const defaultBackgrounds: BackgroundImage[] = [
  { id: '1', name: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070' },
  { id: '2', name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2071' },
  { id: '3', name: 'Spain', url: 'https://images.unsplash.com/photo-1614368741109-4aee24d0e226?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '4', name: 'Night', url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070' }
];

const defaultSearchEngines: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q=' }
];

const defaultSettings: Settings = {
  backgrounds: defaultBackgrounds,
  currentBackgroundId: '1',
  autoRotate: false,
  rotationInterval: 5,
  showClock: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  searchEngineId: 'google',
  customSearchEngines: defaultSearchEngines,
  language: 'es',
  showDefaultBookmarks: true
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStorage('settings', defaultSettings).then(savedSettings => {
      // Si por alguna razón la lista de motores está vacía, forzamos los preestablecidos
      if (!savedSettings.customSearchEngines || savedSettings.customSearchEngines.length === 0) {
        savedSettings.customSearchEngines = defaultSearchEngines;
        savedSettings.searchEngineId = 'google';
      }
      setSettings(savedSettings);
      setLoading(false);
    });
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await setStorage('settings', updated);
  };

  return { settings, updateSettings, loading };
};
