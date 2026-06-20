
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileNav() {
        var button = document.querySelector('[data-mobile-menu]');
        var nav = document.querySelector('[data-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-filter-panel');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                scope = document;
            }
            var input = panel.querySelector('[data-search-input]');
            var year = panel.querySelector('[data-year-filter]');
            var type = panel.querySelector('[data-type-filter]');
            var region = panel.querySelector('[data-region-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
            var noResults = scope.querySelector('[data-no-results]');

            function apply() {
                var q = normalize(input && input.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                var r = normalize(region && region.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.category
                    ].join(' '));
                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (y && normalize(card.dataset.year) !== y) {
                        matched = false;
                    }
                    if (t && normalize(card.dataset.type).indexOf(t) === -1) {
                        matched = false;
                    }
                    if (r && normalize(card.dataset.region).indexOf(r) === -1) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        shown += 1;
                    }
                });

                if (noResults) {
                    noResults.style.display = shown ? 'none' : 'block';
                }
            }

            [input, year, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
                img.setAttribute('aria-label', img.getAttribute('alt') || '影片封面');
            }, { once: true });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupImageFallbacks();
    });
}());
