(function() {
    'use strict';

    chrome.storage.local.get(['settings'], (result) => {
        if (!result.settings || result.settings.optimizeStreams !== true) {
            return; // Inactivo por defecto (Opt-in)
        }

        // Enviar señal de activación al núcleo del reproductor
        window.postMessage({ type: 'TN_INIT_CORE' }, '*');

        const c = () => {
            const s = [
                '.adblock-overlay', 
                '[class*="AdblockDetector"]', 
                '.didomi-popup-container', 
                '.bitmovinplayer-ad-ui',
                '.ms-advertising-container'
            ];
            s.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });
            if (document.body) {
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        };

        const a = () => {
            const v = document.querySelector('video');
            const ui = document.querySelector('.bitmovinplayer-ad-ui');
            if (v && ui && ui.style.display !== 'none') {
                if (v.duration > 0 && v.currentTime < v.duration) {
                    v.currentTime = v.duration - 0.2;
                    v.play().catch(() => {});
                }
            }
        };

        const obs = new MutationObserver(c);
        obs.observe(document.documentElement, { childList: true, subtree: true });

        setInterval(() => {
            c();
            a();
        }, 1000);
    });

})();
