document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var searchInput = document.querySelector('[data-card-search]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year'));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilters = filters.every(function (filter) {
                var key = filter.getAttribute('data-card-filter');
                var value = normalize(filter.value);
                return !value || normalize(card.getAttribute('data-' + key)) === value;
            });
            var show = matchesQuery && matchesFilters;
            card.classList.toggle('hidden', !show);
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }

    filters.forEach(function (filter) {
        filter.addEventListener('change', applyFilter);
    });
});
