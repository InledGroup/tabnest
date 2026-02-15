import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Settings as SettingsIcon, Tv, Radio, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    moveBookmark
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

  // Control de scroll para botón "Subir"
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

  // Idioma de Moment
  useEffect(() => {
    moment.locale(settings.language);
  }, [settings.language]);

  // Rotación de fondos
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

  const handleAddBookmark = (title: string, url: string, parentId?: string) => {
    addBookmark({ title, url, parentId });
  };

  const handleAddFolder = (title: string, color?: string, emoji?: string) => {
    addFolder(title, color, emoji);
  };

  if (settingsLoading) return null;

  const currentBackground = settings.backgrounds.find(bg => bg.id === settings.currentBackgroundId) || settings.backgrounds[0];
  const lang = settings.language;

  // Combinar marcadores si está activo
  const effectiveBookmarks = settings.showDefaultBookmarks 
    ? [...DEFAULT_BOOKMARKS, ...bookmarks]
    : bookmarks;
  
  const effectiveFolders = settings.showDefaultBookmarks
    ? [...DEFAULT_FOLDERS, ...folders]
    : folders;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fondo Estático (Parallax) */}
      <motion.div 
        key={currentBackground.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${currentBackground.url})`,
          transform: 'scale(1.05)'
        }}
      />

      {/* Contenido Scrolleable */}
      <div className="relative z-10 min-h-screen flex flex-col items-center p-8">
        {/* Banner de Actualización */}
        <AnimatePresence>
          {updateUrl && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4"
            >
              <div className="bg-blue-600/80 backdrop-blur-xl border border-blue-400/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <SettingsIcon size={18} className="text-white animate-spin-slow" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-white">{t('updateAvailable', lang)}</span>
                </div>
                <a 
                  href={updateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg shadow-black/20"
                >
                  {t('download', lang)}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de Navegación Lateral (Izquierda) */}
        <div className="fixed bottom-10 left-6 flex flex-col gap-3 z-40">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={scrollToTop}
                className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10 shadow-xl"
                title="Subir"
              >
                <ChevronUp size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={scrollToBottom}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10 shadow-xl"
            title="Bajar al pie de página"
          >
            <ChevronDown size={20} />
          </motion.button>
        </div>

        {/* Botones Flotantes (Derecha) */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed top-6 right-6 flex flex-col gap-3 z-40"
        >
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white/70 hover:text-white hover:bg-black/40 transition-all border border-white/10 shadow-2xl"
          >
            <SettingsIcon size={24} />
          </button>
          <button 
            onClick={() => setShowTV(true)}
            className="p-3 bg-blue-500/20 backdrop-blur-md rounded-2xl text-blue-400 hover:text-white hover:bg-blue-500 transition-all border border-blue-500/20 shadow-2xl"
          >
            <Tv size={24} />
          </button>
          <button 
            onClick={() => setShowRadio(true)}
            className="p-3 bg-purple-500/20 backdrop-blur-md rounded-2xl text-purple-400 hover:text-white hover:bg-purple-500 transition-all border border-purple-500/20 shadow-2xl"
          >
            <Radio size={24} />
          </button>
        </motion.div>

        {/* Reloj */}
        {settings.showClock && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mt-12 mb-12 select-none"
          >
            <h1 className="text-9xl font-light tracking-tighter text-white drop-shadow-2xl">
              {currentTime.format('HH:mm')}
            </h1>
            <p className="text-2xl text-white/80 font-medium mt-2 drop-shadow-lg capitalize">
              {currentTime.format('dddd, D [de] MMMM')}
            </p>
          </motion.div>
        )}

        {/* Barra de Búsqueda */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full mb-12"
        >
          <SearchBar 
            searchEngineId={settings.searchEngineId} 
            engines={settings.customSearchEngines} 
            lang={lang}
          />
        </motion.div>

        {/* Marcadores */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full mb-16"
        >
          <BookmarkTree 
            bookmarks={effectiveBookmarks}
            folders={effectiveFolders}
            expandedFolderIds={expandedFolderIds}
            onToggleFolder={toggleFolder}
            lang={lang}
          />
        </motion.div>

        {/* Feed de Noticias */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-full"
        >
          <NewsFeed 
            news={news} 
            loading={newsLoading} 
            onRefresh={() => refreshNews(sources)} 
            onLoadMore={loadMore}
            hasMore={hasMore}
            lang={lang}
          />
        </motion.div>

        {/* Footer Legal */}
        <footer className="w-full max-w-6xl mx-auto py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            TabNest © 2026 • {t('tv', lang)} Data by TDTChannels
          </p>
          <div className="flex items-center gap-8 text-white">
            <button onClick={() => setLegalView('disclaimer')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">
              {t('disclaimer', lang)}
            </button>
            <button onClick={() => setLegalView('privacy')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">
              {t('privacy', lang)}
            </button>
            <button onClick={() => setLegalView('terms')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">
              {t('terms', lang)}
            </button>
          </div>
        </footer>

        {/* Modales con AnimatePresence */}
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
