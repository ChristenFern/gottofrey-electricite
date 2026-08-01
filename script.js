/* ============================================================
   GOTTOFREY — Installations électriques
   Nav mobile · header au scroll · retour haut · envoi WhatsApp
   · scroll-reveal en cascade · compteurs animés

   Vanilla, zéro dépendance.
   - prefers-reduced-motion coupe tout le mouvement.
   - Aucun contenu ne dépend du JS pour être visible : les classes
     d'animation sont posées par le script, jamais dans le HTML.
   - Le hero est volontairement exclu du reveal (c'est le LCP).
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav mobile ---------- */
  function initNav() {
    var toggle = document.getElementById("navToggle") || document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav") || document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header : ombre au scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Retour en haut ---------- */
  function initBackToTop() {
    var btt = document.getElementById("backToTop");
    if (!btt) return;
    var onScroll = function () {
      btt.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Formulaire → WhatsApp (repli e-mail) ---------- */
  function initForms() {
    document.querySelectorAll("form[data-wa]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        if (f.reportValidity && !f.reportValidity()) return;

        var lines = [f.getAttribute("data-wa-intro") || "Bonjour,", ""];
        f.querySelectorAll("input, select, textarea").forEach(function (el) {
          if (!el.name) return;
          var type = (el.type || "").toLowerCase();
          if (type === "hidden" || type === "submit" || type === "button") return;
          if ((type === "checkbox" || type === "radio") && !el.checked) return;
          var value = (el.value || "").trim();
          if (!value) return;
          var label = "";
          if (el.id) {
            var l = f.querySelector('label[for="' + el.id + '"]');
            if (l) label = l.textContent.replace(/\*/g, "").trim();
          }
          if (!label) label = el.getAttribute("placeholder") || el.name;
          lines.push(label + " : " + value);
        });

        var body = lines.join("\n");
        var win = window.open(
          "https://wa.me/" + f.getAttribute("data-wa") + "?text=" + encodeURIComponent(body),
          "_blank"
        );

        // Repli e-mail si l'ouverture de WhatsApp est bloquée.
        var mail = f.getAttribute("data-wa-fallback");
        if (!win && mail) {
          window.location.href =
            "mailto:" + mail +
            "?subject=" + encodeURIComponent("Demande via le site Gottofrey") +
            "&body=" + encodeURIComponent(body);
        }
      });
    });
  }

  /* ---------- Scroll-reveal en cascade ---------- */
  var REVEAL = [
    ".section-head", ".sector", ".svc", ".svc-row", ".svc-preview",
    ".review", ".g-badge", ".pf-grid:not(#grid) .pf-item", ".zone",
    ".trust-cell", ".info-card", ".step", ".frow", ".alert-item",
    ".lstat", ".mini-svc a", ".nearby-grid a", ".faq details",
    ".about-media", ".about > div", ".cta-band", ".contact-info .ci",
    ".form", ".kwbox", ".prose > h2", ".prose > p", ".prose > ul"
  ].join(",");

  function initReveal() {
    if (reduced || !("IntersectionObserver" in window)) return;

    var nodes = [].slice.call(document.querySelectorAll(REVEAL));
    if (!nodes.length) return;

    // Décale les frères d'un même parent pour obtenir une cascade
    // plutôt qu'un bloc entier qui apparaît d'un coup.
    var seen = new Map();
    nodes.forEach(function (el) {
      var parent = el.parentNode;
      var n = seen.get(parent) || 0;
      seen.set(parent, n + 1);
      el.classList.add("js-reveal");
      el.style.setProperty("--reveal-delay", Math.min(n, 6) * 70 + "ms");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    nodes.forEach(function (el) { io.observe(el); });

    // Filet de sécurité : si l'observer n'a rien émis (onglet en
    // arrière-plan, restauration de scroll…), on affiche quand même.
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-in");
        }
      });
    }, 400);
  }

  /* ---------- Compteurs animés ---------- */
  function initCounters() {
    var counters = [].slice.call(document.querySelectorAll("[data-count]"));
    if (!counters.length) return;

    var run = function (el) {
      var raw = el.getAttribute("data-count");
      var target = parseFloat(raw);
      if (isNaN(target)) return;
      var suffix = el.getAttribute("data-count-suffix") || "";
      var decimals = (raw.split(".")[1] || "").length;

      if (reduced) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var duration = 1200, start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io.observe(el); });
  }

  function init() {
    document.documentElement.setAttribute("data-js", "on");
    initNav();
    initHeader();
    initBackToTop();
    initForms();
    initReveal();
    initCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
