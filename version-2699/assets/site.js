(function () {
    var header = document.getElementById('siteHeader');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

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

        restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var list = document.querySelector('[data-filter-list]');
    var resultCount = document.querySelector('[data-result-count]');

    function applyFilterAndSort() {
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle('is-hidden-by-filter', !matched);
            if (matched) {
                visibleCount += 1;
            }
        });

        if (sortSelect) {
            var mode = sortSelect.value;
            cards.sort(function (a, b) {
                if (mode === 'year-desc') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (mode === 'rating-desc') {
                    var ra = Number((a.textContent.match(/★\s*([0-9.]+)/) || [0, 0])[1]);
                    var rb = Number((b.textContent.match(/★\s*([0-9.]+)/) || [0, 0])[1]);
                    return rb - ra;
                }
                if (mode === 'title-asc') {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                }
                return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
            });
            cards.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (resultCount) {
            resultCount.textContent = visibleCount + ' 部影片';
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilterAndSort);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilterAndSort);
    }
})();
