/**
 * Mitele/Mediaset MAIN WORLD Bypass v2.4
 * Estabilización de DAI y Salto al Directo mediante Aceleración.
 */

(function() {
    'use strict';

    const forceTrue = { value: true, writable: false, configurable: false };
    const forceFalse = { value: false, writable: false, configurable: false };
    try {
        Object.defineProperty(window, 'canRunAds', forceTrue);
        Object.defineProperty(window, 'adblock', forceFalse);
    } catch (e) {}

    let bitmovinPlayerIntercepted = false;
    
    const interceptBitmovin = () => {
        if (window.bitmovin && window.bitmovin.player && !bitmovinPlayerIntercepted) {
            const Player = window.bitmovin.player.Player;
            window.bitmovin.player.Player = function(container, config) {
                if (config) {
                    console.log('TabNest (Main): Optimizando instancia Bitmovin...');
                    config.advertising = { adBreaks: [] }; 
                    config.analytics = false;
                }
                const instance = new Player(container, config);
                
                const syncToLive = () => {
                    if (instance.isLive && instance.isLive()) {
                        const shift = instance.getTimeShift();
                        if (shift < -1) {
                            instance.timeShift(0);
                        }
                    }
                };

                instance.on('adstarted', () => {
                    console.log('TabNest (Main): Anuncio detectado - Saltando...');
                    if (instance.ads) instance.ads.skip();
                    syncToLive();
                });

                instance.on('timechanged', () => {
                    const video = document.querySelector('video');
                    const adUI = document.querySelector('.bitmovinplayer-ad-ui');
                    const isAdActive = (adUI && adUI.style.display !== 'none') || (instance.isAd && instance.isAd());

                    if (video) {
                        if (isAdActive) {
                            video.playbackRate = 16;
                            video.muted = true;
                            syncToLive();
                        } else {
                            if (video.playbackRate > 1) video.playbackRate = 1;
                        }
                    }
                });

                return instance;
            };
            bitmovinPlayerIntercepted = true;
        }
    };

    if (window.bitmovin) interceptBitmovin();
    const bitObserver = new MutationObserver(interceptBitmovin);
    bitObserver.observe(document.documentElement, { childList: true, subtree: true });

    window.googletag = window.googletag || { cmd: [], pubads: () => ({ 
        enableSingleRequest: () => {}, setTargeting: () => {}, addEventListener: () => {} 
    }), display: () => {} };
})();
