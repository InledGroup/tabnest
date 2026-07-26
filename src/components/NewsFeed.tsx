import React, { useEffect, useRef } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/80">
          {t('news', lang)}
        </h2>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`p-1.5 bg-white/10 rounded-lg hover:bg-white/15 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item, index) => (
          <article 
            key={`${item.link}-${index}`} 
            className="group bg-black/30 backdrop-blur-md rounded-xl overflow-hidden border border-white/8 hover:border-white/15 transition-colors flex flex-col"
          >
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400/80">
                  {item.source}
                </span>
                <span className="text-[10px] text-white/30">
                  {new Date(item.pubDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-medium mb-2 line-clamp-2 leading-snug group-hover:text-blue-400/80 transition-colors">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <p className="text-xs text-white/40 mb-4 line-clamp-3 flex-grow">
                {item.contentSnippet}
              </p>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-white/25 group-hover:text-white/50 transition-colors"
              >
                {t('readMore', lang)} <ExternalLink size={10} />
              </a>
            </div>
          </article>
        ))}
      </div>
      
      <div ref={observerTarget} className="h-10 mt-8 flex justify-center">
        {loading && <RefreshCw className="animate-spin text-blue-500/60" size={24} />}
      </div>

      {news.length === 0 && !loading && (
        <div className="text-center py-16 bg-black/20 backdrop-blur-sm rounded-xl border border-white/5">
          <p className="text-white/30 text-sm">{t('noNews', lang)}</p>
        </div>
      )}
    </div>
  );
};
