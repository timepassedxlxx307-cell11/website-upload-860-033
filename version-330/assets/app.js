(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  var searchData = window.MOVIE_SEARCH || [];
  var isMovieDetailPath = window.location.pathname.indexOf('/movies/') !== -1;

  function resolveSitePath(path) {
    if (!isMovieDetailPath || /^(https?:|\/|#)/.test(path)) {
      return path;
    }

    return '../' + path.replace(/^\.\//, '');
  }

  function renderSearchPanel(input) {
    var panel = input.parentElement.querySelector('[data-search-panel]');
    if (!panel) {
      return;
    }

    var query = input.value.trim().toLowerCase();
    if (!query) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }

    var results = searchData.filter(function (item) {
      return item.searchText.indexOf(query) !== -1;
    }).slice(0, 10);

    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result-link" href="' + resolveSitePath(item.link) + '">' +
        '<strong>' + item.title + '</strong>' +
        '<span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span>' +
        '</a>';
    }).join('') || '<div class="search-result-link"><strong>没有找到匹配影片</strong><span>可尝试更换关键词</span></div>';

    panel.classList.add('open');
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearchPanel(input);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-box')) {
      document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
        panel.classList.remove('open');
      });
    }
  });

  var toolbar = document.querySelector('[data-filter-toolbar]');
  var grid = document.querySelector('[data-filter-grid]');

  if (toolbar && grid) {
    toolbar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter-type]');
      if (!button) {
        return;
      }

      var filterType = button.getAttribute('data-filter-type');
      toolbar.querySelectorAll('[data-filter-type]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      grid.querySelectorAll('[data-type]').forEach(function (item) {
        var isVisible = filterType === 'all' || item.getAttribute('data-type') === filterType;
        item.classList.toggle('hidden-by-filter', !isVisible);
      });
    });
  }

  var mainSearchInput = document.querySelector('[data-main-search]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');

  function movieCardTemplate(item) {
    return '<article class="movie-card">' +
      '<a class="poster-wrap" href="' + resolveSitePath(item.link) + '" title="' + item.title + ' 在线观看">' +
      '<img src="' + resolveSitePath(item.image) + '" alt="' + item.title + ' 封面" loading="lazy">' +
      '<span class="poster-badge">' + item.rating + '</span>' +
      '<span class="play-hover">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + resolveSitePath(item.link) + '">' + item.title + '</a></h3>' +
      '<p>' + item.oneLine + '</p>' +
      '<div class="meta-row"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function runSearchPage() {
    if (!mainSearchInput || !searchResults) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || mainSearchInput.value || '').trim().toLowerCase();
    mainSearchInput.value = query;

    if (!query) {
      return;
    }

    var results = searchData.filter(function (item) {
      return item.searchText.indexOf(query) !== -1;
    });

    if (searchTitle) {
      searchTitle.textContent = '“' + query + '” 的搜索结果';
    }

    searchResults.innerHTML = results.slice(0, 240).map(movieCardTemplate).join('') || '<p>没有找到匹配影片。</p>';
  }

  runSearchPage();
})();
