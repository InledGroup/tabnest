import React, { useState } from 'react';
import { Folder, Globe, Trash2, ChevronRight, ChevronDown, Plus, X, Edit2, Check } from 'lucide-react';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface BookmarkManagerProps {
  bookmarks: Bookmark[];
  folders: FolderType[];
  onAddBookmark: (title: string, url: string, parentId?: string) => void;
  onAddFolder: (title: string, color?: string, emoji?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveBookmark: (id: string, newParentId?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<FolderType>) => void;
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
  lang
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<{type: 'bookmark' | 'folder', parentId?: string} | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', color: COLORS[0], emoji: '📂' });

  const toggleExpand = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFolderId) {
      onUpdateFolder(editingFolderId, {
        title: formData.title,
        color: formData.color,
        emoji: formData.emoji
      });
      setEditingFolderId(null);
    } else if (showAddForm?.type === 'bookmark') {
      if (formData.title && formData.url) {
        onAddBookmark(formData.title, formData.url, showAddForm.parentId);
      }
    } else if (showAddForm?.type === 'folder') {
      if (formData.title) {
        onAddFolder(formData.title, formData.color, formData.emoji);
      }
    }
    setShowAddForm(null);
    setFormData({ title: '', url: '', color: COLORS[0], emoji: '📂' });
  };

  const startEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setShowAddForm(null);
    setFormData({
      title: folder.title,
      url: '',
      color: folder.color || COLORS[0],
      emoji: folder.emoji || '📂'
    });
  };

  const renderBookmark = (bookmark: Bookmark) => (
    <div key={bookmark.id} className="flex items-center gap-2 py-1.5 pl-8 group hover:bg-white/5 rounded-lg px-2 transition-colors">
      <Globe size={14} className="text-white/40" />
      <span className="text-sm truncate flex-grow text-white/80">{bookmark.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">{t('bookmarks', lang)}</h4>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowAddForm({ type: 'bookmark' }); setEditingFolderId(null); }}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20"
          >
            <Plus size={12} /> {t('newBookmark', lang)}
          </button>
          <button 
            onClick={() => { setShowAddForm({ type: 'folder' }); setEditingFolderId(null); }}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20"
          >
            <Plus size={12} /> {t('newFolder', lang)}
          </button>
        </div>
      </div>

      {(showAddForm || editingFolderId) && (
        <form onSubmit={handleSubmit} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase">
              {editingFolderId ? t('editFolder', lang) : (showAddForm?.type === 'bookmark' ? t('newBookmark', lang) : t('newFolder', lang))}
            </span>
            <button type="button" onClick={() => { setShowAddForm(null); setEditingFolderId(null); }} className="text-white/40 hover:text-white transition-colors">
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
            {showAddForm?.type === 'bookmark' && (
              <input 
                type="text" 
                placeholder="URL (https://...)"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-full text-white placeholder-white/20 transition-all"
              />
            )}
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
            <Check size={16} /> {editingFolderId ? t('update', lang) : t('save', lang)}
          </button>
        </form>
      )}

      <div className="bg-black/20 rounded-2xl border border-white/5 p-2 max-h-80 overflow-y-auto custom-scrollbar">
        {folders.map(folder => (
          <div key={folder.id} className="mb-1">
            <div className={`flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-xl group transition-all ${editingFolderId === folder.id ? 'bg-blue-500/10 border border-blue-500/30' : 'border border-transparent'}`}>
              <button onClick={() => toggleExpand(folder.id)} className="text-white/40 hover:text-white transition-colors">
                {expandedFolders[folder.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-inner"
                style={{ backgroundColor: `${folder.color}20`, color: folder.color, border: `1px solid ${folder.color}30` }}
              >
                {folder.emoji || <Folder size={18} />}
              </div>
              <span className="text-sm font-semibold flex-grow ml-1 truncate text-white/90">{folder.title}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEditFolder(folder)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 transition-all"
                  title={t('editFolder', lang)}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => setShowAddForm({ type: 'bookmark', parentId: folder.id })}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-blue-400 transition-all"
                  title={t('addHere', lang)}
                >
                  <Plus size={14} />
                </button>
                <button 
                  onClick={() => onDeleteFolder(folder.id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                  title={t('delete', lang)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {expandedFolders[folder.id] && (
              <div className="ml-6 border-l border-white/10 mt-1 pl-2">
                {bookmarks.filter(b => b.parentId === folder.id).map(renderBookmark)}
                {bookmarks.filter(b => b.parentId === folder.id).length === 0 && (
                  <p className="text-[10px] text-white/20 italic pl-8 py-2 uppercase tracking-widest">{t('empty', lang)}</p>
                )}
              </div>
            )}
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
