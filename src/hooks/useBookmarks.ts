import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
}

export interface Folder {
  id: string;
  title: string;
  isOpen: boolean;
  color?: string;
  emoji?: string;
}

const defaultFolders: Folder[] = [
  { id: '1', title: 'Work', isOpen: false, color: '#3b82f6', emoji: '💼' },
  { id: '2', title: 'Social', isOpen: false, color: '#ec4899', emoji: '🌟' }
];

const defaultBookmarks: Bookmark[] = [
  { id: 'b1', title: 'GitHub', url: 'https://github.com', parentId: '1' },
  { id: 'b2', title: 'Stack Overflow', url: 'https://stackoverflow.com', parentId: '1' },
  { id: 'b3', title: 'Twitter', url: 'https://twitter.com', parentId: '2' },
  { id: 'b4', title: 'YouTube', url: 'https://youtube.com' }
];

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    getStorage<Bookmark[]>('bookmarks', defaultBookmarks).then(setBookmarks);
    getStorage<Folder[]>('folders', defaultFolders).then(setFolders);
  }, []);

  const addBookmark = async (bookmark: Omit<Bookmark, 'id'>) => {
    const newBookmark = { ...bookmark, id: crypto.randomUUID() };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    await setStorage('bookmarks', updated);
  };

  const addFolder = async (title: string, color?: string, emoji?: string) => {
    const newFolder = { id: crypto.randomUUID(), title, isOpen: false, color, emoji };
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
    const updated = folders.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f);
    setFolders(updated);
    await setStorage('folders', updated);
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

  return { bookmarks, folders, addBookmark, addFolder, updateFolder, toggleFolder, deleteBookmark, deleteFolder, moveBookmark };
};
