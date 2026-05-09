import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  favicon?: string;
}

export interface Folder {
  id: string;
  title: string;
  isOpen?: boolean; // Mantenemos por compatibilidad, pero usaremos expandedFolderIds
  color?: string;
  emoji?: string;
}

const defaultFolders: Folder[] = [
  { id: '1', title: 'Work', color: '#3b82f6', emoji: '💼' },
  { id: '2', title: 'Social', color: '#ec4899', emoji: '🌟' }
];

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
    let favicon: string | undefined;
    const faviconUrl = getFaviconUrl(bookmark.url);
    
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

    const newBookmark: Bookmark = { ...bookmark, id: crypto.randomUUID(), favicon };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const addFolder = async (title: string, color?: string, emoji?: string) => {
    const newFolder = { id: crypto.randomUUID(), title, color, emoji };
    const updated = [...folders, newFolder];
    setFolders(updated);
    await setStorage('folders', updated);
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const updated = folders.map(f => f.id === id ? { ...f, ...updates } : f);
    setFolders(updated);
    await setStorage('folders', updated);
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
    toggleFolder, 
    deleteBookmark, 
    deleteFolder, 
    moveBookmark,
    refreshFavicons 
  };
};
