(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function updateHeader() {
    var header = qs('[data-header]');
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function initMenu() {
    var header = qs('[data-header]');
    var button = qs('[data-menu-toggle]');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    qsa('[data-filter-input]').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-target');
      var target = targetSelector ? qs(targetSelector) : null;
      if (!target) {
        return;
      }

      input.addEventListener('input', function () {
        applyFilters(target);
      });
    });

    qsa('[data-year-filter]').forEach(function (select) {
      var targetSelector = select.getAttribute('data-filter-target');
      var target = targetSelector ? qs(targetSelector) : null;
      if (!target) {
        return;
      }

      select.addEventListener('change', function () {
        applyFilters(target);
      });
    });
  }

  function applyFilters(target) {
    var targetId = '#' + target.id;
    var keywordInput = qs('[data-filter-input][data-filter-target="' + targetId + '"]');
    var yearSelect = qs('[data-year-filter][data-filter-target="' + targetId + '"]');
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';

    qsa('[data-card]', target).forEach(function (card) {
      var searchText = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
      var yearMatch = !year || cardYear === year;
      card.classList.toggle('is-hidden', !(keywordMatch && yearMatch));
    });
  }

  function initImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initImageFallbacks();
    updateHeader();
  });

  window.addEventListener('scroll', updateHeader, { passive: true });
})();
