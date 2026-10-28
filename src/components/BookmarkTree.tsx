import React, { useState } from 'react';
import { Folder as FolderIcon, Globe, LayoutGrid, AppWindow, RectangleHorizontal } from 'lucide-react';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import type { BookmarkView } from '../hooks/useSettings';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import { ScrollingText } from './ScrollingText';

interface BookmarkTreeProps {
  bookmarks: Bookmark[];
  folders: FolderType[];
  expandedFolderIds: string[];
  onToggleFolder: (id: string) => void;
  view: BookmarkView;
  onViewChange: (view: BookmarkView) => void;
  lang: Language;
}

const hostnameOf = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

const isWebUrl = (url: string): boolean => /^https?:\/\//i.test(url);

const faviconOf = (bookmark: Bookmark): string => {
  if (bookmark.favicon) return bookmark.favicon;
  const host = hostnameOf(bookmark.url);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : '';
};

/** Captura de página real (WordPress mShots, sin API key). */
const previewOf = (url: string): string =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=640`;

type Entry =
  | { kind: 'folder'; folder: FolderType }
  | { kind: 'bookmark'; bookmark: Bookmark };

export const BookmarkTree: React.FC<BookmarkTreeProps> = ({
  bookmarks,
  folders,
  expandedFolderIds,
  onToggleFolder,
  view,
  onViewChange,
  lang,
}) => {
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>({});

  const rootBookmarks = bookmarks.filter(b => !b.parentId);

  // Carpetas e individuales en una única lista: sin secciones separadas.
  const entries: Entry[] = [
    ...folders.map(f => ({ kind: 'folder' as const, folder: f })),
    ...rootBookmarks.map(b => ({ kind: 'bookmark' as const, bookmark: b })),
  ];

  const markPreviewFailed = (id: string) =>
    setFailedPreviews(prev => ({ ...prev, [id]: true }));

  const folderColor = (folder: FolderType) => folder.color || '#3b82f6';

  /* ------------------------------- icono/base ------------------------------ */

  const IconMedia: React.FC<{ entry: Entry; size: 'card' | 'icon' | 'dock' }> = ({ entry, size }) => {
    const box =
      size === 'card'
        ? 'w-full h-full'
        : size === 'icon'
          ? 'w-12 h-12 rounded-xl'
          : 'w-11 h-11 rounded-xl';

    if (entry.kind === 'folder') {
      const color = folderColor(entry.folder);
      return (
        <div
          className={`${box} flex items-center justify-center text-2xl`}
          style={{ backgroundColor: `${color}26`, boxShadow: `inset 0 0 0 1px ${color}40` }}
        >
          {entry.folder.emoji || <FolderIcon size={20} style={{ color }} />}
        </div>
      );
    }

    const src = faviconOf(entry.bookmark);
    const imgPad = size === 'card' ? 'p-4' : 'p-2';
    if (!src) {
      return (
        <div className={`${box} bg-white/8 flex items-center justify-center`}>
          <Globe size={size === 'card' ? 22 : 18} className="text-white/50" />
        </div>
      );
    }
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`${box} object-contain bg-white/8 ${imgPad}`}
        onError={e => {
          (e.target as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    );
  };

  /* --------------------------------- vistas -------------------------------- */

  const renderCard = (entry: Entry) => {
    const isFolder = entry.kind === 'folder';
    const id = isFolder ? entry.folder.id : entry.bookmark.id;
    const title = isFolder ? entry.folder.title : entry.bookmark.title;
    const shortcut = isFolder ? entry.folder.shortcut : entry.bookmark.shortcut;
    const url = isFolder ? '' : entry.bookmark.url;
    const expanded = isFolder && expandedFolderIds.includes(entry.folder.id);

    const media = (
      <div className="relative aspect-[16/10] overflow-hidden bg-white/6">
        {isFolder ? (
          <IconMedia entry={entry} size="card" />
        ) : isWebUrl(url) && !failedPreviews[id] ? (
          <>
            <img
              src={previewOf(url)}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => markPreviewFailed(id)}
            />
            <div className="absolute bottom-2 left-2 w-7 h-7 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <img src={faviconOf(entry.bookmark)} alt="" className="w-4 h-4 object-contain" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconMedia entry={entry} size="card" />
          </div>
        )}
      </div>
    );

    const footer = (
      <div className="flex items-center gap-2 px-3 py-2.5">
        {!isFolder && (
          <img src={faviconOf(entry.bookmark)} alt="" className="w-4 h-4 shrink-0 rounded-sm object-contain" />
        )}
        <ScrollingText className="text-[13px] font-medium text-white/85 group-hover:text-white flex-grow">
          {title}
        </ScrollingText>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 rounded border border-white/12 bg-white/8 text-[10px] font-mono text-white/55 shrink-0">
            {shortcut}
          </kbd>
        )}
      </div>
    );

    const className =
      'group block bg-black/35 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/25 hover:bg-black/45';

    if (isFolder) {
      return (
        <button
          key={id}
          onClick={() => onToggleFolder(id)}
          aria-expanded={expanded}
          className={`${className} text-left ${expanded ? 'border-white/35' : ''}`}
        >
          {media}
          {footer}
        </button>
      );
    }

    return (
      <a
        key={id}
        href={url}
        className={`${className} hover:-translate-y-0.5 transition-transform`}
      >
        {media}
        {footer}
      </a>
    );
  };

  const renderIconTile = (entry: Entry) => {
    const isFolder = entry.kind === 'folder';
    const id = isFolder ? entry.folder.id : entry.bookmark.id;
    const title = isFolder ? entry.folder.title : entry.bookmark.title;
    const url = isFolder ? '' : entry.bookmark.url;
    const expanded = isFolder && expandedFolderIds.includes(entry.folder.id);

    const inner = (
      <>
        <IconMedia entry={entry} size="icon" />
        <ScrollingText className="w-full text-[11px] leading-tight text-white/70 group-hover:text-white text-center">
          {title}
        </ScrollingText>
      </>
    );

    const className =
      'group flex flex-col items-center gap-2 p-2 rounded-xl transition-colors hover:bg-white/8';

    if (isFolder) {
      return (
        <button
          key={id}
          onClick={() => onToggleFolder(id)}
          aria-expanded={expanded}
          className={`${className} ${expanded ? 'bg-white/10 ring-1 ring-white/25' : ''}`}
        >
          {inner}
        </button>
      );
    }

    return (
      <a key={id} href={url} className={className}>
        {inner}
      </a>
    );
  };

  const renderDockItem = (entry: Entry) => {
    const isFolder = entry.kind === 'folder';
    const id = isFolder ? entry.folder.id : entry.bookmark.id;
    const title = isFolder ? entry.folder.title : entry.bookmark.title;
    const url = isFolder ? '' : entry.bookmark.url;
    const expanded = isFolder && expandedFolderIds.includes(entry.folder.id);

    const inner = <IconMedia entry={entry} size="dock" />;

    const className =
      'group relative flex items-center justify-center transition-transform duration-150 hover:-translate-y-1.5';

    const tooltip = (
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/85 border border-white/10 text-[11px] text-white/85 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {title}
      </span>
    );

    if (isFolder) {
      return (
        <button
          key={id}
          onClick={() => onToggleFolder(id)}
          aria-expanded={expanded}
          className={className}
        >
          {tooltip}
          <span
            className="rounded-xl transition-shadow"
            style={{ boxShadow: expanded ? '0 0 0 2px rgba(255,255,255,0.45)' : undefined }}
          >
            {inner}
          </span>
        </button>
      );
    }

    return (
      <a key={id} href={url} className={className}>
        {tooltip}
        {inner}
      </a>
    );
  };

  /* --------------------------------- ensamblado ----------------------------- */

  const renderEntry = (entry: Entry) => {
    const isFolder = entry.kind === 'folder';
    const expanded = isFolder && expandedFolderIds.includes(entry.folder.id);
    const children = isFolder
      ? bookmarks.filter(b => b.parentId === entry.folder.id).map(b => ({ kind: 'bookmark' as const, bookmark: b }))
      : [];

    const main =
      view === 'cards' ? renderCard(entry) : view === 'icons' ? renderIconTile(entry) : renderDockItem(entry);

    if (!isFolder || !expanded || view === 'dock') return main;

    // Carpeta desplegada: ocupa una fila nueva completa, así se ve claramente.
    return (
      <React.Fragment key={entry.folder.id}>
        {main}
        <div className="col-span-full rounded-xl border border-white/12 bg-black/30 backdrop-blur-md p-3">
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <span className="text-base leading-none">{entry.folder.emoji}</span>
            <span className="text-[13px] font-medium text-white/85">{entry.folder.title}</span>
            <span className="text-[11px] text-white/50">{children.length}</span>
          </div>
          {children.length === 0 ? (
            <p className="text-[12px] text-white/55 py-1">{t('empty', lang)}</p>
          ) : (
            <div
              className={
                view === 'cards'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
                  : 'grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5'
              }
            >
              {children.map(child =>
                view === 'cards' ? renderCard(child) : renderIconTile(child)
              )}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  const docked = entries;
  const openFolder = folders.find(f => expandedFolderIds.includes(f.id));
  const dockChildren = openFolder
    ? bookmarks.filter(b => b.parentId === openFolder.id)
    : [];

  const views: { id: BookmarkView; label: string; icon: React.ReactNode }[] = [
    { id: 'cards', label: t('viewCards', lang), icon: <LayoutGrid size={14} /> },
    { id: 'icons', label: t('viewIcons', lang), icon: <AppWindow size={14} /> },
    { id: 'dock', label: t('viewDock', lang), icon: <RectangleHorizontal size={14} /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-end mb-4">
        <div
          role="tablist"
          aria-label={t('favorites', lang)}
          className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl"
        >
          {views.map(v => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              title={v.label}
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === v.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {v.icon}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-14 rounded-xl border border-white/10 bg-black/25 backdrop-blur-sm">
          <p className="text-white/55 text-sm">{t('empty', lang)}</p>
        </div>
      )}

      {view === 'cards' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {entries.map(renderEntry)}
        </div>
      )}

      {view === 'icons' && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {entries.map(renderEntry)}
        </div>
      )}

      {view === 'dock' && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,calc(100vw-1.5rem))] flex flex-col items-center gap-2">
          {openFolder && (
            <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-white/12 bg-black/55 backdrop-blur-xl px-3 py-2">
              <div className="flex flex-nowrap items-center gap-1.5 w-max mx-auto">
                <span className="text-[11px] text-white/55 px-1.5 shrink-0">
                  {openFolder.emoji} {openFolder.title}
                </span>
                {dockChildren.map(child => renderEntry({ kind: 'bookmark', bookmark: child }))}
                {dockChildren.length === 0 && (
                  <span className="text-[11px] text-white/55 px-1.5 shrink-0">{t('empty', lang)}</span>
                )}
              </div>
            </div>
          )}
          <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-white/12 bg-black/55 backdrop-blur-xl px-3 py-2 shadow-2xl shadow-black/50">
            <div className="flex flex-nowrap items-center gap-1.5 w-max mx-auto">
              {docked.map(renderEntry)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
