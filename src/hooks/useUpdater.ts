import { useState, useEffect } from 'react';

interface UpdateInfo {
  id: string;
  url: string;
}

export const useUpdater = (currentName: string) => {
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch('https://extupdater.inled.es/api/updates.json');
        const updates: UpdateInfo[] = await response.json();
        
        // Buscamos si hay algún ID que coincida con el nombre de nuestra extensión
        // El ID en el JSON parece ser nombre-vX.X
        const match = updates.find(u => u.id.toLowerCase().includes(currentName.toLowerCase()));
        
        if (match) {
          setUpdateUrl(match.url);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkUpdates();
  }, [currentName]);

  return { updateUrl };
};
