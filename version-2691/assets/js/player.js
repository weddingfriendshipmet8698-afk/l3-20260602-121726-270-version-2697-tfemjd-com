
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupPlayer() {
        var video = document.querySelector('[data-video-player]');
        var button = document.querySelector('[data-play-button]');
        var overlay = document.querySelector('[data-play-overlay]');
        var status = document.querySelector('[data-player-status]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-video-src');
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('已加载原生 HLS 播放源。');
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                window.__pageHls = hls;
                setStatus('已初始化 HLS 播放器。');
                return Promise.resolve();
            }
            video.src = source;
            setStatus('当前浏览器将尝试直接播放该视频源。');
            return Promise.resolve();
        }

        button.addEventListener('click', function () {
            initialize().then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        setStatus('播放器已准备好，请再次点击播放按钮。');
                    });
                }
            });
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }

    ready(setupPlayer);
}());
