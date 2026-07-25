document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle") || document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav") || document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.classList.toggle("active");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("active");
      });
    });
  }
  var btt = document.getElementById("backToTop");
  if (btt) {
    var onScroll = function () {
      if (window.scrollY > 600) btt.classList.add("show");
      else btt.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
