(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        const menuButton = document.querySelector("[data-menu-button]");
        const mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        const carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
            const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
            const prev = carousel.querySelector("[data-hero-prev]");
            const next = carousel.querySelector("[data-hero-next]");
            let active = 0;
            let timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
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
                    show(active - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        const list = document.querySelector("[data-movie-list]");
        if (list) {
            const cards = Array.from(list.querySelectorAll(".movie-card"));
            const input = document.querySelector("[data-filter-input]");
            const category = document.querySelector("[data-category-filter]");
            const type = document.querySelector("[data-type-filter]");
            const empty = document.querySelector("[data-empty]");
            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query && input) {
                input.value = query;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function filter() {
                const q = normalize(input && input.value);
                const cat = category ? category.value : "all";
                const typ = type ? type.value : "all";
                let visible = 0;
                cards.forEach(function (card) {
                    const haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    const matchText = !q || haystack.indexOf(q) !== -1;
                    const matchCategory = cat === "all" || card.getAttribute("data-category") === cat;
                    const matchType = typ === "all" || card.getAttribute("data-type") === typ;
                    const isVisible = matchText && matchCategory && matchType;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, category, type].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", filter);
                    node.addEventListener("change", filter);
                }
            });
            filter();
        }
    });

    window.initMoviePlayer = function (source) {
        const video = document.querySelector("[data-player]");
        const cover = document.querySelector("[data-player-cover]");
        if (!video || !source) {
            return;
        }
        let loaded = false;
        let hls = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            const playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    };
})();
