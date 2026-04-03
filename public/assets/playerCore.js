(function() {
    'use strict';

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
                instance.on('timechanged', () => {
                    const v = document.querySelector('video');
                    const ui = document.querySelector('.bitmovinplayer-ad-ui');
                    const active = (ui && ui.style.display !== 'none') || (instance.isAd && instance.isAd());
                    if (v) {
                        if (active) {
                            v.playbackRate = 16;
                            v.muted = true;
                            a();
                        } else if (v.playbackRate > 1) {
                            v.playbackRate = 1;
                        }
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
})();
