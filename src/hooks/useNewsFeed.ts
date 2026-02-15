import { useState, useEffect } from 'react';
import { fetchFeed } from '../utils/rssParser';
import type { NewsItem } from '../utils/rssParser';
import { getStorage, setStorage } from '../utils/storage';

export interface NewsSource {
  name: string;
  url: string;
  enabled: boolean;
}

const defaultSources: NewsSource[] = [
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', enabled: true },
  { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', enabled: true },
  { name: 'ABC', url: 'https://www.abc.es/rss/feeds/abc_portada.xml', enabled: true },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/', enabled: true },
  { name: 'El Confidencial', url: 'https://rss.elconfidencial.com/espana/', enabled: true },
  { name: 'El Debate', url: 'https://www.eldebate.com/rss/home.xml', enabled: true },
  { name: 'The Objective', url: 'https://theobjective.com/feed/', enabled: true }
];

export const useNewsFeed = () => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [displayNews, setDisplayNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>(defaultSources);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    getStorage<NewsSource[]>('newsSources', defaultSources).then(savedSources => {
      // Si el usuario ya tenía fuentes, nos aseguramos de que las nuevas por defecto estén presentes
      // si no han sido borradas explícitamente (comparando por URL)
      const mergedSources = [...savedSources];
      let changed = false;

      defaultSources.forEach(def => {
        if (!mergedSources.find(s => s.url === def.url)) {
          mergedSources.push(def);
          changed = true;
        }
      });

      if (changed) {
        setStorage('newsSources', mergedSources);
      }

      setSources(mergedSources);
      refreshNews(mergedSources);
    });
  }, []);

  const refreshNews = async (activeSources: NewsSource[]) => {
    setLoading(true);
    setPage(1);
    const enabledSources = activeSources.filter(s => s.enabled);
    const results = await Promise.all(
      enabledSources.map(source => fetchFeed(source.url, source.name))
    );
    const flattened = results.flat().sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    setAllNews(flattened);
    setDisplayNews(flattened.slice(0, ITEMS_PER_PAGE));
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextBatch = allNews.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayNews(nextBatch);
    setPage(nextPage);
  };

  const addSource = async (name: string, url: string) => {
    const newSource = { name, url, enabled: true };
    const updated = [...sources, newSource];
    setSources(updated);
    await setStorage('newsSources', updated);
    refreshNews(updated);
  };

  const removeSource = async (url: string) => {
    const updated = sources.filter(s => s.url !== url);
    setSources(updated);
    await setStorage('newsSources', updated);
    refreshNews(updated);
  };

  const toggleSource = async (url: string) => {
    const updated = sources.map(s => s.url === url ? { ...s, enabled: !s.enabled } : s);
    setSources(updated);
    await setStorage('newsSources', updated);
    refreshNews(updated);
  };

  return { 
    news: displayNews, 
    hasMore: displayNews.length < allNews.length,
    sources, 
    loading, 
    toggleSource, 
    refreshNews, 
    addSource, 
    removeSource,
    loadMore 
  };
};
