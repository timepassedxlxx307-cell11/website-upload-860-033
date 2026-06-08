(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function escapeText(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-poster\" href=\"" + escapeText(movie.url) + "\" aria-label=\"" + escapeText(movie.title) + "\">" +
            "<img src=\"" + escapeText(movie.cover) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span><span class=\"play-dot\">▶</span></a>" +
            "<div class=\"movie-card-body\"><div class=\"movie-meta-row\">" +
            "<span>" + escapeText(movie.year) + "</span><span>" + escapeText(movie.region) + "</span><span>" + escapeText(movie.type) + "</span></div>" +
            "<h2><a href=\"" + escapeText(movie.url) + "\">" + escapeText(movie.title) + "</a></h2>" +
            "<p>" + escapeText(movie.line) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function initSearchPage() {
        var input = document.getElementById("searchInput");
        var typeFilter = document.getElementById("typeFilter");
        var button = document.getElementById("searchButton");
        var results = document.getElementById("searchResults");
        var count = document.getElementById("searchCount");
        var title = document.getElementById("searchTitle");
        var data = window.movieSearchData || [];
        if (!input || !button || !results || !data.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
            runSearch();
        }
        function runSearch() {
            var keyword = input.value.trim().toLowerCase();
            var type = typeFilter ? typeFilter.value : "";
            var matches = data.filter(function (movie) {
                var inType = !type || movie.type === type;
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                var inKeyword = !keyword || text.indexOf(keyword) !== -1;
                return inType && inKeyword;
            }).slice(0, 120);
            title.textContent = keyword ? "搜索结果" : "热门结果";
            count.textContent = "找到 " + matches.length + " 部相关影片";
            results.innerHTML = matches.map(cardTemplate).join("");
        }
        button.addEventListener("click", runSearch);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
            }
        });
        if (typeFilter) {
            typeFilter.addEventListener("change", runSearch);
        }
    }

    window.initMoviePlayer = function (url, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !url) {
            return;
        }
        var ready = false;
        var hls = null;
        function loadVideo() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
            video.setAttribute("controls", "controls");
            ready = true;
        }
        function playVideo() {
            loadVideo();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (!ready || video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHeroSlider();
        initSearchPage();
    });
})();
