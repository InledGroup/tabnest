import { useState, useEffect, useCallback } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const UPDATER_URL = 'https://extupdater.inled.es/api/extensions.json';
const EXT_ID = 'es.inled.tabnest';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RemoteExtension {
  version: string;
  url: string;
}

function isChrome(): boolean {
  return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined' && typeof chrome.runtime.getManifest === 'function';
}

function getCurrentVersion(): string | null {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return null;
  }
}

function parseSemver(v: string): [number, number, number] {
  const parts = v.replace(/^v/, '').split('.').map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function isNewer(remote: string, current: string): boolean {
  const [rMaj, rMin, rPat] = parseSemver(remote);
  const [cMaj, cMin, cPat] = parseSemver(current);
  if (rMaj !== cMaj) return rMaj > cMaj;
  if (rMin !== cMin) return rMin > cMin;
  return rPat > cPat;
}

interface UpdaterState {
  isChrome: boolean;
  updateUrl: string | null;
  latestVersion: string | null;
  currentVersion: string | null;
  isChecking: boolean;
  lastCheck: number | null;
  checkForUpdates: () => Promise<void>;
}

export const useUpdater = (): UpdaterState => {
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<number | null>(null);

  const chromeDetected = isChrome();
  const currentVersion = getCurrentVersion();

  const checkForUpdates = useCallback(async () => {
    if (!chromeDetected) return;

    setIsChecking(true);
    try {
      const response = await fetch(UPDATER_URL);
      const data: Record<string, RemoteExtension> = await response.json();
      const remote = data[EXT_ID];

      if (remote && currentVersion && isNewer(remote.version, currentVersion)) {
        setUpdateUrl(remote.url);
        setLatestVersion(remote.version);
      } else {
        setUpdateUrl(null);
        setLatestVersion(null);
      }

      const now = Date.now();
      setLastCheck(now);
      await setStorage('updaterLastCheck', now);
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  }, [chromeDetected, currentVersion]);

  useEffect(() => {
    if (!chromeDetected) return;

    const init = async () => {
      const lastCheckTs = await getStorage<number | null>('updaterLastCheck', null);
      setLastCheck(lastCheckTs);

      if (!lastCheckTs || Date.now() - lastCheckTs > CHECK_INTERVAL_MS) {
        checkForUpdates();
      }
    };

    init();
  }, [chromeDetected, checkForUpdates]);

  return {
    isChrome: chromeDetected,
    updateUrl,
    latestVersion,
    currentVersion,
    isChecking,
    lastCheck,
    checkForUpdates,
  };
};
