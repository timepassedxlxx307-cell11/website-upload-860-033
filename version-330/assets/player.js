import { H as Hls } from './video-vendor-dru42stk.js';

(function () {
  var video = document.getElementById('movie-player');
  var playButton = document.querySelector('[data-play-button]');
  var overlay = document.querySelector('[data-play-overlay]');
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function attachSource() {
    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.dataset.ready = 'true';
      return;
    }

    video.src = source;
    video.dataset.ready = 'true';
  }

  function playVideo() {
    attachSource();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
