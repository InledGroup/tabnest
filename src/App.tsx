import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Settings as SettingsIcon, Tv, Radio, ChevronUp, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchBar } from './components/SearchBar';
import { BookmarkTree } from './components/BookmarkTree';
import { NewsFeed } from './components/NewsFeed';
import { SettingsModal } from './components/SettingsModal';
import { TVTuner } from './components/TVTuner';
import { RadioTuner } from './components/RadioTuner';
import { LegalViewer } from './components/LegalViewer';
import { StartBanner } from './components/StartBanner';
import { useSettings } from './hooks/useSettings';
import { useNewsFeed } from './hooks/useNewsFeed';
import { useBookmarks } from './hooks/useBookmarks';
import { useTV } from './hooks/useTV';
import { useRadio } from './hooks/useRadio';
import { useUpdater } from './hooks/useUpdater';
import { t } from './utils/i18n';
import { DEFAULT_BOOKMARKS, DEFAULT_FOLDERS } from './utils/defaultBookmarks';

function App() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { updateUrl } = useUpdater('tabnest-2-26');
  const { 
    bookmarks, 
    folders, 
    expandedFolderIds,
    toggleFolder, 
    addBookmark, 
    addFolder,
    updateFolder,
    deleteBookmark,
    deleteFolder,
    moveBookmark,
    refreshFavicons,
    updateBookmark
  } = useBookmarks();
  const { 
    news, 
    sources, 
    loading: newsLoading, 
    toggleSource, 
    refreshNews, 
    addSource, 
    removeSource, 
    loadMore, 
    hasMore 
  } = useNewsFeed();
  const { channels: tvChannels, loading: tvLoading } = useTV();
  const { channels: radioChannels, loading: radioLoading } = useRadio();
  
  const [currentTime, setCurrentTime] = useState(moment());
  const [showSettings, setShowSettings] = useState(false);
  const [showTV, setShowTV] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [legalView, setLegalView] = useState<'disclaimer' | 'privacy' | 'terms' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    moment.locale(settings.language);
  }, [settings.language]);

  useEffect(() => {
    if (!settings.autoRotate || settings.backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      const currentIndex = settings.backgrounds.findIndex(bg => bg.id === settings.currentBackgroundId);
      const nextIndex = (currentIndex + 1) % settings.backgrounds.length;
      updateSettings({ currentBackgroundId: settings.backgrounds[nextIndex].id });
    }, settings.rotationInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.autoRotate, settings.rotationInterval, settings.backgrounds, settings.currentBackgroundId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().tz(settings.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.timezone]);

  const handleAddBookmark = (title: string, url: string, parentId?: string, shortcut?: string) => {
    addBookmark({ title, url, parentId, shortcut });
  };

  const handleAddFolder = (title: string, color?: string, emoji?: string, shortcut?: string) => {
    addFolder(title, color, emoji, shortcut);
  };

  if (settingsLoading) return null;

  const currentBackground = settings.backgrounds.find(bg => bg.id === settings.currentBackgroundId) || settings.backgrounds[0];
  const lang = settings.language;

  const effectiveBookmarks = settings.showDefaultBookmarks 
    ? [...DEFAULT_BOOKMARKS, ...bookmarks]
    : bookmarks;
  
  const effectiveFolders = settings.showDefaultBookmarks
    ? [...DEFAULT_FOLDERS, ...folders]
    : folders;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fondo */}
      <div
        key={currentBackground.id}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-1000"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${currentBackground.url})`,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex flex-col items-center p-8">
        {/* Banner de Actualización */}
        <AnimatePresence>
          {updateUrl && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4"
            >
              <div className="bg-blue-600/90 border border-blue-400/20 px-5 py-2.5 rounded-xl flex items-center gap-5">
                <span className="text-sm font-semibold text-white">{t('updateAvailable', lang)}</span>
                <a 
                  href={updateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  {t('download', lang)}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de Navegación Lateral (Izquierda) */}
        <div className="fixed bottom-8 left-5 flex flex-col gap-2 z-40">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollToTop}
                className="p-2 bg-black/30 rounded-full text-white/60 hover:text-white hover:bg-black/50 transition-colors"
                title="Subir"
              >
                <ChevronUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          <button 
            onClick={scrollToBottom}
            className="p-2 bg-black/30 rounded-full text-white/60 hover:text-white hover:bg-black/50 transition-colors"
            title="Bajar"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Botones Flotantes (Derecha) */}
        <div className="fixed top-5 right-5 flex flex-col gap-2 z-40">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-black/30 rounded-xl text-white/60 hover:text-white hover:bg-black/50 transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
          <button 
            onClick={() => setShowTV(true)}
            className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400/80 hover:text-blue-300 hover:bg-blue-500/25 transition-colors"
          >
            <Tv size={20} />
          </button>
          <button 
            onClick={() => setShowRadio(true)}
            className="p-2.5 bg-purple-500/15 rounded-xl text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/25 transition-colors"
          >
            <Radio size={20} />
          </button>
        </div>

        {/* Reloj */}
        {settings.showClock && (
          <div className="text-center mt-10 mb-10 select-none">
            <h1 className="text-8xl font-extralight tracking-tighter text-white/90">
              {currentTime.format('HH:mm')}
            </h1>
            <p className="text-xl text-white/60 font-light mt-1 capitalize">
              {currentTime.format('dddd, D [de] MMMM')}
            </p>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="w-full mb-10">
          <SearchBar 
            searchEngineId={settings.searchEngineId} 
            engines={settings.customSearchEngines}
            bookmarks={effectiveBookmarks}
            folders={effectiveFolders}
            lang={lang}
          />
        </div>

        {/* Marcadores */}
        <div className="w-full mb-14">
          <BookmarkTree 
            bookmarks={effectiveBookmarks}
            folders={effectiveFolders}
            expandedFolderIds={expandedFolderIds}
            onToggleFolder={toggleFolder}
            lang={lang}
          />
        </div>

        {/* Feed de Noticias */}
        <div className="w-full">
          <NewsFeed 
            news={news} 
            loading={newsLoading} 
            onRefresh={() => refreshNews(sources)} 
            onLoadMore={loadMore}
            hasMore={hasMore}
            lang={lang}
          />
        </div>

        {/* Banner de Start */}
        <StartBanner 
          isVisible={!settings.dismissedStartBanner}
          onDismiss={() => updateSettings({ dismissedStartBanner: true })}
        />

        {/* Footer Legal */}
        <footer className="w-full max-w-6xl mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 opacity-30 hover:opacity-80 transition-opacity">
          <p className="text-[10px] text-white/40">
            TabNest © 2026 • {t('tv', lang)} Data by TDTChannels
          </p>
          <div className="flex items-center gap-6 text-white">
            <button onClick={() => setLegalView('disclaimer')} className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
              {t('disclaimer', lang)}
            </button>
            <button onClick={() => setLegalView('privacy')} className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
              {t('privacy', lang)}
            </button>
            <button onClick={() => setLegalView('terms')} className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
              {t('terms', lang)}
            </button>
          </div>
        </footer>

        {/* Modales */}
        <AnimatePresence>
          {showSettings && (
            <SettingsModal 
              key="settings"
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowSettings(false)}
              newsSources={sources}
              onToggleSource={toggleSource}
              onAddSource={addSource}
              onRemoveSource={removeSource}
              bookmarks={bookmarks}
              folders={folders}
              onAddBookmark={handleAddBookmark}
              onAddFolder={handleAddFolder}
              onDeleteBookmark={deleteBookmark}
              onDeleteFolder={deleteFolder}
              onMoveBookmark={moveBookmark}
              onUpdateFolder={updateFolder}
              onUpdateBookmark={updateBookmark}
              onRefreshFavicons={refreshFavicons}
            />
          )}

          {showTV && (
            <TVTuner 
              key="tv"
              channels={tvChannels}
              loading={tvLoading}
              onClose={() => setShowTV(false)}
              lang={lang}
            />
          )}

          {showRadio && (
            <RadioTuner 
              key="radio"
              channels={radioChannels}
              loading={radioLoading}
              onClose={() => setShowRadio(false)}
              lang={lang}
            />
          )}

          {legalView && (
            <LegalViewer 
              key="legal"
              initialView={legalView}
              onClose={() => setLegalView(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
