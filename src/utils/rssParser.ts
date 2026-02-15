import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  imageUrl?: string;
}

export const fetchFeed = async (url: string, sourceName: string): Promise<NewsItem[]> => {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => {
      let imageUrl = '';
      
      // 1. Probar enclosure
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } 
      // 2. Probar media:content
      else if (item.mediaContent && item.mediaContent.length > 0) {
        imageUrl = item.mediaContent[0].$.url;
      }
      // 3. Probar media:thumbnail
      else if (item.mediaThumbnail) {
        imageUrl = item.mediaThumbnail.$.url;
      }
      // 4. Buscar en el contenido HTML
      else {
        const content = item.contentEncoded || item.content || '';
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }
      
      return {
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        contentSnippet: (item.contentSnippet || '').substring(0, 200),
        source: sourceName,
        imageUrl: imageUrl
      };
    });
  } catch (error) {
    console.error(`Error fetching feed from ${url}:`, error);
    return [];
  }
};
