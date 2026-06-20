(function () {
    "use strict";

    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initHeader() {
        var header = select("[data-header]");
        var toggle = select("[data-menu-toggle]");

        function syncHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 36);
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (toggle && header) {
            toggle.addEventListener("click", function () {
                header.classList.toggle("is-open");
            });
        }
    }

    function initHeroCarousel() {
        var carousel = select("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", carousel);
        var tabs = selectAll("[data-hero-tab]", carousel);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            tabs.forEach(function (tab, tabIndex) {
                tab.classList.toggle("is-active", tabIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                show(Number(tab.getAttribute("data-hero-tab")) || 0);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initImageFallbacks() {
        selectAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initFilters() {
        selectAll("[data-filter-scope]").forEach(function (scope) {
            var input = select("[data-filter-input]", scope);
            var yearFilter = select("[data-year-filter]", scope);
            var typeFilter = select("[data-type-filter]", scope);
            var reset = select("[data-filter-reset]", scope);
            var count = select("[data-result-count]", scope);
            var cards = selectAll(".movie-card", scope);

            if (scope.hasAttribute("data-query-from-url") && input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = yearFilter ? yearFilter.value : "";
                var type = typeFilter ? typeFilter.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matches = true;

                    if (query && text.indexOf(query) === -1) {
                        matches = false;
                    }
                    if (year && cardYear !== year) {
                        matches = false;
                    }
                    if (type && cardType !== type) {
                        matches = false;
                    }

                    card.classList.toggle("is-hidden", !matches);
                    if (matches) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " 部影片";
                }
            }

            [input, yearFilter, typeFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (yearFilter) {
                        yearFilter.value = "";
                    }
                    if (typeFilter) {
                        typeFilter.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function initPlayer() {
        var player = select("[data-player]");
        var video = select("#video-player");
        var button = select("[data-player-button]");
        var status = select("[data-player-status]");

        if (!player || !video) {
            return;
        }

        var source = video.getAttribute("data-src");
        var title = video.getAttribute("data-title") || "影片";
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (!source) {
                setStatus("未找到播放源");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源已就绪");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus("播放源加载失败，请刷新重试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus("播放源已就绪");
            } else {
                video.src = source;
                setStatus("正在尝试使用浏览器播放器");
            }
        }

        function playVideo() {
            var playback = video.play();
            if (playback && typeof playback.catch === "function") {
                playback.catch(function () {
                    setStatus("请再次点击播放器开始播放");
                });
            }
        }

        attachSource();

        if (button) {
            button.addEventListener("click", function () {
                setStatus("正在播放《" + title + "》");
                playVideo();
            });
        }

        video.addEventListener("play", function () {
            player.classList.add("is-playing");
            setStatus("正在播放");
        });

        video.addEventListener("pause", function () {
            player.classList.remove("is-playing");
            setStatus("已暂停");
        });

        video.addEventListener("ended", function () {
            player.classList.remove("is-playing");
            setStatus("播放结束");
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function initLikeButton() {
        var button = select("[data-like-button]");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            button.classList.toggle("is-liked");
            button.textContent = button.classList.contains("is-liked") ? "已点赞" : "点赞";
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHeader();
        initHeroCarousel();
        initImageFallbacks();
        initFilters();
        initPlayer();
        initLikeButton();
    });
}());
