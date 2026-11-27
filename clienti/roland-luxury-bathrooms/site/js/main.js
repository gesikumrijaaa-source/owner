(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: solid background once the page scrolls */
  var header = document.querySelector("[data-header]");
  if (header && !header.classList.contains("is-page")) {
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu */
  var toggle = document.querySelector("[data-menu]");
  if (toggle) {
    var setMenu = function (open) {
      document.documentElement.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.querySelectorAll("#nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Hero video: landscape or portrait cut, never for reduced motion or data saver */
  var video = document.querySelector("[data-hero-video]");
  var vToggle = document.querySelector("[data-video-toggle]");
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) {
      document.documentElement.classList.add("no-video");
    } else {
      var portrait = window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
      var base = portrait ? "/video/roland-reel-9x16" : "/video/roland-reel-16x9";
      video.poster = base + "-poster.webp";
      video.src = base + (video.canPlayType('video/webm; codecs="vp9"') ? ".webm" : ".mp4");
      video.preload = "auto";
      var p = video.play();
      if (p && p.catch) p.catch(function () { document.documentElement.classList.add("no-video"); });
      if (vToggle) {
        vToggle.addEventListener("click", function () {
          if (video.paused) { video.play(); vToggle.setAttribute("aria-pressed", "false"); }
          else { video.pause(); vToggle.setAttribute("aria-pressed", "true"); }
        });
      }
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) video.pause();
        else if (vToggle && vToggle.getAttribute("aria-pressed") !== "true") video.play();
      });
    }
  }

  /* Before / after comparison */
  document.querySelectorAll("[data-compare]").forEach(function (fig) {
    var range = fig.querySelector(".compare-range");
    var dragging = false;

    var set = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      fig.style.setProperty("--pos", pct + "%");
      range.value = Math.round(pct);
    };
    var fromEvent = function (e) {
      var r = fig.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    fig.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      fig.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    fig.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    var stop = function () { dragging = false; };
    fig.addEventListener("pointerup", stop);
    fig.addEventListener("pointercancel", stop);
    fig.addEventListener("click", function () { range.focus({ preventScroll: true }); });
    range.addEventListener("input", function () { set(Number(range.value)); });
  });

  /* Before / after: switch between bathrooms */
  var stage = document.querySelector("[data-switcher]");
  var tabs = document.querySelectorAll(".t-tabs [role=tab]");
  var caption = document.querySelector("[data-caption]");
  if (stage && tabs.length) {
    var after = stage.querySelector(".compare-after");
    var before = stage.querySelector(".compare-before img");

    var show = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      var n = tab.dataset.pair, w = tab.dataset.w, h = tab.dataset.h;
      var src = function (kind, size) { return "/img/pair-" + n + "-" + kind + "-" + size + ".webp"; };
      stage.classList.add("is-swapping");
      var pending = 2;
      var done = function () { if (--pending === 0) stage.classList.remove("is-swapping"); };
      setTimeout(function () {
        [[after, "after", tab.dataset.afterAlt], [before, "before", tab.dataset.beforeAlt]].forEach(function (x) {
          var img = x[0];
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          img.srcset = src(x[1], 800) + " 800w, " + src(x[1], 1600) + " 1600w";
          img.src = src(x[1], 1600);
          img.width = w; img.height = h;
          img.alt = x[2];
        });
        stage.style.setProperty("--ratio", w + " / " + h);
        stage.style.setProperty("--pos", "50%");
        stage.querySelector(".compare-range").value = 50;
      }, reduceMotion ? 0 : 200);
      if (caption) caption.textContent = tab.querySelector(".t-note").textContent;
    };

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", function () { if (tab.getAttribute("aria-selected") !== "true") show(tab); });
      tab.addEventListener("keydown", function (e) {
        var k = e.key, next = null;
        if (k === "ArrowDown" || k === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (k === "ArrowUp" || k === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); show(next); }
      });
    });
  }

  /* Gallery lightbox */
  var lb = document.querySelector("[data-lightbox]");
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-gallery] img"));
  if (lb && items.length && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img");
    var idx = 0;
    var open = function (i) {
      idx = (i + items.length) % items.length;
      lbImg.src = items[idx].dataset.full;
      lbImg.alt = items[idx].alt;
      if (!lb.open) lb.showModal();
    };
    items.forEach(function (img, i) {
      img.closest("button").addEventListener("click", function () { open(i); });
    });
    lb.addEventListener("click", function (e) {
      var act = e.target.closest("[data-lb]");
      if (act) {
        var a = act.dataset.lb;
        if (a === "close") lb.close();
        if (a === "prev") open(idx - 1);
        if (a === "next") open(idx + 1);
      } else if (e.target === lb) {
        lb.close();
      }
    });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") open(idx - 1);
      if (e.key === "ArrowRight") open(idx + 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) open(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* Form validation (Netlify handles the submission) */
  var form = document.querySelector("[data-form]");
  if (form) {
    var check = function (input) {
      var ok = input.checkValidity() && input.value.trim() !== "";
      var field = input.closest(".field");
      field.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      var err = field.querySelector(".err");
      if (err) input.setAttribute("aria-describedby", err.id);
      return ok;
    };
    var required = form.querySelectorAll("[required]");
    required.forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) check(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) check(input);
      });
    });
    form.addEventListener("submit", function (e) {
      var first = null;
      required.forEach(function (input) { if (!check(input) && !first) first = input; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
