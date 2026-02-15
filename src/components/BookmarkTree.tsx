import React from 'react';
import { Folder, FolderOpen, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface BookmarkTreeProps {
  bookmarks: Bookmark[];
  folders: FolderType[];
  expandedFolderIds: string[];
  onToggleFolder: (id: string) => void;
  lang: Language;
}

export const BookmarkTree: React.FC<BookmarkTreeProps> = ({ 
  bookmarks, 
  folders, 
  expandedFolderIds,
  onToggleFolder,
  lang
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {folders.map((folder, idx) => {
        const isExpanded = expandedFolderIds.includes(folder.id);
        
        return (
          <motion.div 
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden h-fit transition-all duration-300 hover:border-white/20"
          >
            <button 
              onClick={() => onToggleFolder(folder.id)}
              className="flex items-center gap-3 w-full p-4 text-left font-bold text-white hover:bg-white/5 transition-all group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6', border: `1px solid ${folder.color || '#3b82f6'}40` }}
              >
                {folder.emoji ? folder.emoji : (isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />)}
              </div>
              <span className="flex-grow truncate tracking-tight text-lg">{folder.title}</span>
              <motion.div 
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="text-white/20"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="px-2 pb-3 pt-2 space-y-1">
                    {bookmarks.filter(b => b.parentId === folder.id).map(bookmark => (
                      <motion.a 
                        key={bookmark.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        href={bookmark.url}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white group"
                      >
                        <Globe size={16} className="shrink-0 text-white/20 group-hover:text-blue-400 transition-colors" />
                        <span className="truncate font-medium">{bookmark.title}</span>
                      </motion.a>
                    ))}
                    {bookmarks.filter(b => b.parentId === folder.id).length === 0 && (
                      <p className="text-[10px] text-white/20 italic text-center py-4 uppercase tracking-widest font-bold">{t('empty', lang)}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      
      {/* Marcadores sin carpeta */}
      {bookmarks.filter(b => !b.parentId).length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-2 h-fit lg:col-span-full"
        >
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
        </motion.div>
      )}
    </div>
  );
};
