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
  const rootBookmarks = bookmarks.filter(b => !b.parentId);

  const sortedItems = [
    ...folders.map(f => ({ type: 'folder' as const, item: f })),
    ...rootBookmarks.map(b => ({ type: 'bookmark' as const, item: b })),
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedItems.map((entry, idx) => {
          if (entry.type === 'folder') {
            const folder = entry.item;
            const isExpanded = expandedFolderIds.includes(folder.id);
            const folderBookmarks = bookmarks.filter(b => b.parentId === folder.id);

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
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform shrink-0"
                    style={{
                      backgroundColor: `${folder.color || '#3b82f6'}20`,
                      color: folder.color || '#3b82f6',
                      border: `1px solid ${folder.color || '#3b82f6'}40`,
                    }}
                  >
                    {folder.emoji ? folder.emoji : (isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="flex-grow truncate tracking-tight text-lg block">{folder.title}</span>
                    <span className="text-[10px] text-white/20 font-medium">{folderBookmarks.length} {t('channels', lang).toLowerCase()}</span>
                  </div>
                  {folder.shortcut && (
                    <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/40 shrink-0">
                      {folder.shortcut}
                    </kbd>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-white/20 shrink-0"
                  >
                    <ChevronDown size={16} />
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
                        {folderBookmarks.map(bookmark => {
                          let hostname = '';
                          try { hostname = new URL(bookmark.url).hostname; } catch {}
                          return (
                            <motion.a
                              key={bookmark.id}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              href={bookmark.url}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white group"
                            >
                              {bookmark.favicon ? (
                                <img src={bookmark.favicon} alt="" className="w-4 h-4 shrink-0 rounded-sm" />
                              ) : hostname ? (
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                  alt=""
                                  className="w-4 h-4 shrink-0 rounded-sm"
                                />
                              ) : (
                                <Globe size={16} className="text-white/20 shrink-0" />
                              )}
                              <span className="truncate font-medium flex-grow">{bookmark.title}</span>
                              {bookmark.shortcut && (
                                <kbd className="px-1 py-0.5 bg-white/5 rounded text-[8px] font-mono text-white/30 shrink-0">
                                  {bookmark.shortcut}
                                </kbd>
                              )}
                            </motion.a>
                          );
                        })}
                        {folderBookmarks.length === 0 && (
                          <p className="text-[10px] text-white/20 italic text-center py-4 uppercase tracking-widest font-bold">{t('empty', lang)}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          const bookmark = entry.item;
          let hostname = '';
          try { hostname = new URL(bookmark.url).hostname; } catch {}

          return (
            <motion.a
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              href={bookmark.url}
              className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-white/20 hover:bg-white/5 group"
            >
              {bookmark.favicon ? (
                <img src={bookmark.favicon} alt="" className="w-10 h-10 shrink-0 rounded-xl shadow-inner" />
              ) : hostname ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                  alt=""
                  className="w-10 h-10 shrink-0 rounded-xl shadow-inner"
                />
              ) : (
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
                  <Globe size={20} className="text-white/30" />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-blue-400 truncate transition-colors">{bookmark.title}</p>
                <p className="text-[10px] text-white/20 truncate">{hostname}</p>
              </div>
              {bookmark.shortcut && (
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/40 shrink-0">
                  {bookmark.shortcut}
                </kbd>
              )}
            </motion.a>
          );
        })}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <p className="text-white/40 font-medium">{t('empty', lang)}</p>
        </div>
      )}
    </div>
  );
};
