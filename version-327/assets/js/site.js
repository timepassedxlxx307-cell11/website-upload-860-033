(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.getElementById("mobileMenuBtn");
    var mobileNav = document.getElementById("mobileNav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (!slides.length) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
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
          timer = null;
        }
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document.body;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = panel.parentElement ? panel.parentElement.querySelector(".filter-empty") : null;
      var search = panel.querySelector("[data-filter-search]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }
      function apply() {
        var query = valueOf(search);
        var regionValue = valueOf(region);
        var yearValue = valueOf(year);
        var typeValue = valueOf(type);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
            ok = false;
          }
          if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
            ok = false;
          }
          if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [search, region, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  });
})();

function initMoviePlayer(streamUrl) {
  function setup() {
    var video = document.getElementById("movieVideo");
    var cover = document.getElementById("playerCover");
    var start = document.getElementById("playerStart");
    var attached = false;
    var hls = null;
    if (!video || !streamUrl) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (start) {
      start.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    if (cover) {
      cover.addEventListener("click", play);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
    }
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
}
