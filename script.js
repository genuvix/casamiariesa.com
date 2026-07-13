(function () {
  "use strict";

  /* ===================== LANGUAGE ===================== */
  var LANG_KEY = "cmr-lang";
  var html = document.documentElement;

  function applyLang(lang) {
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var value = el.getAttribute("data-" + lang);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", value);
      } else {
        el.textContent = value;
      }
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    html.setAttribute("lang", lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function initLang() {
    var saved = "de";
    try { saved = localStorage.getItem(LANG_KEY) || "de"; } catch (e) {}
    applyLang(saved);
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ===================== HEADER / NAV ===================== */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    var burger = document.getElementById("burger");
    var nav = document.getElementById("mainNav");

    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===================== SCROLL PROGRESS ===================== */
  function initProgress() {
    var bar = document.getElementById("progressBar");
    function update() {
      var h = document.documentElement;
      var scrollable = h.scrollHeight - h.clientHeight;
      var pct = scrollable > 0 ? (h.scrollTop || window.scrollY) / scrollable * 100 : 0;
      bar.style.width = pct + "%";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ===================== HERO PARALLAX ZOOM ===================== */
  function initHeroZoom() {
    var bg = document.getElementById("heroBg");
    var hero = document.querySelector(".hero");
    if (!bg || !hero) return;
    var ticking = false;

    function update() {
      var rect = hero.getBoundingClientRect();
      var heroHeight = hero.offsetHeight;
      // progress 0 at top of hero in view, 1 once scrolled past hero height
      var progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1);
      var scale = 1.05 + progress * 0.35;
      bg.style.transform = "scale(" + scale + ")";
      ticking = false;
    }
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ===================== SCROLL ZOOM REVEAL ===================== */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -2% 0px"
    });

    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      observer.observe(el);
    });

    // Safety net: on touch devices the visual viewport can change height
    // (address bar / keyboard show-hide) without a "scroll" event firing
    // for elements already on screen. Re-check on resize/orientation change
    // so nothing stays stuck invisible.
    function recheck() {
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var visible = r.top < window.innerHeight && r.bottom > 0;
        if (visible) el.classList.add("in-view");
      });
    }
    window.addEventListener("resize", recheck);
    window.addEventListener("orientationchange", recheck);
    window.addEventListener("load", recheck);
  }

  /* ===================== MENU TABS ===================== */
  function initMenuTabs() {
    var tabs = document.querySelectorAll(".menu-tab");
    var panels = document.querySelectorAll(".menu-panel");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-cat");
        tabs.forEach(function (t) { t.classList.toggle("active", t === tab); });
        panels.forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-cat") === cat);
        });
        // re-trigger reveal animation for newly shown items
        panels.forEach(function (p) {
          if (p.classList.contains("active")) {
            p.querySelectorAll(".reveal").forEach(function (el) {
              el.classList.remove("in-view");
              requestAnimationFrame(function () {
                requestAnimationFrame(function () { el.classList.add("in-view"); });
              });
            });
          }
        });
      });
    });
  }


  /* ===================== FOOTER YEAR ===================== */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initHeader();
    initProgress();
    initHeroZoom();
    initReveal();
    initMenuTabs();
    initYear();
  });
})();
