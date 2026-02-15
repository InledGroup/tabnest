import React from 'react';
import { X, Image as ImageIcon, Search, Rss, Trash2, Bookmark as BookmarkIcon, Languages } from 'lucide-react';
import type { Settings } from '../hooks/useSettings';
import type { NewsSource } from '../hooks/useNewsFeed';
import type { Bookmark, Folder as FolderType } from '../hooks/useBookmarks';
import { BookmarkManager } from './BookmarkManager';
import { t } from '../utils/i18n';

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
  onAddBookmark: (title: string, url: string, parentId?: string) => void;
  onAddFolder: (title: string, color?: string, emoji?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveBookmark: (id: string, newParentId?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<FolderType>) => void;
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
  onUpdateFolder
}) => {
  const lang = settings.language;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold tracking-tight">{t('settings', lang)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-8 custom-scrollbar bg-black/20">
          {/* Idioma */}
          <section>
            <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400 text-sm uppercase tracking-widest">
              <Languages size={18} /> {t('language', lang)}
            </h3>
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
              {(['es', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => onUpdate({ language: l })}
                  className={`px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all ${settings.language === l ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white/5 text-white/40'}`}
                >
                  {l === 'es' ? 'Español' : 'English'}
                </button>
              ))}
            </div>
          </section>

          {/* Gestión de Marcadores */}
          <section>
            <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400 text-sm uppercase tracking-widest">
              <BookmarkIcon size={18} /> {t('bookmarks', lang)}
            </h3>
            <BookmarkManager 
              bookmarks={bookmarks}
              folders={folders}
              onAddBookmark={onAddBookmark}
              onAddFolder={onAddFolder}
              onDeleteBookmark={onDeleteBookmark}
              onDeleteFolder={onDeleteFolder}
              onMoveBookmark={onMoveBookmark}
              onUpdateFolder={onUpdateFolder}
              lang={lang}
            />
          </section>

          {/* Fondos */}
          <section>
            <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400 text-sm uppercase tracking-widest">
              <ImageIcon size={18} /> {t('backgrounds', lang)}
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {settings.backgrounds.map(bg => (
                <div 
                  key={bg.id}
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
                </div>
              ))}
            </div>

            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t('addByUrl', lang)}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="new-bg-url"
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/20"
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
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t('uploadImage', lang)}</label>
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
                  className="w-full text-xs text-white/40 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer transition-all"
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
                  <div className="flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{t('interval', lang)}</span>
                    <input 
                      type="number" 
                      min="1"
                      value={settings.rotationInterval}
                      onChange={(e) => onUpdate({ rotationInterval: parseInt(e.target.value) || 1 })}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-500 text-white text-center transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Motores de Búsqueda */}
          <section>
            <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400 text-sm uppercase tracking-widest">
              <Search size={18} /> {t('searchEngines', lang)}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {settings.customSearchEngines.map(engine => (
                <div key={engine.id} className="relative group">
                  <button
                    onClick={() => onUpdate({ searchEngineId: engine.id })}
                    className={`w-full p-4 rounded-2xl border text-left transition-all pr-12 ${settings.searchEngineId === engine.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                  >
                    <p className={`text-sm font-bold capitalize ${settings.searchEngineId === engine.id ? 'text-blue-400' : 'text-white/80'}`}>{engine.name}</p>
                    <p className="text-[10px] text-white/20 truncate mt-1">{engine.url}</p>
                  </button>
                  {settings.customSearchEngines.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = settings.customSearchEngines.filter(eng => eng.id !== engine.id);
                        const nextId = settings.searchEngineId === engine.id ? updated[0].id : settings.searchEngineId;
                        onUpdate({ customSearchEngines: updated, searchEngineId: nextId });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('addCustomEngine', lang)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  id="engine-name"
                  placeholder={t('name', lang)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/20"
                />
                <input 
                  type="text" 
                  id="engine-url"
                  placeholder="URL (ej: https://.../search?q=)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/20"
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
            <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400 text-sm uppercase tracking-widest">
              <Rss size={18} /> {t('rssSources', lang)}
            </h3>
            <div className="space-y-3 mb-6">
              {newsSources.map(source => (
                <div key={source.url} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/10">
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-white/80">{source.name}</p>
                    <p className="text-[10px] text-white/20 truncate mt-1">{source.url}</p>
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
                      className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('addRssSource', lang)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  id="rss-name"
                  placeholder={t('name', lang)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/20"
                />
                <input 
                  type="text" 
                  id="rss-url"
                  placeholder="URL Feed RSS"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white transition-all placeholder-white/20"
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
        </div>
      </div>
    </div>
  );
};
