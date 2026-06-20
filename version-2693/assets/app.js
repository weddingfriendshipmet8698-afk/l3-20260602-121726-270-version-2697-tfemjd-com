(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        showSlide(idx);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var category = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var empty = document.querySelector(panel.getAttribute('data-empty-target'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var c = category ? category.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        var matchCategory = !c || card.getAttribute('data-category') === c;
        var ok = matchText && matchYear && matchCategory;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();

function setupMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = button ? button.closest('.player-overlay') : null;
  var initialized = false;

  if (!video || !button || !source) {
    return;
  }

  function attach() {
    if (!initialized) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      initialized = true;
    }

    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.play().catch(function () {});
  }

  button.addEventListener('click', attach);
  video.addEventListener('click', attach, { once: true });
}
