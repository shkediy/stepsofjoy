(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var header = document.querySelector(".site-header");
  var videoDialog = document.getElementById("welcome-video-dialog");
  var openBtn = document.getElementById("welcome-video-open");
  var video = document.getElementById("welcome-video-player");
  var galleryLb = document.getElementById("gallery-lightbox");

  function refreshBodyOverflow() {
    var videoOpen = videoDialog && !videoDialog.hasAttribute("hidden");
    var galleryOpen = galleryLb && !galleryLb.hasAttribute("hidden");
    var menuOpen = nav && nav.classList.contains("is-open");
    document.body.style.overflow =
      videoOpen || galleryOpen || menuOpen ? "hidden" : "";
  }

  if (nav && toggle) {
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      if (header) header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      refreshBodyOverflow();
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          setOpen(false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        setOpen(false);
      }
    });
  }

  var closeVideoDialog = null;

  if (openBtn && videoDialog && video) {
    var vBackdrop = videoDialog.querySelector(".video-lightbox-backdrop");
    var closeBtn = videoDialog.querySelector(".video-lightbox-close");
    var lastVideoFocus = null;

    function isVideoOpen() {
      return !videoDialog.hasAttribute("hidden");
    }

    function openVideoDialog() {
      lastVideoFocus = document.activeElement;
      videoDialog.removeAttribute("hidden");
      refreshBodyOverflow();

      void videoDialog.offsetWidth;
      void video.offsetWidth;
      if (typeof video.getBoundingClientRect === "function") {
        video.getBoundingClientRect();
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function () {}).catch(function (err) {
          if (err && err.name === "AbortError") return;
          video.load();
          video.addEventListener(
            "canplay",
            function () {
              video.play().catch(function () {});
            },
            { once: true }
          );
        });
      }

      window.setTimeout(function () {
        if (closeBtn) closeBtn.focus();
      }, 0);
    }

    closeVideoDialog = function () {
      videoDialog.setAttribute("hidden", "");
      video.pause();
      video.currentTime = 0;
      refreshBodyOverflow();
      if (lastVideoFocus && typeof lastVideoFocus.focus === "function") {
        lastVideoFocus.focus();
      }
    };

    openBtn.addEventListener("click", openVideoDialog);
    if (closeBtn) closeBtn.addEventListener("click", closeVideoDialog);
    if (vBackdrop) vBackdrop.addEventListener("click", closeVideoDialog);
  }

  var closeGalleryDialog = null;

  if (galleryLb) {
    var thumbs = document.querySelectorAll(".gallery-thumb");
    if (thumbs.length) {
      var gBackdrop = galleryLb.querySelector(".gallery-lightbox-backdrop");
      var gClose = galleryLb.querySelector(".gallery-lightbox-close");
      var gPrev = galleryLb.querySelector(".gallery-nav-prev");
      var gNext = galleryLb.querySelector(".gallery-nav-next");
      var gImg = document.getElementById("gallery-lightbox-img");
      var gCap = document.getElementById("gallery-lightbox-caption");
      var items = [];
      var gIndex = 0;
      var lastGalleryFocus = null;

      thumbs.forEach(function (btn) {
        var im = btn.querySelector("img");
        if (!im) return;
        var full =
          im.getAttribute("data-full-src") || im.getAttribute("src") || "";
        items.push({
          fullSrc: full,
          alt: im.getAttribute("alt") || "",
        });
      });

      function showGalleryIndex(i) {
        if (!items.length || !gImg) return;
        gIndex = (i + items.length) % items.length;
        var it = items[gIndex];
        gImg.src = it.fullSrc;
        gImg.alt = it.alt;
        if (gCap) {
          gCap.textContent = it.alt || "";
          gCap.hidden = !it.alt;
        }
      }

      function openGalleryAt(i) {
        lastGalleryFocus = document.activeElement;
        showGalleryIndex(i);
        galleryLb.removeAttribute("hidden");
        refreshBodyOverflow();
        window.setTimeout(function () {
          if (gClose) gClose.focus();
        }, 0);
      }

      closeGalleryDialog = function () {
        galleryLb.setAttribute("hidden", "");
        refreshBodyOverflow();
        if (lastGalleryFocus && typeof lastGalleryFocus.focus === "function") {
          lastGalleryFocus.focus();
        }
      };

      thumbs.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          openGalleryAt(idx);
        });
      });

      if (gClose) gClose.addEventListener("click", closeGalleryDialog);
      if (gBackdrop) gBackdrop.addEventListener("click", closeGalleryDialog);
      if (gPrev) {
        gPrev.addEventListener("click", function () {
          showGalleryIndex(gIndex - 1);
        });
      }
      if (gNext) {
        gNext.addEventListener("click", function () {
          showGalleryIndex(gIndex + 1);
        });
      }

      if (items.length < 2) {
        if (gPrev) gPrev.hidden = true;
        if (gNext) gNext.hidden = true;
      }
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (galleryLb && !galleryLb.hasAttribute("hidden")) {
        if (closeGalleryDialog) closeGalleryDialog();
        return;
      }
      if (videoDialog && !videoDialog.hasAttribute("hidden")) {
        if (closeVideoDialog) closeVideoDialog();
      }
      return;
    }

    if (!galleryLb || galleryLb.hasAttribute("hidden")) return;
    if (e.key === "ArrowLeft") {
      var p = galleryLb.querySelector(".gallery-nav-prev");
      if (p && !p.hidden) {
        e.preventDefault();
        p.click();
      }
    } else if (e.key === "ArrowRight") {
      var n = galleryLb.querySelector(".gallery-nav-next");
      if (n && !n.hidden) {
        e.preventDefault();
        n.click();
      }
    }
  });
})();
