import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  favicon?: string;
  shortcut?: string;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export interface Folder {
  id: string;
  title: string;
  isOpen?: boolean;
  color?: string;
  emoji?: string;
  shortcut?: string;
}

const defaultFolders: Folder[] = [
  { id: '1', title: 'Work', color: '#3b82f6', emoji: '💼' },
  { id: '2', title: 'Social', color: '#ec4899', emoji: '🌟' }
];

export const generateShortcut = (name: string, existingShortcuts: string[]): string => {
  const lower = name.toLowerCase().trim();
  const taken = new Set(existingShortcuts);

  const tryShortcut = (s: string): string | null => {
    return taken.has(s) ? null : s;
  };

  // 1. Primera letra
  const first = lower[0];
  if (first) {
    const r = tryShortcut(first);
    if (r) return r;
  }

  // 2. Dos primeras letras
  if (lower.length >= 2) {
    const two = lower.slice(0, 2);
    const r = tryShortcut(two);
    if (r) return r;
  }

  // 3. Primera letra + siguiente consonante
  if (first) {
    const vowels = new Set('aeiouáéíóú');
    const consonant = lower.split('').find(c => c !== first && !vowels.has(c) && /[a-záéíóú]/.test(c));
    if (consonant) {
      const combo = first + consonant;
      const r = tryShortcut(combo);
      if (r) return r;
    }
  }

  // 4. Dos primeras letras + número
  if (lower.length >= 2) {
    for (let i = 2; i <= 9; i++) {
      const candidate = lower.slice(0, 2) + i;
      const r = tryShortcut(candidate);
      if (r) return r;
    }
  }

  // 5. Fallback: primera letra + 2, 3, ...
  if (first) {
    for (let i = 2; i <= 99; i++) {
      const candidate = first + i;
      const r = tryShortcut(candidate);
      if (r) return r;
    }
  }

  return '';
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);

  useEffect(() => {
    getStorage<Bookmark[]>('bookmarks', []).then(setBookmarks);
    getStorage<Folder[]>('folders', defaultFolders).then(setFolders);
    getStorage<string[]>('expandedFolderIds', []).then(setExpandedFolderIds);
  }, []);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return null;
    }
  };

  const refreshFavicons = async () => {
    const updated = await Promise.all(bookmarks.map(async (b) => {
      const faviconUrl = getFaviconUrl(b.url);
      if (faviconUrl) {
        try {
          const response = await fetch(faviconUrl);
          const blob = await response.blob();
          return new Promise<Bookmark>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ ...b, favicon: reader.result as string });
            };
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error(`Error fetching favicon for ${b.url}:`, e);
          return b;
        }
      }
      return b;
    }));
    
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'favicon'>) => {
    const url = normalizeUrl(bookmark.url);
    let favicon: string | undefined;
    const faviconUrl = getFaviconUrl(url);
    
    if (faviconUrl) {
      try {
        const response = await fetch(faviconUrl);
        const blob = await response.blob();
        favicon = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('Error fetching favicon:', e);
      }
    }

    const existingShortcuts = [
      ...bookmarks.map(b => b.shortcut).filter(Boolean) as string[],
      ...folders.map(f => f.shortcut).filter(Boolean) as string[]
    ];
    const shortcut = bookmark.shortcut || generateShortcut(bookmark.title, existingShortcuts);

    const newBookmark: Bookmark = { ...bookmark, url, id: crypto.randomUUID(), favicon, shortcut };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const addFolder = async (title: string, color?: string, emoji?: string, shortcut?: string) => {
    const existingShortcuts = [
      ...bookmarks.map(b => b.shortcut).filter(Boolean) as string[],
      ...folders.map(f => f.shortcut).filter(Boolean) as string[]
    ];
    const resolvedShortcut = shortcut || generateShortcut(title, existingShortcuts);

    const newFolder: Folder = { id: crypto.randomUUID(), title, color, emoji, shortcut: resolvedShortcut };
    const updated = [...folders, newFolder];
    setFolders(updated);
    await setStorage('folders', updated);
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const updated = folders.map(f => f.id === id ? { ...f, ...updates } : f);
    setFolders(updated);
    await setStorage('folders', updated);
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    const normalized = updates.url ? { ...updates, url: normalizeUrl(updates.url) } : updates;
    const updated = bookmarks.map(b => b.id === id ? { ...b, ...normalized } : b);
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const toggleFolder = async (id: string) => {
    const isExpanded = expandedFolderIds.includes(id);
    const updatedIds = isExpanded 
      ? expandedFolderIds.filter(fid => fid !== id)
      : [...expandedFolderIds, id];
    
    setExpandedFolderIds(updatedIds);
    await setStorage('expandedFolderIds', updatedIds);
  };

  const deleteBookmark = async (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const deleteFolder = async (id: string) => {
    const updatedFolders = folders.filter(f => f.id !== id);
    const updatedBookmarks = bookmarks.filter(b => b.parentId !== id);
    setFolders(updatedFolders);
    setBookmarks(updatedBookmarks);
    await setStorage('folders', updatedFolders);
    await setStorage('bookmarks', updatedBookmarks);
  };

  const moveBookmark = async (bookmarkId: string, newParentId?: string) => {
    const updated = bookmarks.map(b => 
      b.id === bookmarkId ? { ...b, parentId: newParentId } : b
    );
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  return { 
    bookmarks, 
    folders, 
    expandedFolderIds,
    addBookmark, 
    addFolder, 
    updateFolder,
    updateBookmark,
    toggleFolder, 
    deleteBookmark, 
    deleteFolder, 
    moveBookmark,
    refreshFavicons 
  };
};
