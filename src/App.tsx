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
import { useSettings } from './hooks/useSettings';
import { useNewsFeed } from './hooks/useNewsFeed';
import { useBookmarks } from './hooks/useBookmarks';
import { useTV } from './hooks/useTV';
import { useRadio } from './hooks/useRadio';
import { useRadioPlayer } from './hooks/useRadioPlayer';
import { useUpdater } from './hooks/useUpdater';
import { t } from './utils/i18n';
import { DEFAULT_BOOKMARKS, DEFAULT_FOLDERS } from './utils/defaultBookmarks';
import { ensureViewerFrameRule } from './utils/frameHeaders';

function App() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const updater = useUpdater();
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
  const radioPlayer = useRadioPlayer();
  const { audioRef: radioAudioRef, plainAudioRef: radioPlainAudioRef } = radioPlayer;
  
  const [currentTime, setCurrentTime] = useState(moment());
  const [showSettings, setShowSettings] = useState(false);
  const [showTV, setShowTV] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [legalView, setLegalView] = useState<'disclaimer' | 'privacy' | 'terms' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    ensureViewerFrameRule();
  }, []);

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

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.fontSize]);

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

      {/* CSS personalizado */}
      {settings.customCss && (
        <style>{settings.customCss}</style>
      )}

      {/* Contenido */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center p-8 ${settings.bookmarkView === 'dock' ? 'pb-32' : ''}`}>
        {/* Audio de radio: vive fuera del modal para que siga sonando al cerrarlo */}
        <audio ref={radioAudioRef} className="hidden" preload="none" />
        <audio ref={radioPlainAudioRef} className="hidden" preload="none" />
        {/* Banner de Actualización */}
        <AnimatePresence>
          {updater.updateUrl && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4"
            >
              <div className="bg-blue-600/90 border border-blue-400/20 px-5 py-2.5 rounded-xl flex items-center gap-5">
                <span className="text-sm font-semibold text-white">{t('updateAvailable', lang)}</span>
                <a 
                  href={updater.updateUrl} 
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
                className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                title="Subir"
              >
                <ChevronUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          <button 
            onClick={scrollToBottom}
            className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            title="Bajar"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Botones Flotantes (Derecha) */}
        <div className="fixed top-5 right-5 flex flex-col gap-2 z-40">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-black/60 transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
          <button 
            onClick={() => setShowTV(true)}
            className="p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            title={t('tv', lang)}
          >
            <Tv size={20} />
          </button>
          <button 
            onClick={() => setShowRadio(true)}
            className={`p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-black/60 transition-colors ${radioPlayer.currentChannel ? 'ring-1 ring-white/35' : ''}`}
            title={t('radio', lang)}
          >
            <Radio size={20} />
          </button>
        </div>

        {/* Reloj */}
        {settings.showClock && (
          <div className="text-center mt-10 mb-10 select-none">
            <h1 className="text-8xl font-light tracking-tight text-white/95 tabular-nums">
              {currentTime.format('HH:mm')}
            </h1>
            <p className="text-lg text-white/75 font-normal mt-1 capitalize">
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
            view={settings.bookmarkView || 'cards'}
            onViewChange={view => updateSettings({ bookmarkView: view })}
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

        {/* Footer Legal */}
        <footer className="w-full max-w-6xl mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 opacity-30 hover:opacity-80 transition-opacity">
          <p className="text-[10px] text-white/60">
            TabNest © 2026 • {t('tv', lang)} Data by TDTChannels
          </p>
          <div className="flex items-center gap-6 text-white">
            <button onClick={() => setLegalView('disclaimer')} className="text-[10px] text-white/60 hover:text-white/70 transition-colors">
              {t('disclaimer', lang)}
            </button>
            <button onClick={() => setLegalView('privacy')} className="text-[10px] text-white/60 hover:text-white/70 transition-colors">
              {t('privacy', lang)}
            </button>
            <button onClick={() => setLegalView('terms')} className="text-[10px] text-white/60 hover:text-white/70 transition-colors">
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
              updater={updater}
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
              player={radioPlayer}
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
