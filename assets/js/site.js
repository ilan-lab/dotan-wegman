/* ===== CONFIG: Dotan's contact. Change here only. ===== */
var CONFIG = {
  phoneIntl: "972502253595",      // WhatsApp / tel, international format, digits only
  phoneLocal: "050-225-3595"
};
/* ====================================================== */
(function () {
  var MSG = {
    hero: "היי דותן, ראיתי את הדף על גלי הלם ממוקדים ואשמח לשמוע אם זה מתאים לי.",
    cond: "היי דותן, רציתי לשאול אם טיפול בגלי הלם ממוקדים יכול להתאים לכאב שלי.",
    about: "היי דותן, אשמח לתאם שיחה לגבי טיפול.",
    work: "היי דותן, ראיתי את הדף ואשמח שתבדוק אם הטיפול מתאים לי.",
    sticky: "היי דותן, הגעתי מהדף על גלי הלם ממוקדים ואשמח לפרטים."
  };
  var wa = function (t) { return "https://wa.me/" + CONFIG.phoneIntl + (t ? "?text=" + encodeURIComponent(t) : ""); };
  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = wa(MSG[a.dataset.msg] || MSG.sticky); });
  document.querySelectorAll("[data-tel]").forEach(function (a) { a.href = "tel:+" + CONFIG.phoneIntl; if (a.dir === "ltr") a.textContent = CONFIG.phoneLocal; });

  /* lead form -> WhatsApp */
  var f = document.getElementById("leadForm");
  if (f) {
    var setErr = function (el, msg) { var e = document.getElementById("e-" + el.name); el.setAttribute("aria-invalid", msg ? "true" : "false"); e.textContent = msg || ""; };
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var n = f.elements.name, p = f.elements.phone, ok = true;
      var name = n.value.trim(), phone = p.value.replace(/[^\d+]/g, "");
      if (name.length < 2) { setErr(n, "נא לכתוב שם"); ok = false; } else setErr(n);
      if (!/^(\+?972|0)5\d{8}$|^(\+?972|0)[2-9]\d{7,8}$/.test(phone)) { setErr(p, "נא לכתוב מספר טלפון תקין"); ok = false; } else setErr(p);
      if (!ok) { (n.getAttribute("aria-invalid") === "true" ? n : p).focus(); return; }
      var pains = [].slice.call(f.querySelectorAll("input[name=pain]:checked")).map(function (c) { return c.value; });
      var note = f.elements.note.value.trim();
      var t = "היי דותן, הגעתי מהדף על גלי הלם ממוקדים.\n" +
        "שם: " + name + "\n" +
        "טלפון: " + p.value.trim() + "\n" +
        "מה כואב: " + (pains.length ? pains.join(", ") : "לא צוין") +
        (note ? "\nפרטים: " + note : "") +
        "\nאשמח לבדוק התאמה לטיפול.";
      window.location.href = wa(t);
    });
    ["name", "phone"].forEach(function (k) { f.elements[k].addEventListener("input", function () { if (this.getAttribute("aria-invalid") === "true") setErr(this); }); });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* reveal on view (opacity/transform/clip only, no layout) */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.setProperty("--d", (i * 0.08).toFixed(2) + "s"); });
  });
  var els = document.querySelectorAll("[data-r],[data-ph],[data-stagger]");
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* sticky WhatsApp bar: show after hero CTA leaves view, hide over the lead form */
  var st = document.getElementById("sticky"), cta = document.querySelector(".hero-cta"), lead = document.getElementById("lead");
  if (st && cta && "IntersectionObserver" in window) {
    var heroOut = false, leadIn = false, upd = function () { st.classList.toggle("show", heroOut && !leadIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe(cta);
    new IntersectionObserver(function (e) { leadIn = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(lead);
  }

  /* GSAP: gentle parallax on the photo band + focus-diagram wave loop.
     transform only, rAF-batched, runs only while the element is on screen. */
  window.addEventListener("load", function () {
    if (reduce || !window.gsap) return;
    var g = window.gsap;

    var px = [];
    var band = document.querySelector("[data-px]");
    if (band) px.push({ el: band, box: band.parentElement, amt: 0.12, set: g.quickSetter(band, "y", "px"), on: false });
    if (px.length) {
      var vh = window.innerHeight, ticking = false;
      var run = function () {
        ticking = false;
        px.forEach(function (p) {
          if (!p.on) return;
          var r = p.box.getBoundingClientRect();
          var c = r.top + r.height / 2 - vh / 2;
          var lim = r.height * (p.hero ? 0.04 : 0.09);
          p.set(Math.max(-lim, Math.min(lim, c * p.amt)));
        });
      };
      var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { px.forEach(function (p) { if (p.box === e.target) p.on = e.isIntersecting; }); }); });
      px.forEach(function (p) { pio.observe(p.box); });
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
      window.addEventListener("resize", function () { vh = window.innerHeight; }, { passive: true });
    }

    var svg = document.getElementById("focus-svg");
    if (!svg) return;
    var tl = g.timeline({ repeat: -1, paused: true });
    tl.fromTo("#waves .wv", { y: -14, autoAlpha: 0 }, { y: 20, autoAlpha: 1, duration: 1.1, ease: "sine.in", stagger: 0.16 })
      .to("#waves .wv", { autoAlpha: 0, duration: 0.3, stagger: 0.16 }, 0.8)
      .fromTo("#fpulse", { scale: 0.6, transformOrigin: "50% 50%", autoAlpha: 0.9 }, { scale: 1.8, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 1.0);
    new IntersectionObserver(function (e) { e[0].isIntersecting ? tl.play() : tl.pause(); }).observe(svg);
  });
})();
