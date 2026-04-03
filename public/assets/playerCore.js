(function() {
    'use strict';

    const initEngine = () => {
        const p = [['canRunAds', true], ['adblock', false], ['isAdblockActive', false]];
        p.forEach(([k, v]) => {
            try { Object.defineProperty(window, k, { value: v, writable: false }); } catch (e) {}
        });

        let _i = false;
        const s = () => {
            if (window.bitmovin && window.bitmovin.player && !_i) {
                const P = window.bitmovin.player.Player;
                window.bitmovin.player.Player = function(c, config) {
                    if (config) {
                        config.advertising = { adBreaks: [] };
                        config.analytics = false;
                    }
                    const instance = new P(c, config);
                    const a = () => {
                        if (instance.isLive && instance.isLive()) {
                            const shift = instance.getTimeShift();
                            if (shift < -1.5) instance.timeShift(0);
                        }
                    };
                    instance.on('adstarted', () => {
                        if (instance.ads) instance.ads.skip();
                        a();
                    });

                    // Bucle de aceleración extrema (cada 100ms)
                    setInterval(() => {
                        const v = document.querySelector('video');
                        const ui = document.querySelector('.bitmovinplayer-ad-ui, .bitmovinplayer-ad-status-text');
                        const isAd = (ui && ui.style.display !== 'none') || (instance.isAd && instance.isAd());
                        
                        if (v && isAd) {
                            v.playbackRate = 16; // Máximo permitido por Chrome
                            v.muted = true;
                            // Salto forzado al final del clip de anuncio
                            if (v.duration > 0 && v.currentTime < v.duration - 0.1) {
                                v.currentTime = v.duration;
                            }
                            a();
                        } else if (v && v.playbackRate > 1 && !isAd) {
                            v.playbackRate = 1;
                        }
                    }, 100);

                    instance.on('timechanged', () => {
                        const v = document.querySelector('video');
                        const ui = document.querySelector('.bitmovinplayer-ad-ui');
                        const active = (ui && ui.style.display !== 'none') || (instance.isAd && instance.isAd());
                        if (v && active) {
                            v.playbackRate = 16;
                            v.muted = true;
                            a();
                        }
                    });
                    return instance;
                };
                _i = true;
            }
        };

        if (window.bitmovin) s();
        new MutationObserver(s).observe(document.documentElement, { childList: true, subtree: true });

        window.googletag = window.googletag || { cmd: [], pubads: () => ({ 
            enableSingleRequest: () => {}, setTargeting: () => {}, addEventListener: () => {} 
        }), display: () => {} };
    };

    window.addEventListener('message', function listener(event) {
        if (event.data && event.data.type === 'TN_INIT_CORE') {
            window.removeEventListener('message', listener);
            initEngine();
        }
    });

})();
