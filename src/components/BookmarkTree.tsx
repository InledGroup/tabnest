import React from 'react';
import { Folder, FolderOpen, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface BookmarkTreeProps {
  bookmarks: Bookmark[];
  folders: FolderType[];
  onToggleFolder: (id: string) => void;
  lang: Language;
}

export const BookmarkTree: React.FC<BookmarkTreeProps> = ({ 
  bookmarks, 
  folders, 
  onToggleFolder,
  lang
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {folders.map(folder => (
        <div key={folder.id} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden h-fit transition-all duration-300 hover:border-white/20">
          <button 
            onClick={() => onToggleFolder(folder.id)}
            className="flex items-center gap-3 w-full p-4 text-left font-bold text-white hover:bg-white/5 transition-all group"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6', border: `1px solid ${folder.color || '#3b82f6'}40` }}
            >
              {folder.emoji ? folder.emoji : (folder.isOpen ? <FolderOpen size={20} /> : <Folder size={20} />)}
            </div>
            <span className="flex-grow truncate tracking-tight text-lg">{folder.title}</span>
            <div className="text-white/20">
              {folder.isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </button>
          
          {folder.isOpen && (
            <div className="px-2 pb-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-white/5 pt-2">
              {bookmarks.filter(b => b.parentId === folder.id).map(bookmark => (
                <a 
                  key={bookmark.id}
                  href={bookmark.url}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white group"
                >
                  <Globe size={16} className="shrink-0 text-white/20 group-hover:text-blue-400 transition-colors" />
                  <span className="truncate font-medium">{bookmark.title}</span>
                </a>
              ))}
              {bookmarks.filter(b => b.parentId === folder.id).length === 0 && (
                <p className="text-[10px] text-white/20 italic text-center py-4 uppercase tracking-widest font-bold">{t('empty', lang)}</p>
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* Marcadores sin carpeta */}
      {bookmarks.filter(b => !b.parentId).length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-2 h-fit lg:col-span-full">
           <p className="text-[10px] font-bold text-white/20 uppercase px-3 mb-2 tracking-widest">{t('empty', lang)}</p>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {bookmarks.filter(b => !b.parentId).map(bookmark => (
              <a 
                key={bookmark.id}
                href={bookmark.url}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white group border border-transparent hover:border-white/10 bg-white/5"
              >
                <Globe size={16} className="shrink-0 text-white/20 group-hover:text-blue-400 transition-colors" />
                <span className="truncate font-medium">{bookmark.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
