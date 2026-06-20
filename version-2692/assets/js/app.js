(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var filterRoots = selectAll('[data-filter-root]');

    filterRoots.forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var year = root.querySelector('[data-filter-year]');
      var genre = root.querySelector('[data-filter-genre]');
      var cards = selectAll('[data-filter-card]', root);
      var empty = root.querySelector('[data-filter-empty]');

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var q = normalize(search && search.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var title = normalize(card.getAttribute('data-title'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (q && title.indexOf(q) === -1 && cardGenre.indexOf(q) === -1 && cardRegion.indexOf(q) === -1) {
            matched = false;
          }

          if (y && cardYear !== y) {
            matched = false;
          }

          if (g && cardGenre.indexOf(g) === -1) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initHeroSearch() {
    var input = document.querySelector('[data-home-search]');

    if (!input) {
      return;
    }

    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') {
        return;
      }

      var keyword = input.value.trim();

      if (!keyword) {
        return;
      }

      var target = document.querySelector('[data-index-list]');

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function attachPlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var errorBox = document.querySelector('[data-player-error]');
    var started = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.textContent = '暂时无法播放，请稍后再试';
        errorBox.classList.add('is-visible');
      }
    }

    function hideButton() {
      button.classList.add('is-hidden');
    }

    function playVideo() {
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showError();
        });
      }
    }

    function load() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      hideButton();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
          showError();
        });
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    button.addEventListener('click', load);
    video.addEventListener('click', function () {
      if (!started) {
        load();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.CinemaSite = {
    attachPlayer: attachPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initHeroSearch();
  });
}());
