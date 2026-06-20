(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = document.body.classList.toggle("mobile-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filtered-out", value && haystack.indexOf(value) === -1);
        });
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function resultTemplate(movie) {
      return "<a class=\"search-result\" href=\"" + movie.url + "\">" +
        "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
        "<div><h2>" + escapeHtml(movie.title) + "</h2>" +
        "<p>" + escapeHtml(movie.region + " · " + movie.year + " · " + movie.genre) + "</p>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<span class=\"text-link\">查看详情 →</span></div></a>";
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "<div class=\"search-empty\">输入关键词后即可查看匹配影片。</div>";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 80);
      if (!matched.length) {
        results.innerHTML = "<div class=\"search-empty\">没有找到相关影片。</div>";
        return;
      }
      results.innerHTML = matched.map(resultTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
  });
})();
