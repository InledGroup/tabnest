import React, { useEffect, useRef } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NewsItem } from '../utils/rssParser';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface NewsFeedProps {
  news: NewsItem[];
  loading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  lang: Language;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news, loading, onRefresh, onLoadMore, hasMore, lang }) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          {t('news', lang)}
        </h2>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item, index) => (
          <motion.article 
            key={`${item.link}-${index}`} 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="group bg-slate-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col shadow-2xl"
          >
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {item.source}
                </span>
                <span className="text-[10px] text-white/40 font-medium">
                  {new Date(item.pubDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <p className="text-sm text-white/60 mb-6 line-clamp-3 leading-relaxed flex-grow">
                {item.contentSnippet}
              </p>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-white/30 group-hover:text-white transition-colors uppercase tracking-widest"
              >
                {t('readMore', lang)} <ExternalLink size={14} />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
      
      {/* Elemento para observar el scroll infinito */}
      <div ref={observerTarget} className="h-10 mt-10 flex justify-center">
        {loading && <RefreshCw className="animate-spin text-blue-500" size={32} />}
      </div>

      {news.length === 0 && !loading && (
        <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <p className="text-white/40 font-medium">{t('noNews', lang)}</p>
        </div>
      )}
    </div>
  );
};
