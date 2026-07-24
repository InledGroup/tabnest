import React from 'react';
import { Folder, FolderOpen, Globe, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedItems.map((entry) => {
          if (entry.type === 'folder') {
            const folder = entry.item;
            const isExpanded = expandedFolderIds.includes(folder.id);
            const folderBookmarks = bookmarks.filter(b => b.parentId === folder.id);

            return (
              <div
                key={folder.id}
                className="bg-white/5 border border-white/5 rounded-xl overflow-hidden h-fit hover:bg-white/8 transition-colors"
              >
                <button
                  onClick={() => onToggleFolder(folder.id)}
                  className="flex items-center gap-3 w-full p-3 text-left font-medium text-white/90 hover:bg-white/5 transition-colors group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      backgroundColor: `${folder.color || '#3b82f6'}12`,
                      color: folder.color || '#3b82f6',
                    }}
                  >
                    {folder.emoji ? folder.emoji : (isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="flex-grow truncate text-sm block">{folder.title}</span>
                    <span className="text-[10px] text-white/20">{folderBookmarks.length} {t('channels', lang).toLowerCase()}</span>
                  </div>
                  {folder.shortcut && (
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono text-white/30 shrink-0">
                      {folder.shortcut}
                    </kbd>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-white/20 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="px-2 pb-2 pt-1 space-y-0.5">
                        {folderBookmarks.map(bookmark => {
                          let hostname = '';
                          try { hostname = new URL(bookmark.url).hostname; } catch {}
                          return (
                            <a
                              key={bookmark.id}
                              href={bookmark.url}
                              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/60 hover:text-white/90"
                            >
                              {bookmark.favicon ? (
                                <img src={bookmark.favicon} alt="" className="w-3.5 h-3.5 shrink-0 rounded-sm" />
                              ) : hostname ? (
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                  alt=""
                                  className="w-3.5 h-3.5 shrink-0 rounded-sm"
                                />
                              ) : (
                                <Globe size={14} className="text-white/15 shrink-0" />
                              )}
                              <span className="truncate text-[13px] flex-grow">{bookmark.title}</span>
                              {bookmark.shortcut && (
                                <kbd className="px-1 py-0.5 bg-white/5 rounded text-[8px] font-mono text-white/20 shrink-0">
                                  {bookmark.shortcut}
                                </kbd>
                              )}
                            </a>
                          );
                        })}
                        {folderBookmarks.length === 0 && (
                          <p className="text-[10px] text-white/15 text-center py-3">{t('empty', lang)}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const bookmark = entry.item;
          let hostname = '';
          try { hostname = new URL(bookmark.url).hostname; } catch {}

          return (
            <a
              key={bookmark.id}
              href={bookmark.url}
              className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-colors hover:bg-white/8 group"
            >
              {bookmark.favicon ? (
                <img src={bookmark.favicon} alt="" className="w-8 h-8 shrink-0 rounded-lg" />
              ) : hostname ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                  alt=""
                  className="w-8 h-8 shrink-0 rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
                  <Globe size={16} className="text-white/20" />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-white/80 group-hover:text-white truncate transition-colors">{bookmark.title}</p>
                <p className="text-[10px] text-white/15 truncate">{hostname}</p>
              </div>
              {bookmark.shortcut && (
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono text-white/25 shrink-0">
                  {bookmark.shortcut}
                </kbd>
              )}
            </a>
          );
        })}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/5">
          <p className="text-white/30 text-sm">{t('empty', lang)}</p>
        </div>
      )}
    </div>
  );
};
