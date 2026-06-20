(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var started = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function playVideo() {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    function attachStream() {
      video.setAttribute("controls", "controls");
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        playVideo();
        return;
      }
      video.src = streamUrl;
      video.load();
      playVideo();
    }

    if (cover) {
      cover.addEventListener("click", attachStream);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        attachStream();
      }
    });

    video.addEventListener("ended", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
        hls = null;
        started = false;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
