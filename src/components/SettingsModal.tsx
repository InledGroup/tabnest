import React from 'react';
import { X, Image as ImageIcon, Search, Rss, Trash2, Bookmark as BookmarkIcon, Languages, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Settings } from '../hooks/useSettings';
import type { NewsSource } from '../hooks/useNewsFeed';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { BookmarkManager } from './BookmarkManager';
import { t } from '../utils/i18n';

interface UpdaterProps {
  isChrome: boolean;
  updateUrl: string | null;
  latestVersion: string | null;
  currentVersion: string | null;
  isChecking: boolean;
  lastCheck: number | null;
  checkForUpdates: () => Promise<void>;
}

interface SettingsModalProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClose: () => void;
  newsSources: NewsSource[];
  onToggleSource: (url: string) => void;
  onAddSource: (name: string, url: string) => void;
  onRemoveSource: (url: string) => void;
  bookmarks: Bookmark[];
  folders: FolderType[];
  onAddBookmark: (title: string, url: string, parentId?: string, shortcut?: string) => void;
  onAddFolder: (title: string, color?: string, emoji?: string, shortcut?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveBookmark: (id: string, newParentId?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<FolderType>) => void;
  onUpdateBookmark?: (id: string, updates: Partial<Bookmark>) => void;
  onRefreshFavicons: () => Promise<void>;
  updater: UpdaterProps;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  onUpdate, 
  onClose,
  newsSources,
  onToggleSource,
  onAddSource,
  onRemoveSource,
  bookmarks,
  folders,
  onAddBookmark,
  onAddFolder,
  onDeleteBookmark,
  onDeleteFolder,
  onMoveBookmark,
  onUpdateFolder,
  onUpdateBookmark,
  onRefreshFavicons,
  updater
}) => {
  const lang = settings.language;
  const [isRefreshingFavicons, setIsRefreshingFavicons] = React.useState(false);

  const handleRefreshFavicons = async () => {
    setIsRefreshingFavicons(true);
    await onRefreshFavicons();
    setIsRefreshingFavicons(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-black/85 backdrop-blur-md border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold tracking-tight">{t('settings', lang)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-8 custom-scrollbar bg-black/20">
          {/* Idioma */}
          <section>
            <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
              <Languages size={16} /> {t('language', lang)}
            </h3>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit border border-white/5 mb-6">
              {(['es', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => onUpdate({ language: l })}
                  className={`px-5 py-1.5 rounded-lg font-medium text-xs transition-colors ${settings.language === l ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5 text-white/60'}`}
                >
                  {l === 'es' ? 'Español' : 'English'}
                </button>
              ))}
            </div>
          </section>

          {/* Gestión de Marcadores */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-medium text-blue-400/80 text-sm">
                <BookmarkIcon size={16} /> {t('bookmarks', lang)}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-white/55">{t('showDefaultBookmarks', lang)}</span>
                <button 
                  onClick={() => onUpdate({ showDefaultBookmarks: !settings.showDefaultBookmarks })}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.showDefaultBookmarks ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.showDefaultBookmarks ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <BookmarkManager 
              bookmarks={bookmarks}
              folders={folders}
              onAddBookmark={onAddBookmark}
              onAddFolder={onAddFolder}
              onDeleteBookmark={onDeleteBookmark}
              onDeleteFolder={onDeleteFolder}
              onMoveBookmark={onMoveBookmark}
              onUpdateFolder={onUpdateFolder}
              onUpdateBookmark={onUpdateBookmark}
              lang={lang}
            />
            
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white/80">{t('refreshFavicons', lang)}</p>
                <p className="text-[10px] text-white/60 mt-1 max-w-[200px]">{t('refreshFaviconsDesc', lang)}</p>
              </div>
              <button 
                onClick={handleRefreshFavicons}
                disabled={isRefreshingFavicons}
                className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isRefreshingFavicons ? 'bg-white/10 text-white/55' : 'bg-white/10 hover:bg-white/15 text-white/70'}`}
              >
                {isRefreshingFavicons ? '...' : t('download', lang)}
              </button>
            </div>
          </section>

          {/* Fondos */}
          <section>
            <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
              <ImageIcon size={16} /> {t('backgrounds', lang)}
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {settings.backgrounds.map((bg, idx) => (
                <motion.div 
                  key={bg.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.05) }}
                  onClick={() => onUpdate({ currentBackgroundId: bg.id })}
                  className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${settings.currentBackgroundId === bg.id ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                  {settings.backgrounds.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = settings.backgrounds.filter(b => b.id !== bg.id);
                        const nextId = settings.currentBackgroundId === bg.id ? updated[0].id : settings.currentBackgroundId;
                        onUpdate({ backgrounds: updated, currentBackgroundId: nextId });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md hover:bg-red-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  {settings.currentBackgroundId === bg.id && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-1 shadow-lg"><X className="rotate-45 text-white" size={12} /></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner text-white">
              <div>
                <label className="block text-[10px] font-medium text-white/55 mb-2">{t('addByUrl', lang)}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="new-bg-url"
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/45"
                    placeholder="https://..."
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-bg-url') as HTMLInputElement;
                      if (input.value) {
                        const newBg = { id: crypto.randomUUID(), name: 'Custom', url: input.value };
                        onUpdate({ backgrounds: [...settings.backgrounds, newBg] });
                        input.value = '';
                      }
                    }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    {t('save', lang)}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white/55 mb-2">{t('uploadImage', lang)}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const url = event.target?.result as string;
                        const newBg = { id: crypto.randomUUID(), name: file.name, url };
                        onUpdate({ backgrounds: [...settings.backgrounds, newBg] });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-white/60 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[11px] file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer transition-all"
                />
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">{t('autoRotate', lang)}</span>
                  <button 
                    onClick={() => onUpdate({ autoRotate: !settings.autoRotate })}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.autoRotate ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoRotate ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {settings.autoRotate && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center justify-between overflow-hidden"
                  >
                    <span className="text-xs text-white/55 font-medium">{t('interval', lang)}</span>
                    <input 
                      type="number" 
                      min="1"
                      value={settings.rotationInterval}
                      onChange={(e) => onUpdate({ rotationInterval: parseInt(e.target.value) || 1 })}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-500 text-white text-center transition-all"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* Motores de Búsqueda */}
          <section>
              <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
                <Search size={16} /> {t('searchEngines', lang)}
              </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {settings.customSearchEngines.map(engine => (
                <div key={engine.id} className="relative group">
                  <button
                    onClick={() => onUpdate({ searchEngineId: engine.id })}
                    className={`w-full p-4 rounded-2xl border text-left transition-all pr-12 ${settings.searchEngineId === engine.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                  >
                    <p className={`text-sm font-medium ${settings.searchEngineId === engine.id ? 'text-white' : 'text-white/80'}`}>{engine.name}</p>
                    <p className="text-[10px] text-white/55 truncate mt-1">{engine.url}</p>
                  </button>
                  {settings.customSearchEngines.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = settings.customSearchEngines.filter(eng => eng.id !== engine.id);
                        const nextId = settings.searchEngineId === engine.id ? updated[0].id : settings.searchEngineId;
                        onUpdate({ customSearchEngines: updated, searchEngineId: nextId });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/55 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
              <p className="text-[10px] font-medium text-white/55">{t('addCustomEngine', lang)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  id="engine-name"
                  placeholder={t('name', lang)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/45"
                />
                <input 
                  type="text" 
                  id="engine-url"
                  placeholder="URL (ej: https://.../search?q=)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/45"
                />
              </div>
              <button 
                onClick={() => {
                  const nameInput = document.getElementById('engine-name') as HTMLInputElement;
                  const urlInput = document.getElementById('engine-url') as HTMLInputElement;
                  if (nameInput.value && urlInput.value) {
                    const newEngine = { 
                      id: crypto.randomUUID(), 
                      name: nameInput.value, 
                      url: urlInput.value 
                    };
                    onUpdate({ customSearchEngines: [...settings.customSearchEngines, newEngine] });
                    nameInput.value = '';
                    urlInput.value = '';
                  }
                }}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                {t('save', lang)}
              </button>
            </div>
          </section>

          {/* Noticias */}
          <section>
              <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
                <Rss size={16} /> {t('rssSources', lang)}
              </h3>
            <div className="space-y-3 mb-6">
              {newsSources.map(source => (
                <div key={source.url} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/10">
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-white/80">{source.name}</p>
                    <p className="text-[10px] text-white/55 truncate mt-1">{source.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onToggleSource(source.url)}
                      className={`w-12 h-6 rounded-full transition-all relative ${source.enabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${source.enabled ? 'right-1' : 'left-1'}`} />
                    </button>
                    <button 
                      onClick={() => onRemoveSource(source.url)}
                      className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/55 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
              <p className="text-[10px] font-medium text-white/55">{t('addRssSource', lang)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  id="rss-name"
                  placeholder={t('name', lang)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/45"
                />
                <input 
                  type="text" 
                  id="rss-url"
                  placeholder="URL Feed RSS"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/45"
                />
              </div>
              <button 
                onClick={() => {
                  const nameInput = document.getElementById('rss-name') as HTMLInputElement;
                  const urlInput = document.getElementById('rss-url') as HTMLInputElement;
                  if (nameInput.value && urlInput.value) {
                    onAddSource(nameInput.value, urlInput.value);
                    nameInput.value = '';
                    urlInput.value = '';
                  }
                }}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                {t('save', lang)}
              </button>
            </div>
          </section>

          {/* Apariencia */}
          <section>
            <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
              {t('appearance', lang)}
            </h3>
            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">{t('fontSize', lang)}</span>
                  <span className="text-xs text-white/60 font-mono">{settings.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <p className="text-[10px] text-white/55 mt-1">{t('fontSizeDesc', lang)}</p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="block text-sm text-white/80 mb-2">{t('customCss', lang)}</label>
                <textarea 
                  value={settings.customCss}
                  onChange={(e) => onUpdate({ customCss: e.target.value })}
                  placeholder="/* tu CSS aquí */"
                  className="w-full h-32 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-500 text-white/70 transition-all placeholder-white/45 resize-none custom-scrollbar"
                />
                <p className="text-[10px] text-white/55 mt-1">{t('customCssDesc', lang)}</p>
              </div>
            </div>
          </section>

          {/* Actualizaciones — Solo Chrome */}
          {updater.isChrome && (
            <section>
              <h3 className="flex items-center gap-2 font-medium mb-4 text-blue-400/80 text-sm">
                <RefreshCw size={16} /> {t('updates', lang)}
              </h3>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{t('currentVersion', lang)}</span>
                  <span className="text-xs text-white/60 font-mono">{updater.currentVersion ?? '—'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{t('lastCheck', lang)}</span>
                  <span className="text-xs text-white/60">
                    {updater.lastCheck
                      ? (() => {
                          const diff = Date.now() - updater.lastCheck;
                          if (diff < 60_000) return t('justNow', lang);
                          const hours = Math.floor(diff / 3_600_000);
                          if (hours < 1) return t('justNow', lang);
                          return t('hoursAgo', lang).replace('{hours}', String(hours));
                        })()
                      : t('never', lang)}
                  </span>
                </div>

                {updater.updateUrl && updater.latestVersion && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-300 mb-2">
                      {t('updateAvailableV', lang).replace('{version}', updater.latestVersion)}
                    </p>
                    <a
                      href={updater.updateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      {t('download', lang)}
                    </a>
                  </div>
                )}

                {updater.currentVersion && !updater.updateUrl && !updater.isChecking && (
                  <p className="text-xs text-white/55">{t('upToDate', lang)}</p>
                )}

                <button
                  onClick={updater.checkForUpdates}
                  disabled={updater.isChecking}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    updater.isChecking
                      ? 'bg-white/10 text-white/55 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/15 text-white/70'
                  }`}
                >
                  {updater.isChecking ? t('checkingUpdates', lang) : t('checkUpdates', lang)}
                </button>
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
