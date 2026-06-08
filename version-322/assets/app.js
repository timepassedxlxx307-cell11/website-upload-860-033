(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });

    $$('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  function setupHero() {
    var slides = $$('[data-hero-slide]');
    var dots = $$('[data-hero-dot]');
    var index = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function setupImageFallback() {
    $$('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  function setupFilters() {
    var input = $('[data-search-input]');
    var type = $('[data-filter-type]');
    var year = $('[data-filter-year]');
    var category = $('[data-filter-category]');
    var cards = $$('[data-card]');
    var count = $('[data-result-count]');
    var empty = $('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    function matchesYear(card, selected) {
      if (selected === 'all') {
        return true;
      }
      var cardYear = card.getAttribute('data-year') || '';
      if (selected === '2022') {
        return Number(cardYear) <= 2022;
      }
      return cardYear === selected;
    }

    function applyFilters() {
      var query = normalize(input && input.value);
      var selectedType = type ? type.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var selectedCategory = category ? category.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var ok = true;
        ok = ok && (!query || haystack.indexOf(query) !== -1);
        ok = ok && (selectedType === 'all' || card.getAttribute('data-type') === selectedType);
        ok = ok && matchesYear(card, selectedYear);
        ok = ok && (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory);

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    $$('[data-quick-search]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.getAttribute('data-quick-search') || '';
          applyFilters();
          input.focus();
        }
      });
    });

    applyFilters();
  }

  function setupPlayers() {
    $$('.movie-player').forEach(function (player) {
      var video = $('video', player);
      var button = $('[data-play-button]', player);
      var message = $('[data-player-message]', player);
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !button || !stream) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('浏览器阻止自动播放，请再次点击播放器。');
          });
        }
      }

      function attachStream() {
        if (loaded) {
          playVideo();
          return;
        }

        loaded = true;
        setMessage('正在加载高清播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });

          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源暂时不可用，请稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            playVideo();
          }, { once: true });
        } else {
          video.src = stream;
          window.setTimeout(function () {
            playVideo();
          }, 60);
        }
      }

      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        attachStream();
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          attachStream();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupImageFallback();
    setupFilters();
    setupPlayers();
  });
}());
