/* Clarity landing page + case study
   - Comfort mode switch (both pages)
   - Section highlight in the nav, equalizer bars and the read-aloud demo (landing page only) */
(function () {
  "use strict";
  var root = document.documentElement;
  var themeColors = { dark: "#0d171b", bright: "#f4f8f8", eye: "#efe3c8" };
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var radios = Array.prototype.slice.call(document.querySelectorAll("[data-mode-btn]"));
  var swatches = Array.prototype.slice.call(document.querySelectorAll("[data-swatch]"));

  /* ---------- Comfort mode ---------- */
  function setMode(mode, moveFocus) {
    root.setAttribute("data-mode", mode);
    radios.forEach(function (b) {
      var on = b.getAttribute("data-mode-btn") === mode;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (on && moveFocus) b.focus();
    });
    swatches.forEach(function (s) {
      s.setAttribute("aria-pressed", s.getAttribute("data-swatch") === mode ? "true" : "false");
    });
    if (metaTheme) metaTheme.setAttribute("content", themeColors[mode]);
    try { localStorage.setItem("clarity-landing-mode", mode); } catch (e) {}
  }

  radios.forEach(function (b, i) {
    b.addEventListener("click", function () { setMode(b.getAttribute("data-mode-btn")); });
    b.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % radios.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + radios.length) % radios.length;
      if (next !== null) {
        e.preventDefault();
        setMode(radios[next].getAttribute("data-mode-btn"), true);
      }
    });
  });
  swatches.forEach(function (s) {
    s.addEventListener("click", function () { setMode(s.getAttribute("data-swatch")); });
  });
  setMode(root.getAttribute("data-mode"));

  /* ---------- Nav highlight for the section being read (landing page) ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  if ("IntersectionObserver" in window && links.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.removeAttribute("aria-current");
          if (a.getAttribute("data-spy") === en.target.id) a.setAttribute("aria-current", "true");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    links.forEach(function (a) {
      var t = document.getElementById(a.getAttribute("data-spy"));
      if (t) io.observe(t);
    });
  }

  /* ---------- Decorative equalizer bars (they move only while the sample is read aloud) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-bars]"), function (el) {
    var n = parseInt(el.getAttribute("data-bars"), 10);
    for (var i = 0; i < n; i++) {
      var bar = document.createElement("i");
      bar.style.setProperty("--h", (28 + ((i * 37) % 62)) + "%");
      bar.style.setProperty("--d", ((i * 0.13) % 0.9).toFixed(2) + "s");
      el.appendChild(bar);
    }
  });

  /* ---------- Read-aloud demo using the visitor's own device voice (landing page) ---------- */
  var btn = document.getElementById("listen");
  if (btn) {
    var label = document.getElementById("listen-label");
    var icon = document.getElementById("listen-icon");
    var sample = document.getElementById("sample");
    var PLAY = "M4 2.5v11l9-5.5z", STOP = "M3.5 3.5h9v9h-9z";

    var setSpeaking = function (on) {
      root.classList.toggle("is-speaking", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      label.textContent = on ? "Stop" : "Listen";
      icon.setAttribute("d", on ? STOP : PLAY);
    };

    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
      btn.hidden = true;
    } else {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-pressed") === "true") {
          speechSynthesis.cancel();
          setSpeaking(false);
          return;
        }
        var u = new SpeechSynthesisUtterance(sample.textContent);
        u.lang = "en";
        u.rate = 0.95;
        u.onend = u.onerror = function () { setSpeaking(false); };
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
        setSpeaking(true);
      });
      window.addEventListener("pagehide", function () { speechSynthesis.cancel(); });
    }
  }
})();
