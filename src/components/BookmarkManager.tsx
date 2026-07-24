import React, { useState } from 'react';
import { Folder, Globe, Trash2, ChevronRight, Plus, X, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { generateShortcut } from '../hooks/useBookmarks';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface BookmarkManagerProps {
  bookmarks: Bookmark[];
  folders: FolderType[];
  onAddBookmark: (title: string, url: string, parentId?: string, shortcut?: string) => void;
  onAddFolder: (title: string, color?: string, emoji?: string, shortcut?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveBookmark: (id: string, newParentId?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<FolderType>) => void;
  onUpdateBookmark?: (id: string, updates: Partial<Bookmark>) => void;
  lang: Language;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  bookmarks,
  folders,
  onAddBookmark,
  onAddFolder,
  onDeleteBookmark,
  onDeleteFolder,
  onMoveBookmark,
  onUpdateFolder,
  onUpdateBookmark,
  lang
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<{type: 'bookmark' | 'folder', parentId?: string} | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', color: COLORS[0], emoji: '📂', shortcut: '' });

  const existingShortcuts = [
    ...bookmarks.map(b => b.shortcut).filter(Boolean) as string[],
    ...folders.map(f => f.shortcut).filter(Boolean) as string[]
  ];

  const toggleExpand = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFolderId) {
      onUpdateFolder(editingFolderId, {
        title: formData.title,
        color: formData.color,
        emoji: formData.emoji,
        shortcut: formData.shortcut || undefined,
      });
      setEditingFolderId(null);
    } else if (editingBookmarkId) {
      onUpdateBookmark?.(editingBookmarkId, {
        title: formData.title,
        url: formData.url,
        shortcut: formData.shortcut || undefined,
      });
      setEditingBookmarkId(null);
    } else if (showAddForm?.type === 'bookmark') {
      if (formData.title && formData.url) {
        onAddBookmark(formData.title, formData.url, showAddForm.parentId, formData.shortcut || undefined);
      }
    } else if (showAddForm?.type === 'folder') {
      if (formData.title) {
        onAddFolder(formData.title, formData.color, formData.emoji, formData.shortcut || undefined);
      }
    }
    setShowAddForm(null);
    setFormData({ title: '', url: '', color: COLORS[0], emoji: '📂', shortcut: '' });
  };

  const startEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingBookmarkId(null);
    setShowAddForm(null);
    setFormData({
      title: folder.title,
      url: '',
      color: folder.color || COLORS[0],
      emoji: folder.emoji || '📂',
      shortcut: folder.shortcut || '',
    });
  };

  const startEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmarkId(bookmark.id);
    setEditingFolderId(null);
    setShowAddForm(null);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      color: COLORS[0],
      emoji: '📂',
      shortcut: bookmark.shortcut || '',
    });
  };

  const renderBookmark = (bookmark: Bookmark) => {
    let hostname = '';
    try {
      hostname = new URL(bookmark.url).hostname;
    } catch (e) {
      // Silently fail
    }

    return (
      <motion.div
        key={bookmark.id}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 py-1.5 pl-8 group hover:bg-white/5 rounded-lg px-2 transition-colors"
      >
        {bookmark.favicon ? (
          <img src={bookmark.favicon} alt="" className="w-3.5 h-3.5 shrink-0 rounded-sm" />
        ) : (
          hostname ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
              alt=""
              className="w-3.5 h-3.5 shrink-0 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null
        )}
        <Globe size={14} className={`${hostname && !bookmark.favicon ? 'hidden' : ''} text-white/40`} />
        <span className="text-sm truncate flex-grow text-white/80">{bookmark.title}</span>
        {bookmark.shortcut && (
          <kbd className="px-1 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/40 shrink-0">
            {bookmark.shortcut}
          </kbd>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditBookmark(bookmark)}
            className="p-1 hover:text-blue-400 transition-colors"
            title={t('shortcut', lang)}
          >
            <Edit2 size={12} />
          </button>
          {!bookmark.id.startsWith('def-') && (
            <>
              <select
                className="bg-white/10 border border-white/10 rounded text-[10px] px-1 py-0.5 outline-none focus:border-blue-500 text-white"
                value={bookmark.parentId || ''}
                onChange={(e) => onMoveBookmark(bookmark.id, e.target.value || undefined)}
              >
                <option value="" className="bg-slate-900">{t('root', lang)}</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900">{f.title}</option>
                ))}
              </select>
              <button
                onClick={() => onDeleteBookmark(bookmark.id)}
                className="p-1 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">{t('bookmarks', lang)}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddForm({ type: 'bookmark' }); setEditingFolderId(null); setEditingBookmarkId(null); }}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20"
          >
            <Plus size={12} /> {t('newBookmark', lang)}
          </button>
          <button
            onClick={() => { setShowAddForm({ type: 'folder' }); setEditingFolderId(null); setEditingBookmarkId(null); }}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20"
          >
            <Plus size={12} /> {t('newFolder', lang)}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(showAddForm || editingFolderId || editingBookmarkId) && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60 uppercase">
                {editingFolderId ? t('editFolder', lang) : editingBookmarkId ? t('shortcut', lang) : (showAddForm?.type === 'bookmark' ? t('newBookmark', lang) : t('newFolder', lang))}
              </span>
              <button type="button" onClick={() => { setShowAddForm(null); setEditingFolderId(null); setEditingBookmarkId(null); }} className="text-white/40 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                placeholder={t('title', lang)}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-full text-white placeholder-white/20 transition-all"
              />
              {(showAddForm?.type === 'bookmark' || editingBookmarkId) && (
                <input
                  type="text"
                  placeholder="URL (https://...)"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-full text-white placeholder-white/20 transition-all"
                />
              )}
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase mb-1.5 block">{t('shortcut', lang)}</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.shortcut}
                    onChange={e => setFormData({...formData, shortcut: e.target.value.toLowerCase()})}
                    placeholder={formData.title ? generateShortcut(formData.title, existingShortcuts) : '...'}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-24 text-white placeholder-white/20 transition-all font-mono text-center"
                  />
                  {formData.shortcut && (
                    <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs font-mono text-white/50">
                      {formData.shortcut}
                    </kbd>
                  )}
                </div>
                <p className="text-[9px] text-white/20 mt-1">{t('shortcutDesc', lang)}</p>
              </div>
              {(showAddForm?.type === 'folder' || editingFolderId) && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-white/30 uppercase mb-1.5 block">{t('emojiLabel', lang)}</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.emoji}
                        onChange={e => setFormData({...formData, emoji: e.target.value})}
                        placeholder="📂"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-full text-center text-xl transition-all"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-[10px] font-bold text-white/30 uppercase mb-1.5 block">{t('color', lang)}</label>
                      <div className="grid grid-cols-4 gap-1">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({...formData, color: c})}
                            className={`w-full aspect-square rounded-lg border-2 transition-all ${formData.color === c ? 'border-white scale-105 shadow-lg' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
              <Check size={16} /> {editingFolderId || editingBookmarkId ? t('update', lang) : t('save', lang)}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-black/20 rounded-2xl border border-white/5 p-2 max-h-80 overflow-y-auto custom-scrollbar">
        {folders.map(folder => (
          <div key={folder.id} className="mb-1">
            <div className={`flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-xl group transition-all ${editingFolderId === folder.id ? 'bg-blue-500/10 border border-blue-500/30' : 'border border-transparent'}`}>
              <button onClick={() => toggleExpand(folder.id)} className="text-white/40 hover:text-white transition-colors">
                <motion.div animate={{ rotate: expandedFolders[folder.id] ? 90 : 0 }}>
                  <ChevronRight size={16} />
                </motion.div>
              </button>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-inner"
                style={{ backgroundColor: `${folder.color}20`, color: folder.color, border: `1px solid ${folder.color}30` }}
              >
                {folder.emoji || <Folder size={18} />}
              </div>
              <span className="text-sm font-semibold flex-grow ml-1 truncate text-white/90">{folder.title}</span>
              {folder.shortcut && (
                <kbd className="px-1 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/40 shrink-0">
                  {folder.shortcut}
                </kbd>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!folder.id.startsWith('def-') && (
                  <button
                    onClick={() => startEditFolder(folder)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 transition-all"
                    title={t('editFolder', lang)}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm({ type: 'bookmark', parentId: folder.id })}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 transition-all"
                  title={t('addHere', lang)}
                >
                  <Plus size={14} />
                </button>
                {!folder.id.startsWith('def-') && (
                  <button
                    onClick={() => onDeleteFolder(folder.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                    title={t('delete', lang)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedFolders[folder.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 border-l border-white/10 mt-1 pl-2 overflow-hidden"
                >
                  {bookmarks.filter(b => b.parentId === folder.id).map(renderBookmark)}
                  {bookmarks.filter(b => b.parentId === folder.id).length === 0 && (
                    <p className="text-[10px] text-white/20 italic pl-8 py-2 uppercase tracking-widest">{t('empty', lang)}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-[10px] font-bold text-white/20 uppercase px-3 mb-2 tracking-widest">{t('empty', lang)}</p>
          {bookmarks.filter(b => !b.parentId).map(renderBookmark)}
        </div>
      </div>
    </div>
  );
};
