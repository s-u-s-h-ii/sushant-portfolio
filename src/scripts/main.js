import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap; window.ScrollTrigger = ScrollTrigger; window.Lenis = Lenis;

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasG = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lenis = null;

  /* ---------- clock ---------- */
  function tick() {
    var t = "--:--";
    try { t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: false }).format(new Date()); } catch (e) {}
    $$("[data-clock]").forEach(function (e) { e.textContent = t; });
  }
  tick(); setInterval(tick, 20000);

  /* ---------- waveform for the text-to-video card ---------- */
  (function () {
    var p = $("[data-wave]"); if (!p) return;
    var hs = [8, 20, 34, 16, 42, 28, 12, 38, 24, 46, 18, 30, 10, 36, 44, 22, 14, 40, 26, 32, 12, 20, 34, 16], d = "";
    hs.forEach(function (h, i) { d += "M" + (24 + i * 15) + " " + (250 - h / 2) + " v" + h + " "; });
    p.setAttribute("d", d);
  })();

  /* ---------- copy email ---------- */
  var copyBtn = $("#copyBtn");
  copyBtn.addEventListener("click", function () {
    var addr = $("#addr").textContent, done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy email"; }, 1800); };
    var fallback = function () {
      try { var r = document.createRange(); r.selectNodeContents($("#addr")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copyBtn.textContent = "Press Ctrl+C"; setTimeout(function () { copyBtn.textContent = "Copy email"; }, 2400); } catch (e) {}
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, fallback); else fallback();
  });

  /* ---------- menu ---------- */
  var menu = $("#menu"), menuBtn = $("#menuBtn");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  menuBtn.addEventListener("click", function () { setMenu(true); });
  $("#menuClose").addEventListener("click", function () { setMenu(false); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- anchor scrolling ---------- */
  function go(target) {
    var el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  $$("[data-nav]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var h = a.getAttribute("href"); if (!h || h.charAt(0) !== "#") return;
      e.preventDefault(); setMenu(false); go(h === "#top" ? document.body : h);
    });
  });
  $("#toTop").addEventListener("click", function () { if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- header state + progress ---------- */
  var hdr = $("#hdr"), bar = $("#progress"), prog = 0;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.transform = "scaleX(" + prog + ")";
    hdr.classList.toggle("scrolled", scrollY > 40);
    if (reduce) drawBg(0);
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- background light field ---------- */
  var cv = $("#bg"), cx = cv.getContext("2d"), BW = 0, BH = 0, mx = 0, my = 0, sm = 0, smx = 0, smy = 0;
  var SC = 0.3;
  var orbs = [
    { c: "232,87,79",   k: [[.62,.30,.62,.9],  [.88,.5,.55,.62], [.3,.42,.6,.7]] },
    { c: "244,160,154", k: [[.92,.08,.5,.8],   [.18,.2,.45,.4],  [.82,.82,.5,.5]] },
    { c: "8,228,234",   k: [[.40,1.02,.46,.95], [.12,.82,.45,.55], [.7,.95,.56,.85]] },
    { c: "243,213,224", k: [[.84,1.05,.32,.5], [.55,.12,.34,.28], [.5,.7,.32,.35]] },
    { c: "8,228,234",   k: [[1.1,.6,.3,.25],   [.95,.25,.38,.45], [.2,.15,.36,.4]] }
  ];
  function sizeBg() { BW = cv.width = Math.max(2, Math.ceil(innerWidth * SC)); BH = cv.height = Math.max(2, Math.ceil(innerHeight * SC)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sample(k, p) {
    var s = p < .5 ? 0 : 1, t = p < .5 ? p / .5 : (p - .5) / .5; t = t * t * (3 - 2 * t);
    return k[s].map(function (v, i) { return lerp(v, k[s + 1][i], t); });
  }
  function drawBg(time) {
    sm += (prog - sm) * 0.06; smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    cx.globalCompositeOperation = "source-over"; cx.fillStyle = "#050506"; cx.fillRect(0, 0, BW, BH);
    cx.globalCompositeOperation = "screen";
    var m = Math.max(BW, BH);
    orbs.forEach(function (o, i) {
      var v = sample(o.k, sm), t = time * 0.00018 + i * 1.7;
      var x = (v[0] + Math.sin(t * 1.3) * 0.035 + smx * 0.05 * (i + 1) * 0.5) * BW;
      var y = (v[1] + Math.cos(t) * 0.03 + smy * 0.05 * (i + 1) * 0.5) * BH;
      var r = v[2] * m, a = v[3] * 0.85;
      var g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(" + o.c + "," + a + ")");
      g.addColorStop(0.45, "rgba(" + o.c + "," + a * 0.5 + ")");
      g.addColorStop(1, "rgba(" + o.c + ",0)");
      cx.fillStyle = g; cx.fillRect(0, 0, BW, BH);
    });
    cx.globalCompositeOperation = "source-over";
    var gl = cx.createLinearGradient(0, 0, BW * 0.45, 0);
    gl.addColorStop(0, "rgba(5,5,6," + (0.9 - Math.min(0.35, sm)) + ")"); gl.addColorStop(1, "rgba(5,5,6,0)");
    cx.fillStyle = gl; cx.fillRect(0, 0, BW, BH);
    cx.fillStyle = "rgba(5,5,6," + (0.14 + Math.min(0.2, sm * 0.9)) + ")"; cx.fillRect(0, 0, BW, BH);
  }
  sizeBg(); onScroll();
  var lastW = innerWidth;
  addEventListener("resize", function () { if (innerWidth !== lastW) { lastW = innerWidth; sizeBg(); } drawBg(0); });
  addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  if (reduce) { drawBg(0); } else {
    var loop = function (t) { drawBg(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* ---------- prospectivity field illustration (Research section only) ---------- */
  (function () {
    var c = $("#field"); if (!c) return;
    var x = c.getContext("2d"), w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2), px = -999, py = -999, vis = false, cell = 16;
    function fit() { var r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); cell = w < 520 ? 12 : 16; draw(0); }
    function val(i, j, t, cols, rows) {
      var u = i / cols, v = j / rows;
      var a = Math.exp(-(Math.pow(u - .32 - Math.sin(t * .4) * .04, 2) * 30 + Math.pow(v - .55, 2) * 40));
      var b = Math.exp(-(Math.pow(u - .72, 2) * 34 + Math.pow(v - .35 + Math.cos(t * .5) * .05, 2) * 44));
      var n = .12 * (Math.sin(i * .9 + t) + Math.cos(j * 1.1 - t * .7)) + .12;
      return Math.max(0, Math.min(1, a * .95 + b * .8 + n));
    }
    function draw(ts) {
      var t = ts * 0.001, cols = Math.floor(w / cell), rows = Math.floor(h / cell);
      x.clearRect(0, 0, w, h);
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var cxp = i * cell + cell / 2, cyp = j * cell + cell / 2, v = val(i, j, t, cols, rows);
        var d = Math.hypot(cxp - px, cyp - py); if (d < 90) v = Math.min(1, v + (1 - d / 90) * .7);
        var rad = 1 + v * (cell / 2 - 1.5);
        var col = v > .66 ? "244,160,154" : v > .33 ? "232,87,79" : "120,120,130";
        x.fillStyle = "rgba(" + col + "," + (0.28 + v * .72) + ")";
        x.beginPath(); x.arc(cxp, cyp, rad, 0, 6.2832); x.fill();
      }
    }
    fit(); addEventListener("resize", fit);
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; if (reduce) draw(0); });
    c.addEventListener("pointerleave", function () { px = py = -999; if (reduce) draw(0); });
    if (!reduce) {
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }, { threshold: 0.05 }).observe(c);
      (function f(ts) { if (vis) draw(ts); requestAnimationFrame(f); })(0);
    }
  })();

  /* ---------- pixel photos: a canvas redraws the photo at a chosen pixel size ---------- */
  var STEPS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
  function snap(v) { for (var i = STEPS.length - 1; i >= 0; i--) if (v >= STEPS[i]) return STEPS[i]; return 1; }
  function Pixel(canvas, img, fit) {
    if (!canvas || !img) return null;
    var ctx = canvas.getContext("2d"), tmp = document.createElement("canvas"), tctx = tmp.getContext("2d");
    var self = { a: 1, b: 1, c: 1, last: -1, d: 1 };
    function size() {
      var r = canvas.getBoundingClientRect(); self.d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * self.d)); canvas.height = Math.max(1, Math.round(r.height * self.d));
      self.last = -1; self.draw();
    }
    self.draw = function () {
      if (!img.complete || !img.naturalWidth) return;
      var px = snap(Math.max(self.a, self.b, self.c)); if (px === self.last) return; self.last = px;
      var W = canvas.width, H = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight, sx = 0, sy = 0, sw = iw, sh = ih;
      if (fit === "cover") { var k = Math.max(W / iw, H / ih); sw = W / k; sh = H / k; sx = (iw - sw) / 2; sy = (ih - sh) / 2; }
      ctx.clearRect(0, 0, W, H);
      if (px <= 1) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H); img.style.opacity = 0; return; }
      var pw = Math.max(1, Math.round(W / (px * self.d))), ph = Math.max(1, Math.round(H / (px * self.d)));
      tmp.width = pw; tmp.height = ph; tctx.imageSmoothingEnabled = true; tctx.clearRect(0, 0, pw, ph); tctx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, pw, ph, 0, 0, W, H); img.style.opacity = 0;
    };
    if (img.complete && img.naturalWidth) size(); else img.addEventListener("load", size);
    addEventListener("resize", size);
    return self;
  }
  var heroPix = null, aboutPix = null;
  try {
    heroPix = Pixel($(".hero-fig .pix"), $(".hero-fig img"), "contain");
    aboutPix = Pixel($("#aboutPhoto .pix"), $("#aboutPhoto img"), "cover");
  } catch (e) {}

  /* ---------- project art: abstract generative canvases ---------- */
  (function () {
    var PAL = { coral: "232,87,79", salmon: "244,160,154", cyan: "8,228,234", blush: "243,213,224", teal: "11,59,68" };
    function mixRGB(a, b, t) { a = a.split(",").map(Number); b = b.split(",").map(Number); return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }
    $$(".pj-art").forEach(function (cv) {
      var ctx = cv.getContext("2d"), kind = cv.getAttribute("data-art"), W = 0, H = 0, d = 1, vis = false, mx = -1, my = -1, st = {};
      function init() {
        ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, W, H);
        if (kind === "flow") {
          st.groups = [PAL.coral, PAL.salmon, PAL.cyan].map(function (c) { return { c: "rgba(" + c + ",0.9)", p: [] }; });
          for (var i = 0; i < 900; i++) st.groups[i % 3 === 2 ? 2 : (i % 5 === 0 ? 1 : 0)].p.push({ x: Math.random() * W, y: Math.random() * H, l: Math.random() * 200 });
        }
        if (kind === "pixels") {
          st.balls = [[0.9, 1.3, 0, 1.1, 0.12], [1.2, 0.8, 2, 0.4, 0.1], [0.7, 1.1, 4, 2.2, 0.11], [1.4, 0.6, 1, 3.1, 0.085], [0.5, 0.9, 3, 5.0, 0.09]];
        }
      }
      function size() {
        var r = cv.getBoundingClientRect(); if (!r.width) return;
        d = Math.min(devicePixelRatio || 1, 1.5); W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d); init(); frame(performance.now());
      }
      function flow(T) {
        ctx.fillStyle = "rgba(5,5,6,0.08)"; ctx.fillRect(0, 0, W, H);
        var sc = 0.0032 / d, R2 = Math.pow(150 * d, 2), sz = 1.7 * d, sp = 1.5 * d;
        st.groups.forEach(function (g) {
          ctx.fillStyle = g.c;
          g.p.forEach(function (q) {
            var a = (Math.sin(q.x * sc + T * 0.4) + Math.cos(q.y * sc * 1.3 - T * 0.3) + Math.sin((q.x + q.y) * sc * 0.5 + T * 0.2)) * 1.6;
            if (mx >= 0) { var dx = mx - q.x, dy = my - q.y; if (dx * dx + dy * dy < R2) a = Math.atan2(dy, dx) + 1.9; }
            q.x += Math.cos(a) * sp; q.y += Math.sin(a) * sp; q.l -= 1;
            if (q.x < 0 || q.x > W || q.y < 0 || q.y > H || q.l < 0) { q.x = Math.random() * W; q.y = Math.random() * H; q.l = 80 + Math.random() * 220; }
            ctx.fillRect(q.x, q.y, sz, sz);
          });
        });
      }
      function ridges(T) {
        ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, W, H);
        var n = 24, top = H * 0.2, bot = H * 0.92, gap = (bot - top) / (n - 1);
        ctx.lineWidth = 1.4 * d; ctx.lineJoin = "round";
        for (var i = 0; i < n; i++) {
          var y0 = top + i * gap, k = i / (n - 1);
          ctx.beginPath(); ctx.moveTo(-2, y0);
          for (var x = 0; x <= W + 4 * d; x += 4 * d) {
            var u = (x - W * 0.5) / (W * 0.22), env = Math.exp(-u * u), e2 = 0;
            if (mx >= 0) { var v = (x - mx) / (W * 0.09), w = (y0 - my) / (H * 0.22); e2 = Math.exp(-v * v - w * w); }
            var nz = Math.sin(x * 0.018 / d + T * 1.1 + i * 0.6) * 0.5 + Math.sin(x * 0.041 / d - T * 0.7 + i * 1.7) * 0.3 + Math.sin(x * 0.007 / d + T * 0.4 + i * 0.3) * 0.5;
            var h = (env * (0.55 + 0.45 * Math.sin(T * 0.8 + i * 0.4)) + e2) * (24 + 18 * nz) * d * 1.7;
            ctx.lineTo(x, y0 - Math.max(0, h));
          }
          ctx.lineTo(W + 4, H + 4); ctx.lineTo(-4, H + 4); ctx.closePath();
          ctx.fillStyle = "#050506"; ctx.fill();
          ctx.strokeStyle = k < 0.5 ? mixRGB(PAL.cyan, PAL.salmon, k * 2) : mixRGB(PAL.salmon, PAL.coral, (k - 0.5) * 2);
          ctx.stroke();
        }
      }
      function pixels(T) {
        ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, W, H);
        var cols = 44, cell = W / cols, rows = Math.ceil(H / cell), m = Math.min(W, H), g = cell * 0.09, bs = [];
        st.balls.forEach(function (b) { bs.push([W * (0.5 + 0.33 * Math.sin(T * b[0] * 0.5 + b[2])), H * (0.5 + 0.32 * Math.cos(T * b[1] * 0.5 + b[3])), Math.pow(b[4] * m, 2)]); });
        if (mx >= 0) bs.push([mx, my, Math.pow(0.14 * m, 2)]);
        for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
          var x = (i + 0.5) * cell, y = (j + 0.5) * cell, f = 0;
          for (var q = 0; q < bs.length; q++) { var dx = x - bs[q][0], dy = y - bs[q][1]; f += bs[q][2] / (dx * dx + dy * dy + 1); }
          var col = f < 0.3 ? "rgba(246,239,238,0.06)" : f < 0.55 ? "rgb(" + PAL.teal + ")" : f < 0.8 ? "rgb(" + PAL.cyan + ")" : f < 1.15 ? "rgb(" + PAL.salmon + ")" : f < 1.8 ? "rgb(" + PAL.coral + ")" : "rgb(" + PAL.blush + ")";
          ctx.fillStyle = col;
          if (f < 0.3) ctx.fillRect(x - 1 * d, y - 1 * d, 2 * d, 2 * d); else ctx.fillRect(i * cell + g, j * cell + g, cell - 2 * g, cell - 2 * g);
        }
      }
      function frame(now) { if (!W) return; var T = now * 0.001; if (kind === "flow") flow(T); else if (kind === "ridges") ridges(T); else pixels(T); }
      var host = cv.parentElement;
      host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height); });
      host.addEventListener("pointerleave", function () { mx = my = -1; });
      size(); addEventListener("resize", size);
      if (reduce) { if (kind === "flow") for (var k = 0; k < 120; k++) flow(k * 0.016); return; }
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis && !W) size(); }).observe(cv);
      (function f(now) { requestAnimationFrame(f); if (vis) frame(now); })(performance.now());
    });
  })();

  /* ---------- if animation is off or unavailable, stop here ---------- */
  var pre = $("#pre");
  function skipAll() {
    root.classList.add("static");
    if (pre) pre.remove();
    var cur = $(".cursor"); if (cur) cur.remove();
  }
  if (!hasG || reduce) { skipAll(); return; }

  /* ---------- animated experience ---------- */
  var started = false;
  try {
    gsap.registerPlugin(ScrollTrigger);
    root.style.overflow = "hidden";

    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }

    function split(el, mode) {
      var txt = el.textContent.replace(/\s+/g, " ").trim(), out = [];
      if (!el.closest("[aria-label]")) el.setAttribute("aria-label", txt);
      el.textContent = "";
      txt.split(" ").forEach(function (word, i, arr) {
        var ws = document.createElement("span"); ws.className = mode === "plain" ? "sw" : "w"; ws.setAttribute("aria-hidden", "true");
        if (mode === "plain") { ws.style.display = "inline-block"; ws.textContent = word; out.push(ws); }
        else {
          var wi = document.createElement("span"); wi.className = "wi";
          if (mode === "chars") { Array.prototype.forEach.call(word, function (ch) { var s = document.createElement("span"); s.className = "c"; s.textContent = ch; wi.appendChild(s); out.push(s); }); }
          else { wi.textContent = word; out.push(wi); }
          ws.appendChild(wi);
        }
        el.appendChild(ws);
        if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
      });
      return out;
    }

    /* hero pieces, held until the preloader lifts */
    var nameChars = []; $$("#heroName [data-chars]").forEach(function (l) { nameChars = nameChars.concat(split(l, "chars")); });
    var copyWords = split($("#heroCopy"), "words");
    gsap.set(nameChars, { yPercent: 115, rotate: 5 });
    gsap.set(copyWords, { yPercent: 115 });
    gsap.set(["#heroRole", "#heroCta", "#hdr"], { opacity: 0 });
    var bigWords = []; $$("#bigHead [data-words]").forEach(function (l) { bigWords = bigWords.concat(split(l, "words")); });

    var count = $("#preCount"), obj = { n: 0 }, win = $("#preWin"), slides = $$(".pre-slide"), lbl = $("#preLbl");
    var words = ["Research", "Geoscience", "Machine learning", "Computer vision"];
    function show(i) { slides.forEach(function (sl, k) { sl.style.visibility = k === i ? "visible" : "hidden"; }); lbl.textContent = words[i]; }
    function winBox() {
      var W = innerWidth, H = innerHeight, w = Math.min(Math.max(150, W * 0.17), 250), h = w * 4 / 3, t = (H - h) / 2 - H * 0.04, sd = (W - w) / 2;
      return "inset(" + t + "px " + sd + "px " + (H - t - h) + "px " + sd + "px round 6px)";
    }
    show(0);
    gsap.set(win, { clipPath: "inset(" + innerHeight / 2 + "px " + innerWidth / 2 + "px " + innerHeight / 2 + "px " + innerWidth / 2 + "px round 6px)" });
    gsap.set(slides, { scale: 1.3 });
    gsap.set("#heroFig", { yPercent: 22, opacity: 0 });
    var intro = gsap.timeline({ paused: true, onComplete: function () {
      pre.remove(); root.style.overflow = ""; if (lenis) lenis.start(); ScrollTrigger.refresh();
    } });
    intro.to(win, { clipPath: winBox, duration: 0.9, ease: "expo.out" }, 0)
      .to(obj, { n: 100, duration: 2.6, ease: "power2.inOut", onUpdate: function () { count.textContent = Math.round(obj.n); } }, 0);
    (function () { var t = 0.55, gap = 0.42, k = 1; while (t < 2.45) { intro.call(show, [k % 4], t); k++; t += gap; gap = Math.max(0.08, gap * 0.78); } intro.call(show, [3], 2.5); })();
    intro.to([".pre-top", ".pre-name", ".pre-count", "#preLbl"], { opacity: 0, duration: 0.4, ease: "power2.out" }, 2.65)
      .to(win, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 1.1, ease: "expo.inOut" }, 2.7)
      .to(slides, { scale: 1, duration: 1.1, ease: "expo.inOut" }, 2.7)
      .to(win, { clipPath: function () { return "inset(0px 0px " + innerHeight + "px 0px round 0px)"; }, duration: 0.9, ease: "power4.inOut" }, 3.95)
      .to(".pre-cols i", { yPercent: -100, duration: 0.9, ease: "power4.inOut", stagger: 0.06 }, 4.05)
      .from(".guides i", { scaleY: 0, duration: 1.6, ease: "power4.inOut", stagger: 0.08 }, 4.1)
      .to("#heroFig", { yPercent: 0, opacity: 0.28, duration: 1.5, ease: "power4.out" }, 4.25)
      .to(nameChars, { yPercent: 0, rotate: 0, duration: 1.2, ease: "power4.out", stagger: 0.045 }, 4.3)
      .to(copyWords, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.012 }, 4.5)
      .to(["#heroRole", "#heroCta", "#hdr"], { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 }, 4.55);
    if (heroPix) intro.fromTo(heroPix, { a: 64 }, { a: 1, duration: 1.9, ease: "power2.out", onUpdate: heroPix.draw }, 4.25);
    pre.addEventListener("click", function () { intro.timeScale(3); });
    function imgReady(src) { return new Promise(function (r) { var im = new Image(); im.onload = im.onerror = function () { r(); }; im.src = src; }); }
    Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : null]),
      new Promise(function (r) { setTimeout(r, 1800); })
    ]).then(function () { intro.play(); });
    started = true;

    /* hero parallax on scroll */
    var heroLines = $$("#heroName .line");
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
      .to(heroLines[0], { xPercent: -22, ease: "none" }, 0)
      .to(heroLines[1], { xPercent: 22, ease: "none" }, 0)
      .to(".hero-fig-in", { yPercent: -12, scale: 1.06, ease: "none" }, 0)
      .to(heroPix || {}, { b: 32, ease: "none", onUpdate: function () { if (heroPix) heroPix.draw(); } }, 0)
      .to("#heroName", { yPercent: 40, scale: 0.92, opacity: 0.2, ease: "none" }, 0)
      .to(".role", { yPercent: -80, ease: "none" }, 0)
      .to(".hero-foot", { yPercent: -30, opacity: 0, ease: "none" }, 0);

    /* headings and paragraphs: masked word reveals */
    $$("[data-reveal]").forEach(function (el) {
      var w = split(el, "words");
      gsap.from(w, { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.07, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    $$("[data-lines]").forEach(function (el) {
      var w = split(el, "words");
      gsap.from(w, { yPercent: 110, duration: 0.85, ease: "power4.out", stagger: 0.012, scrollTrigger: { trigger: el, start: "top 92%" } });
    });
    gsap.from(bigWords, { yPercent: 115, duration: 1.2, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: "#bigHead", start: "top 85%" } });

    /* statement: words light up as you read */
    var sw = split($("#statement"), "plain");
    gsap.fromTo(sw, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: "#statement", start: "top 78%", end: "bottom 50%", scrub: true } });

    /* hairlines draw in */
    $$(".fact").forEach(function (f, i) {
      var l = document.createElement("span"); l.style.cssText = "position:absolute;left:0;right:1.5rem;top:0;height:1px;background:var(--cyan);transform-origin:left;"; f.appendChild(l);
      gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power4.out", delay: i * 0.12, scrollTrigger: { trigger: f, start: "top 90%" } });
      gsap.to(l, { opacity: 0, duration: 0.6, delay: 1.2 + i * 0.12, scrollTrigger: { trigger: f, start: "top 90%" } });
    });
    $$(".kit-row").forEach(function (r) {
      var l = document.createElement("span"); l.style.cssText = "position:absolute;left:0;right:0;top:0;height:1px;background:var(--ink);transform-origin:left;pointer-events:none;"; r.appendChild(l);
      gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: r, start: "top 92%" } });
      gsap.to(l, { opacity: 0, duration: 0.5, delay: 1.1, scrollTrigger: { trigger: r, start: "top 92%" } });
    });

    /* about photo: if present, wipes open and drifts */
    if ($("#aboutPhoto")) {
      gsap.fromTo("#aboutPhoto", { clipPath: "inset(100% 0% 0% 0% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.4, ease: "power4.inOut", scrollTrigger: { trigger: "#aboutPhoto", start: "top 85%" } });
      gsap.fromTo("#aboutPhoto .pix-in", { yPercent: -16 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: "#aboutPhoto", start: "top bottom", end: "bottom top", scrub: true } });

      if (aboutPix) {
        aboutPix.a = 64; aboutPix.draw();
        gsap.to(aboutPix, { a: 1, duration: 1.9, ease: "power2.out", onUpdate: aboutPix.draw, scrollTrigger: { trigger: "#aboutPhoto", start: "top 80%" } });
        if (fine) {
          var ap = $("#aboutPhoto");
          ap.addEventListener("pointerenter", function () { gsap.to(aboutPix, { c: 16, duration: 0.45, ease: "power2.out", onUpdate: aboutPix.draw, overwrite: "auto" }); });
          ap.addEventListener("pointerleave", function () { gsap.to(aboutPix, { c: 1, duration: 0.8, ease: "power2.out", onUpdate: aboutPix.draw, overwrite: "auto" }); });
        }
      }
    }

    /* outlined ghost words drift behind sections */
    $$("[data-ghost]").forEach(function (g) {
      var dir = +g.getAttribute("data-ghost");
      gsap.fromTo(g, { xPercent: dir > 0 ? 5 : -45 }, { xPercent: dir > 0 ? -45 : 5, ease: "none", scrollTrigger: { trigger: g.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* research map: pinned, grows from a framed card to full screen */
    gsap.matchMedia().add("(min-width: 900px)", function () {
      gsap.timeline({ scrollTrigger: { trigger: "#fieldPin", start: "top top", end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1 } })
        .fromTo("#fieldFig", { clipPath: "inset(20% 24% 20% 24% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 })
        .fromTo("#field", { scale: 1.25 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo("#fieldOver", { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, ease: "power3.out", duration: 0.45 }, 0.6)
        .to({}, { duration: 0.25 });
    });

    /* toolkit rows slide in one after another */
    gsap.from(".kit-row", { x: -60, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.07, scrollTrigger: { trigger: ".kit", start: "top 85%" } });

    /* contact: coloured panel opens as a circle from the bottom */
    gsap.fromTo("#contactBg", { clipPath: "circle(0% at 50% 100%)" }, { clipPath: "circle(150% at 50% 100%)", ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 10%", scrub: true } });
    gsap.fromTo(".mail, .contact-links", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: ".mail", start: "top 90%" } });

    /* timeline spine draws with scroll */
    gsap.fromTo("#tlLine", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".tl-wrap", start: "top 70%", end: "bottom 70%", scrub: true } });

    /* projects: a deck. Cards stack (CSS sticky); the one underneath shrinks and dims as the next arrives */
    var wide = window.matchMedia("(min-width: 900px)");
    var pjs = $$(".pj");
    pjs.forEach(function (pj, i) {
      var inner = $(".pj-in", pj), shade = $(".pj-shade", pj), viz = $(".pj-viz", pj), svg = $(".pj-art", pj), next = pjs[i + 1];
      if (next) {
        var sc = gsap.matchMedia();
        sc.add("(min-width: 900px)", function () {
          var st = { trigger: next, start: "top 96%", end: "top 22%", scrub: true };
          gsap.to(inner, { scale: 0.92, ease: "none", scrollTrigger: st });
          gsap.to(shade, { opacity: 0.6, ease: "none", scrollTrigger: st });
        });
      }
      /* illustration drifts into place */
      gsap.fromTo(svg, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: pj, start: "top bottom", end: "top 30%", scrub: true } });
      /* line art draws itself */
      $$(".draw", pj).forEach(function (el) {
        var L = 0; try { L = el.getTotalLength(); } catch (e) {} if (!L) return;
        el.style.strokeDasharray = L;
        gsap.fromTo(el, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: pj, start: "top 75%" },
          onComplete: function () { el.style.strokeDasharray = "none"; } });
      });
      /* pointer: glow follows, illustration tilts */
      if (fine) {
        inner.addEventListener("pointermove", function (e) {
          var r = inner.getBoundingClientRect(); inner.style.setProperty("--mx", (e.clientX - r.left) + "px"); inner.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
        viz.addEventListener("pointermove", function (e) {
          if (!wide.matches) return;
          var r = viz.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(svg, { x: px * 20, y: py * 16, duration: 0.7, ease: "power3.out", overwrite: "auto" });
        });
        viz.addEventListener("pointerleave", function () { gsap.to(svg, { x: 0, y: 0, duration: 1, ease: "elastic.out(1,0.5)", overwrite: "auto" }); });
      }
    });

    /* toolkit marquee: two rows that speed up with scroll velocity */
    var rows = $$(".marq-row").map(function (r, i) {
      r.innerHTML += r.innerHTML;
      return i === 0 ? gsap.to(r, { xPercent: -50, duration: 38, ease: "none", repeat: -1 }) : gsap.fromTo(r, { xPercent: -50 }, { xPercent: 0, duration: 44, ease: "none", repeat: -1 });
    });
    var lastY = scrollY, vel = 0, sv = 0, skewEls = $$(".h2, .big, .marq, .ghost"), lastSk = 0;
    gsap.ticker.add(function () {
      var d = scrollY - lastY; lastY = scrollY; vel += (Math.abs(d) - vel) * 0.1; sv += (d - sv) * 0.12;
      rows.forEach(function (tw) { tw.timeScale(1 + Math.min(vel * 0.4, 8)); });
      var sk = Math.max(-5, Math.min(5, -sv * 0.12));
      if (Math.abs(sk - lastSk) > 0.02) { gsap.set(skewEls, { skewY: sk }); lastSk = sk; }
    });

    /* active nav link */
    ["about", "research", "projects", "toolkit", "contact"].forEach(function (id) {
      ScrollTrigger.create({ trigger: "#" + id, start: "top 55%", end: "bottom 55%",
        onToggle: function (s) { $$('.nav a[href="#' + id + '"]').forEach(function (a) { a.classList.toggle("active", s.isActive); }); } });
    });

    /* custom cursor + magnetic button */
    if (fine) {
      var cur = $(".cursor"), xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
      addEventListener("pointermove", function (e) { xTo(e.clientX); yTo(e.clientY); cur.classList.add("on"); }, { passive: true });
      document.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
      $$("a, button, canvas#field").forEach(function (el) {
        el.addEventListener("pointerenter", function () { cur.classList.add("big"); });
        el.addEventListener("pointerleave", function () { cur.classList.remove("big"); });
      });
      var fX = gsap.quickTo(".hero-fig-in", "x", { duration: 1.2, ease: "power3" }), nX = gsap.quickTo("#heroName", "x", { duration: 1.2, ease: "power3" });
      addEventListener("pointermove", function (e) { var k = e.clientX / innerWidth - 0.5; fX(-k * 26); nX(k * 16); }, { passive: true });
      var mag = $(".mag");
      mag.addEventListener("pointermove", function (e) { var r = mag.getBoundingClientRect(); gsap.to(copyBtn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3" }); });
      mag.addEventListener("pointerleave", function () { gsap.to(copyBtn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" }); });
    } else { var cc = $(".cursor"); if (cc) cc.remove(); }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  } catch (err) {
    if (window.console) console.error(err);
    skipAll(); root.style.overflow = ""; if (lenis) { try { lenis.start(); } catch (e) {} }
    $$(".w, .wi, .c").forEach(function (e) { e.style.transform = "none"; });
    $$("#heroRole, #heroCta, #hdr").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; });
    var hf = $("#heroFig"); if (hf) { hf.style.opacity = 0.28; hf.style.transform = "none"; }
    [heroPix, aboutPix].forEach(function (x) { if (x) { x.a = x.b = x.c = 1; x.last = -1; x.draw(); } });
  }
  setTimeout(function () { if (!started) { skipAll(); root.style.overflow = ""; } }, 6000);
})();
