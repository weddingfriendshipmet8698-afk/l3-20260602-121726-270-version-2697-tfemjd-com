import { H as Hls } from './hls-vendor.js';

function initPlayer(shell) {
  const video = shell.querySelector('video[data-hls]');
  const trigger = shell.querySelector('[data-play-trigger]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-hls');
  let isReady = false;

  function prepare() {
    if (isReady || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isReady = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      isReady = true;
    }
  }

  function playVideo() {
    prepare();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    prepare();
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-shell]').forEach(initPlayer);
});
