(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-filter-form]").forEach(function (form) {
    var scope = document.querySelector(form.getAttribute("data-filter-form")) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select"));

    function applyFilter() {
      var values = {};
      inputs.forEach(function (input) {
        values[input.name] = (input.value || "").toLowerCase().trim();
      });

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var year = (card.getAttribute("data-year") || "").toLowerCase();
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var visible = true;

        if (values.keyword && text.indexOf(values.keyword) === -1) {
          visible = false;
        }
        if (values.year && year !== values.year) {
          visible = false;
        }
        if (values.type && type.indexOf(values.type) === -1) {
          visible = false;
        }
        if (values.region && region.indexOf(values.region) === -1) {
          visible = false;
        }
        if (values.genre && genre.indexOf(values.genre) === -1) {
          visible = false;
        }

        card.classList.toggle("hidden-card", !visible);
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
      input.addEventListener("change", applyFilter);
    });
  });
})();

function createMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var button = document.getElementById(options.buttonId);
  var streamUrl = options.streamUrl;
  var hls = null;
  var ready = false;
  var loading = false;

  if (!video || !overlay || !button || !streamUrl) {
    return;
  }

  function revealError() {
    overlay.classList.add("player-error");
    overlay.classList.remove("is-hidden");
  }

  function playNow() {
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  function attachStream() {
    if (ready) {
      playNow();
      return;
    }

    if (loading) {
      return;
    }

    loading = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        loading = false;
        playNow();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          revealError();
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      ready = true;
      loading = false;
      playNow();
      return;
    }

    loading = false;
    revealError();
  }

  function start(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    attachStream();
  }

  overlay.addEventListener("click", start);
  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!ready) {
      attachStream();
      return;
    }
    if (video.paused) {
      playNow();
    } else {
      video.pause();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
