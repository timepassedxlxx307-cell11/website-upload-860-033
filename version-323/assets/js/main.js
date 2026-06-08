(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var movieCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var selected = filterSelect ? filterSelect.value : "";
      var shown = 0;

      movieCards.forEach(function (card) {
        var content = (card.getAttribute("data-search") || "").toLowerCase();
        var matchesKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchesSelected = !selected || content.indexOf(selected.toLowerCase()) !== -1;
        var visible = matchesKeyword && matchesSelected;

        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", shown === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", applyFilter);
    }
  });
})();

function initPlayer(videoId, layerId, streamUrl) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !layer || !streamUrl) {
    return;
  }

  function start() {
    if (!loaded) {
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    layer.classList.add("is-hidden");
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  layer.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("ended", function () {
    if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
      hlsInstance.stopLoad();
    }
  });
}
