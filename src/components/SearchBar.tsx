import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, CornerDownLeft, ArrowLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bookmark, Folder } from '../hooks/useBookmarks';
import type { SearchEngine } from '../hooks/useSettings';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import { ScrollingText } from './ScrollingText';

interface SearchBarProps {
  searchEngineId: string;
  engines: SearchEngine[];
  bookmarks: Bookmark[];
  folders: Folder[];
  lang: Language;
}

type ResultItem =
  | { type: 'folder'; folder: Folder; matchText: string }
  | { type: 'bookmark'; bookmark: Bookmark; matchText: string; folderName?: string }
  | { type: 'search'; query: string }
  | { type: 'ai-search'; query: string };

export const SearchBar: React.FC<SearchBarProps> = ({
  searchEngineId,
  engines,
  bookmarks,
  folders,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [folderContext, setFolderContext] = useState<Folder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const placeholder = folderContext
    ? `${folderContext.emoji || ''} ${folderContext.title} > ${t('searchBookmarks', lang)}`
    : t('searchBookmarks', lang);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.toLowerCase().trim();
    const shortcutMatches: ResultItem[] = [];
    const titleMatches: ResultItem[] = [];

    if (folderContext) {
      const folderBookmarks = bookmarks.filter(b => b.parentId === folderContext.id);

      if (!q) {
        folderBookmarks.forEach(b => {
          shortcutMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title, folderName: folderContext.title });
        });
        return shortcutMatches;
      }

      folderBookmarks.forEach(b => {
        const sc = b.shortcut?.toLowerCase();
        const isExactShortcut = sc === q;
        const isShortcutPrefix = sc?.startsWith(q) && q.length <= 2;
        const titleMatch = b.title.toLowerCase().includes(q);

        if (isExactShortcut || isShortcutPrefix) {
          shortcutMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title, folderName: folderContext.title });
        } else if (titleMatch) {
          titleMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title, folderName: folderContext.title });
        }
      });

      return [...shortcutMatches, ...titleMatches];
    }

    if (!q) {
      folders.forEach(f => {
        shortcutMatches.push({ type: 'folder', folder: f, matchText: f.title });
      });
      bookmarks.filter(b => !b.parentId).forEach(b => {
        shortcutMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title });
      });
      return shortcutMatches;
    }

    folders.forEach(f => {
      const sc = f.shortcut?.toLowerCase();
      const isExactShortcut = sc === q;
      const isShortcutPrefix = sc?.startsWith(q) && q.length <= 2;
      const titleMatch = f.title.toLowerCase().includes(q);

      if (isExactShortcut || isShortcutPrefix) {
        shortcutMatches.push({ type: 'folder', folder: f, matchText: f.title });
      } else if (titleMatch) {
        titleMatches.push({ type: 'folder', folder: f, matchText: f.title });
      }
    });

    bookmarks.forEach(b => {
      const sc = b.shortcut?.toLowerCase();
      const isExactShortcut = sc === q;
      const isShortcutPrefix = sc?.startsWith(q) && q.length <= 2;
      const titleMatch = b.title.toLowerCase().includes(q);

      if (isExactShortcut || isShortcutPrefix) {
        const folderName = b.parentId ? folders.find(f => f.id === b.parentId)?.title : undefined;
        shortcutMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title, folderName });
      } else if (titleMatch) {
        const folderName = b.parentId ? folders.find(f => f.id === b.parentId)?.title : undefined;
        titleMatches.push({ type: 'bookmark', bookmark: b, matchText: b.title, folderName });
      }
    });

    const all = [...shortcutMatches, ...titleMatches];
    if (q.length > 0) {
      all.push({ type: 'search', query: q });
      all.push({ type: 'ai-search', query: q });
    }

    return all;
  }, [query, bookmarks, folders, folderContext]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, folderContext]);

  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const executeResult = useCallback((item: ResultItem) => {
    switch (item.type) {
      case 'folder':
        setFolderContext(item.folder);
        setQuery('');
        break;
      case 'bookmark':
        window.location.href = item.bookmark.url;
        break;
      case 'search': {
        const engine = engines.find(e => e.id === searchEngineId) || engines[0];
        window.location.href = engine.url + encodeURIComponent(item.query);
        break;
      }
      case 'ai-search': {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(item.query)}&udm=50`;
        break;
      }
    }
  }, [engines, searchEngineId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          executeResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        if (folderContext) {
          setFolderContext(null);
          setQuery('');
        } else {
          setFocused(false);
          inputRef.current?.blur();
        }
        break;
      case 'Backspace':
        if (query === '' && folderContext) {
          setFolderContext(null);
        }
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[selectedIndex]) {
      executeResult(results[selectedIndex]);
    } else if (query.trim()) {
      const engine = engines.find(e => e.id === searchEngineId) || engines[0];
      window.location.href = engine.url + encodeURIComponent(query);
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-blue-400 underline">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const showResults = focused && (query || folderContext);

  return (
    <div className="w-full max-w-2xl mx-auto relative z-50">
      {folderContext && (
        <div className="flex items-center gap-2 mb-2 px-2">
          <button
            onClick={() => { setFolderContext(null); setQuery(''); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            {t('backToRoot', lang)}
          </button>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-white/60 text-xs font-medium">
            {folderContext.emoji} {folderContext.title}
          </span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
          className={`w-full px-6 py-3.5 pl-12 pr-10 bg-white/10 border rounded-xl text-white placeholder-white/40 outline-none transition-colors ${
            focused
              ? 'border-white/30'
              : 'border-white/10 hover:border-white/20'
          }`}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/70 transition-colors"
          size={20}
        />
        {query && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/20 text-[10px]">
            <CornerDownLeft size={12} />
          </div>
        )}
      </form>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            ref={resultsRef}
            className="absolute left-0 right-0 mt-1 bg-slate-900/95 border border-white/10 rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar"
          >
            {results.length === 0 && query && (
              <div className="p-6 text-center">
                <p className="text-white/30 text-sm">{t('noResults', lang)}</p>
                <p className="text-white/20 text-xs mt-1">{query}</p>
              </div>
            )}

            {results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const key = item.type === 'folder'
                ? `f-${item.folder.id}`
                : item.type === 'bookmark'
                  ? `b-${item.bookmark.id}`
                  : item.type === 'ai-search'
                    ? 'ai'
                    : 'search';

              if (item.type === 'folder') {
                const f = item.folder;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); executeResult(item); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{
                        backgroundColor: `${f.color || '#3b82f6'}15`,
                        color: f.color || '#3b82f6',
                      }}
                    >
                      {f.emoji || '📂'}
                    </div>
                    <div className="flex-grow min-w-0">
                      <ScrollingText className="text-sm font-medium text-white/90">{f.title}</ScrollingText>
                      <p className="text-[10px] text-white/25">{t('openFolder', lang)}</p>
                    </div>
                    {f.shortcut && (
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono text-white/30 shrink-0">
                        {f.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              }

              if (item.type === 'bookmark') {
                const b = item.bookmark;
                let hostname = '';
                try { hostname = new URL(b.url).hostname; } catch {}
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); executeResult(item); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {b.favicon ? (
                      <img src={b.favicon} alt="" className="w-4 h-4 shrink-0 rounded-sm" />
                    ) : hostname ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                        alt=""
                        className="w-4 h-4 shrink-0 rounded-sm"
                      />
                    ) : (
                      <Globe size={16} className="text-white/20 shrink-0" />
                    )}
                    <div className="flex-grow min-w-0">
                      <ScrollingText className="text-sm font-medium text-white/90">
                        {highlightMatch(b.title, query)}
                      </ScrollingText>
                      {item.folderName && (
                        <p className="text-[10px] text-white/25">{item.folderName}</p>
                      )}
                      {!item.folderName && (
                        <p className="text-[10px] text-white/15 truncate">{hostname}</p>
                      )}
                    </div>
                    {b.shortcut && (
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono text-white/30 shrink-0">
                        {b.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              }

              if (item.type === 'search') {
                const engine = engines.find(e => e.id === searchEngineId) || engines[0];
                return (
                  <div
                    key="search"
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); executeResult(item); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Search size={16} className="text-blue-400/80" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <ScrollingText className="text-sm font-medium text-white/90">
                        {t('webSearch', lang)}: <span className="text-blue-400/80">{item.query}</span>
                      </ScrollingText>
                      <p className="text-[10px] text-white/25">{engine.name}</p>
                    </div>
                    <CornerDownLeft size={12} className="text-white/15 shrink-0" />
                  </div>
                );
              }

              if (item.type === 'ai-search') {
                return (
                  <div
                    key="ai"
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); executeResult(item); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <span className="text-xs">AI</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <ScrollingText className="text-sm font-medium text-white/90">
                        IA: <span className="text-purple-400/80">{item.query}</span>
                      </ScrollingText>
                      <p className="text-[10px] text-white/25">Google AI Mode</p>
                    </div>
                    <CornerDownLeft size={12} className="text-white/15 shrink-0" />
                  </div>
                );
              }

              return null;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
