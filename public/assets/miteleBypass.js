/**
 * Mitele/Mediaset Isolated Bypass v2.4
 * Handles DOM cleanup and basic overlay removals.
 */

(function() {
    'use strict';

    const cleanupDOM = () => {
        const adSelectors = [
            '.adblock-overlay', 
            '[class*="AdblockDetector"]', 
            '.didomi-popup-container', 
            '.bitmovinplayer-ad-ui',
            '.ms-advertising-container'
        ];

        adSelectors.forEach(s => {
            document.querySelectorAll(s).forEach(el => {
                el.remove();
            });
        });

        if (document.body) {
            document.body.style.setProperty('overflow', 'auto', 'important');
        }
    };

    const autoSkipAds = () => {
        const video = document.querySelector('video');
        const adUI = document.querySelector('.bitmovinplayer-ad-ui');
        if (video && adUI && adUI.style.display !== 'none') {
            if (video.duration > 0 && video.currentTime < video.duration) {
                video.currentTime = video.duration - 0.2;
                video.play().catch(() => {});
            }
        }
    };

    const observer = new MutationObserver(cleanupDOM);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(() => {
        cleanupDOM();
        autoSkipAds();
    }, 1000);

})();
