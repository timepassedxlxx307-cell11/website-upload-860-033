(function () {
    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
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
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
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
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function applyFilters(section) {
        var input = section.querySelector("[data-search-input]");
        var query = normalizeText(input ? input.value : "");
        var activeFilters = {};
        Array.prototype.slice.call(section.querySelectorAll(".filter-chip.active")).forEach(function (button) {
            var key = button.getAttribute("data-filter-key");
            var value = button.getAttribute("data-filter-value") || "";
            if (key) {
                activeFilters[key] = value;
            }
        });
        Array.prototype.slice.call(section.querySelectorAll("[data-search-item]")).forEach(function (item) {
            var text = normalizeText(item.textContent);
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesYear = !activeFilters.year || item.getAttribute("data-year") === activeFilters.year;
            var matchesType = !activeFilters.type || item.getAttribute("data-type") === activeFilters.type;
            item.classList.toggle("is-hidden-card", !(matchesQuery && matchesYear && matchesType));
        });
    }

    function setupFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-interactive-section]")).forEach(function (section) {
            var input = section.querySelector("[data-search-input]");
            if (input) {
                input.addEventListener("input", function () {
                    applyFilters(section);
                });
            }
            Array.prototype.slice.call(section.querySelectorAll("[data-filter-group]")).forEach(function (group) {
                group.addEventListener("click", function (event) {
                    var button = event.target.closest(".filter-chip");
                    if (!button) {
                        return;
                    }
                    Array.prototype.slice.call(group.querySelectorAll(".filter-chip")).forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applyFilters(section);
                });
            });
            applyFilters(section);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !sourceUrl) {
        return;
    }
    var initialized = false;
    function attachSource() {
        if (initialized) {
            return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = sourceUrl;
    }
    function startPlayback() {
        attachSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }
    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-detail-play]")).forEach(function (button) {
        button.addEventListener("click", startPlayback);
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
