(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-movie-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    function applyMovieFilters() {
      var query = (filterInput.value || '').trim().toLowerCase();
      var typeValue = typeFilter ? typeFilter.value : '';
      var regionValue = regionFilter ? regionFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesType = !typeValue || cardType === typeValue;
        var matchesRegion = !regionValue || cardRegion === regionValue;
        var matchesYear = !yearValue || cardYear === yearValue;
        var visible = matchesQuery && matchesType && matchesRegion && matchesYear;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', shown === 0);
      }
    }

    [filterInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyMovieFilters);
        control.addEventListener('change', applyMovieFilters);
      }
    });

    applyMovieFilters();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var source = video ? video.getAttribute('data-src') : '';
    var initialized = false;
    var hls = null;

    function initialize() {
      if (!video || initialized || !source) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      initialize();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
