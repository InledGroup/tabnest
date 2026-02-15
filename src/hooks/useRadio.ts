import { useState, useEffect } from 'react';
import type { TVProgram } from './useTV';

export interface RadioChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  epg_id?: string;
  epg?: TVProgram[];
}

export const useRadio = () => {
  const [channels, setChannels] = useState<RadioChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const [channelsRes, epgResponse] = await Promise.all([
          fetch('https://www.tdtchannels.com/lists/radio.json'),
          fetch('https://www.tdtchannels.com/epg/RADIO.json')
        ]);
        
        const data = await channelsRes.json();
        const epgData = await epgResponse.json();
        
        const flatChannels: RadioChannel[] = [];
        
        data.countries.forEach((country: any) => {
          country.ambits.forEach((ambit: any) => {
            ambit.channels.forEach((channel: any) => {
              const m3u8Option = channel.options.find((opt: any) => 
                opt.format === 'm3u8' || opt.url.endsWith('.m3u8') || opt.format === 'aac' || opt.format === 'mp3'
              );
              
              if (m3u8Option) {
                const channelEpgEntry = Array.isArray(epgData) 
                  ? epgData.find((e: any) => e.name === channel.epg_id) 
                  : null;

                const events = channelEpgEntry?.events || [];

                flatChannels.push({
                  id: channel.name,
                  name: channel.name,
                  logo: channel.logo,
                  url: m3u8Option.url,
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
          });
        });
        
        setChannels(flatChannels);
      } catch (error) {
        console.error('Error fetching Radio channels or EPG:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading };
};
