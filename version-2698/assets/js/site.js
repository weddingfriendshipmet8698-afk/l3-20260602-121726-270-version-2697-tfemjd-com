(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var menu = document.getElementById('mobileMenu');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            var icon = toggle.querySelector('.mobile-toggle-icon');
            if (icon) {
                icon.textContent = isOpen ? '×' : '☰';
            }
        });
    }

    function setupHeroCarousel() {
        var root = document.querySelector('[data-hero]');

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        if (slides.length === 0) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });

        root.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        root.addEventListener('mouseleave', restart);
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var container = panel.nextElementSibling;
            var input = panel.querySelector('[data-filter-input]');
            var categorySelect = panel.querySelector('[data-category-select]');
            var typeSelect = panel.querySelector('[data-type-select]');
            var count = panel.querySelector('[data-filter-count]');

            if (!container) {
                container = document.querySelector('[data-card-container]');
            }

            if (!container) {
                return;
            }

            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var category = categorySelect ? categorySelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matched = true;

                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden-by-filter', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 部';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            if (categorySelect) {
                categorySelect.addEventListener('change', applyFilter);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', applyFilter);
            }

            applyFilter();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.video-player-shell'));

        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var source = shell.getAttribute('data-source');
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (video.dataset.ready === 'true') {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }

                video.dataset.ready = 'true';
            }

            function playVideo() {
                attachSource();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            shell.addEventListener('click', function (event) {
                if (event.target === video && video.dataset.ready !== 'true') {
                    playVideo();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });
}());
