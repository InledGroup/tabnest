import { useState, useEffect } from 'react';

export interface TVProgram {
  name: string;
  description: string;
  start: number; // Unix timestamp in milliseconds
  end: number;   // Unix timestamp in milliseconds
}

export interface TVChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  ambit: string; // Categoría/Ámbito
  epg_id?: string;
  epg?: TVProgram[];
  isWeb?: boolean;
}

export const useTV = () => {
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const [channelsRes, epgResponse] = await Promise.all([
          fetch('https://www.tdtchannels.com/lists/tv.json'),
          fetch('https://www.tdtchannels.com/epg/TV.json')
        ]);
        
        const data = await channelsRes.json();
        const epgData = await epgResponse.json();
        
        const flatChannels: TVChannel[] = [];
        
        if (data.countries) {
          data.countries.forEach((country: any) => {
            if (country.ambits) {
              country.ambits.forEach((ambit: any) => {
                const ambitName = ambit.name || ambit.ambit || 'General'; // Fallback
                
                if (ambit.channels) {
                  ambit.channels.forEach((channel: any) => {
                    const m3u8Option = channel.options.find((opt: any) => 
                      opt.format === 'm3u8' || opt.url.endsWith('.m3u8')
                    );
                    
                    const streamUrl = m3u8Option ? m3u8Option.url : channel.web;
                    
                    if (streamUrl) {
                      const channelEpgEntry = Array.isArray(epgData) 
                        ? epgData.find((e: any) => e.name === channel.epg_id) 
                        : null;

                      const events = channelEpgEntry?.events || [];

                      flatChannels.push({
                        id: channel.name,
                        name: channel.name,
                        logo: channel.logo,
                        url: streamUrl,
                        ambit: ambitName,
                        isWeb: !m3u8Option,
                        epg_id: channel.epg_id,
                        epg: events.map((p: any) => ({
                          name: p.t,
                          description: p.d,
                          start: p.hi * 1000,
                          end: p.hf * 1000
                        }))
                      });
                    }
                  });
                }
              });
            }
          });
        }
        
        setChannels(flatChannels);
      } catch (error) {
        console.error('Error fetching TV channels or EPG:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading };
};
