import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { SearchEngine } from '../hooks/useSettings';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface SearchBarProps {
  searchEngineId: string;
  engines: SearchEngine[];
  lang: Language;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchEngineId, engines, lang }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const engine = engines.find(e => e.id === searchEngineId) || engines[0];
    window.location.href = engine.url + encodeURIComponent(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', lang)}
          className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-2xl"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={24} />
      </form>
    </div>
  );
};
