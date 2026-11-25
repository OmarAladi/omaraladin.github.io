/* Omar Alaa — portfolio interactions. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var AR = root.lang === "ar";
  var RTL = root.dir === "rtl";

  var T = AR ? {
    toLight: "التبديل إلى الوضع الفاتح", toDark: "التبديل إلى الوضع الداكن",
    missing: "أضف اسمك وبريدك وفكرتك، ثم أرسل.",
    badEmail: "راجع البريد الإلكتروني: يجب أن يكون بصيغة name@company.com.",
    mailOpened: "سيفتح تطبيق البريد لديك والرسالة جاهزة للإرسال.",
    mailSubject: "فكرة مشروع من ", sending: "جارٍ الإرسال…",
    sent: "تم الإرسال. سأعود إليك بالخيارات.",
    failed: "لم تُرسل الرسالة. راسلني مباشرة على "
  } : {
    toLight: "Switch to light theme", toDark: "Switch to dark theme",
    missing: "Add your name, email and idea, then send.",
    badEmail: "Check the email address: it should look like name@company.com.",
    mailOpened: "Your email app should open with the message ready to send.",
    mailSubject: "Project idea from ", sending: "Sending…",
    sent: "Sent. I'll get back to you with options.",
    failed: "The message didn't go through. Email me at "
  };

  /* ---------------------------------------------------------------- Language choice */
  // The head script sends returning visitors to the language they picked last time.
  document.querySelectorAll(".lang-link").forEach(function (a) {
    a.addEventListener("click", function () { try { localStorage.setItem("lang", a.getAttribute("hreflang")); } catch (e) {} });
  });

  /* ---------------------------------------------------------------- Theme */
  var themeBtn = document.getElementById("theme-toggle");
  function syncThemeButton() {
    var isLight = root.getAttribute("data-theme") === "light";
    themeBtn.setAttribute("aria-label", isLight ? T.toDark : T.toLight);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#F5F3EF" : "#13110E");
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeButton();
    });
  }

  /* ---------------------------------------------------------------- Nav border on scroll */
  var nav = document.getElementById("nav");
  function onScrollNav() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------------------------------------------------------- Headline line reveal */
  // Wraps each rendered line of [data-reveal] in a mask so it can rise into place.
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  revealEls.forEach(function (el) { el.setAttribute("data-text", el.textContent.trim()); });

  function splitLines(el) {
    var text = el.getAttribute("data-text");
    el.textContent = "";
    var words = text.split(/\s+/);
    var spans = words.map(function (w, i) {
      var s = document.createElement("span");
      s.textContent = w + (i < words.length - 1 ? " " : "");
      el.appendChild(s);
      return s;
    });
    var lines = [], top = null;
    spans.forEach(function (s) {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    el.textContent = "";
    lines.forEach(function (words, i) {
      var outer = document.createElement("span");
      outer.className = "reveal-line";
      var inner = document.createElement("span");
      inner.textContent = words.join("");
      inner.style.transitionDelay = (i * 90) + "ms";
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.setAttribute("aria-label", text);
  }

  function setupReveal() {
    if (reduceMotion) return;
    revealEls.forEach(splitLines);
  }

  var revealIO = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px" }) : null;

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    setupReveal();
    revealEls.forEach(function (el) { revealIO ? revealIO.observe(el) : el.classList.add("is-in"); });
  });

  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (reduceMotion || Math.abs(window.innerWidth - lastWidth) < 40) return;
    lastWidth = window.innerWidth;
    revealEls.forEach(function (el) { var wasIn = el.classList.contains("is-in"); splitLines(el); if (wasIn) el.classList.add("is-in"); });
  });

  /* ---------------------------------------------------------------- Stat count-up */
  var counters = document.querySelectorAll("[data-count]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        var el = e.target, end = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "";
        var t0 = performance.now(), dur = 1100;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = "0" + (c.getAttribute("data-suffix") || ""); countIO.observe(c); });
  }

  /* ---------------------------------------------------------------- Scroll stories */
  document.querySelectorAll("[data-story]").forEach(function (story) {
    var stage = story.querySelector("[data-stage]");
    var steps = story.querySelectorAll(".step");
    function activate(step) {
      steps.forEach(function (s) { s.classList.toggle("is-active", s === step); });
      stage.setAttribute("data-step", step.getAttribute("data-step"));
    }
    activate(steps[0]);
    if (!("IntersectionObserver" in window)) { activate(steps[steps.length - 1]); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  });

  /* ---------------------------------------------------------------- Case study stage switcher */
  document.querySelectorAll("[data-switch]").forEach(function (box) {
    var stage = box.querySelector("[data-stage]");
    var buttons = box.querySelectorAll("button[data-to]");
    function show(step) {
      stage.setAttribute("data-step", step);
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-to") === step ? "true" : "false"); });
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-to")); }); });
    show("1");
  });

  /* ---------------------------------------------------------------- Process rail */
  var processEl = document.querySelector(".process");
  if (processEl) {
    var rail = processEl.querySelector(".process-rail i");
    var items = processEl.querySelectorAll("li");
    var ticking = false;
    function updateProcess() {
      ticking = false;
      var r = processEl.getBoundingClientRect(), mid = window.innerHeight * 0.55;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      rail.style.setProperty("--p", p.toFixed(3));
      items.forEach(function (li) { li.classList.toggle("is-on", li.getBoundingClientRect().top < mid); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(updateProcess); } }, { passive: true });
    window.addEventListener("resize", updateProcess);
    updateProcess();
  }

  /* ---------------------------------------------------------------- Hero system diagram */
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("system-svg");
  var DATA = AR ? {
    inputs: ["ميزانية إعلانات على حملات ضعيفة", "1500 فاتورة تُكتب يدويًا", "عيوب تُكتشف متأخرة", "تقييمات بلا رد"],
    outputs: ["توفير أكثر من 25% من الإعلانات", "1500 فاتورة في دقائق", "عيوب تُكتشف على الخط", "رد على كل تقييم"],
    stages: ["فهم المُدخل", "استرجاع السياق", "القرار والصياغة", "موافقة إنسان"],
    before: "قبل", after: "بعد", core: "وكلاء أذكياء"
  } : {
    inputs: ["Ad budget on weak campaigns", "1,500 invoices typed by hand", "Defects found too late", "Reviews left unanswered"],
    outputs: ["25%+ of ad spend saved", "1,500 invoices in minutes", "Defects caught on the line", "Every review answered"],
    stages: ["Understand the input", "Retrieve the context", "Decide and draft", "Human approves"],
    before: "Before", after: "After", core: "AI agents"
  };

  // In Arabic the diagram reads right to left: mirror every x and flip text anchors.
  function mirrorLayout(L) {
    var W = L.w;
    function mx(x) { return W - x; }
    function flipAnchor(a) { return a === "start" ? "end" : a === "end" ? "start" : a; }
    function mirrorPath(d) {
      var i = 0;
      return d.replace(/-?\d+(\.\d+)?/g, function (n) { return (i++ % 2 === 0) ? String(W - parseFloat(n)) : n; });
    }
    var route = L.route;
    return {
      w: L.w, h: L.h, font: L.font, stageFont: L.stageFont, anchor: "end",
      titles: L.titles.map(function (t) { return { x: mx(t.x), y: t.y, t: t.t }; }),
      ins: L.ins.map(function (p) { return { lx: mx(p.lx), ly: p.ly, dx: mx(p.dx), dy: p.dy, anchor: flipAnchor(p.anchor) }; }),
      outs: L.outs.map(function (p) { return { lx: mx(p.lx), ly: p.ly, dx: mx(p.dx), dy: p.dy, anchor: flipAnchor(p.anchor) }; }),
      core: { x: W - L.core.x - L.core.w, y: L.core.y, w: L.core.w, h: L.core.h, tx: mx(L.core.tx), ty: L.core.ty },
      stages: L.stages.map(function (s) { return { dx: mx(s.dx), tx: mx(s.tx), y: s.y }; }),
      route: function (i) { var r = route(i); return { a: mirrorPath(r.a), core: mirrorPath(r.core), b: mirrorPath(r.b) }; }
    };
  }

  function el(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  function layout(wide) {
    if (wide) {
      var ys = [110, 190, 270, 350];
      return {
        w: 1200, h: 430, font: 17, stageFont: 16,
        titles: [{ x: 0, y: 52, t: "Before" }, { x: 930, y: 52, t: "After" }],
        ins: ys.map(function (y) { return { lx: 0, ly: y + 6, dx: 290, dy: y, anchor: "start" }; }),
        outs: ys.map(function (y) { return { lx: 930, ly: y + 6, dx: 910, dy: y, anchor: "start" }; }),
        core: { x: 470, y: 84, w: 260, h: 300, tx: 494, ty: 124 },
        stages: [0, 1, 2, 3].map(function (i) { return { dx: 500, tx: 518, y: 176 + i * 54 }; }),
        route: function (i) {
          var yi = ys[i];
          return {
            a: "M290 " + yi + " C380 " + yi + " 380 230 470 230",
            core: "M470 230 L730 230",
            b: "M730 230 C820 230 820 " + yi + " 910 " + yi
          };
        }
      };
    }
    var iy = [52, 84, 116, 148], oy = [590, 622, 654, 686];
    return {
      w: 360, h: 710, font: 15, stageFont: 14,
      titles: [{ x: 0, y: 18, t: "Before" }, { x: 0, y: 556, t: "After" }],
      ins: iy.map(function (y) { return { lx: 0, ly: y + 5, dx: 344, dy: y, anchor: "start" }; }),
      outs: oy.map(function (y) { return { lx: 0, ly: y + 5, dx: 344, dy: y, anchor: "start" }; }),
      core: { x: 30, y: 210, w: 300, h: 260, tx: 54, ty: 246 },
      stages: [0, 1, 2, 3].map(function (i) { return { dx: 60, tx: 76, y: 290 + i * 46 }; }),
      route: function (i) {
        var yi = iy[i], yo = oy[i];
        // Inputs and outputs share a bus on the right edge, so no wire crosses a label.
        return {
          a: "M344 " + yi + " L344 172 C344 196 180 184 180 210",
          core: "M180 210 L180 470",
          b: "M180 470 C180 500 344 488 344 520 L344 " + yo
        };
      }
    };
  }

  var sys = null;
  function drawSystem() {
    if (!svg) return;
    var wide = svg.parentNode.clientWidth >= 720;
    if (sys && sys.wide === wide) return;
    var L = layout(wide);
    if (RTL) L = mirrorLayout(L);
    var textAnchor = L.anchor || "start";
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);

    var sideTitles = [DATA.before, DATA.after];
    L.titles.forEach(function (t, i) { el("text", { x: t.x, y: t.y, "class": "sys-side-title", "font-size": 14, "text-anchor": textAnchor }, svg, sideTitles[i]); });

    var wires = el("g", {}, svg);
    var routes = DATA.inputs.map(function (_, i) {
      var r = L.route(i);
      el("path", { d: r.a, "class": "sys-wire" }, wires);
      el("path", { d: r.b, "class": "sys-wire" }, wires);
      var full = el("path", { d: r.a + " " + r.core.replace(/^M[\d. ]+/, "") + " " + r.b.replace(/^M[\d. ]+/, ""), fill: "none", stroke: "none" }, svg);
      var la = el("path", { d: r.a }, null), lc = el("path", { d: r.core }, null);
      svg.appendChild(la); svg.appendChild(lc);
      var lenA = la.getTotalLength(), lenC = lc.getTotalLength();
      svg.removeChild(la); svg.removeChild(lc);
      return { path: full, total: full.getTotalLength(), lenA: lenA, lenC: lenC };
    });

    var C = L.core;
    el("rect", { x: C.x, y: C.y, width: C.w, height: C.h, rx: 14, "class": "sys-core" }, svg);
    el("text", { x: C.tx, y: C.ty, "class": "sys-core-title", "font-size": L.font, "text-anchor": textAnchor }, svg, DATA.core);
    var stageEls = DATA.stages.map(function (t, i) {
      var s = L.stages[i], g = el("g", { "class": "sys-stage" }, svg);
      el("circle", { cx: s.dx, cy: s.y - 5, r: 5, "class": "sys-stage-dot" }, g);
      el("text", { x: s.tx, y: s.y, "class": "sys-stage-text", "font-size": L.stageFont, "text-anchor": textAnchor }, g, t);
      return g;
    });

    var inEls = DATA.inputs.map(function (t, i) {
      var p = L.ins[i], g = el("g", { "class": "sys-in" }, svg);
      el("text", { x: p.lx, y: p.ly, "class": "sys-label", "font-size": L.font, "text-anchor": p.anchor }, g, t);
      el("circle", { cx: p.dx, cy: p.dy, r: 6, "class": "sys-in-dot" }, g);
      return g;
    });
    var outEls = DATA.outputs.map(function (t, i) {
      var p = L.outs[i], g = el("g", { "class": "sys-out" }, svg);
      el("circle", { cx: p.dx, cy: p.dy, r: 6, "class": "sys-out-dot" }, g);
      el("text", { x: p.lx, y: p.ly, "class": "sys-label is-out", "font-size": L.font, "text-anchor": p.anchor }, g, t);
      return g;
    });

    var pulses = routes.map(function () { return el("circle", { r: wide ? 5 : 4, "class": "sys-pulse", opacity: 0 }, svg); });

    sys = { wide: wide, routes: routes, stageEls: stageEls, inEls: inEls, outEls: outEls, pulses: pulses, hitUntil: [0, 0, 0, 0] };

    if (reduceMotion) {
      outEls.forEach(function (g) { g.classList.add("is-hit"); });
      stageEls.forEach(function (g) { g.classList.add("is-on"); });
    }
  }

  var running = false, t0 = 0, CYCLE = 4400, GAP = 1100;
  function frame(now) {
    if (!running || !sys) return;
    var stageOn = [false, false, false, false];
    sys.routes.forEach(function (r, i) {
      var p = ((now - t0 - i * GAP) % CYCLE) / CYCLE;
      var dot = sys.pulses[i];
      if (now - t0 < i * GAP) { dot.setAttribute("opacity", 0); return; }
      var d = p * r.total;
      var inCore = d > r.lenA && d < r.lenA + r.lenC;
      var pt = r.path.getPointAtLength(d);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      dot.setAttribute("opacity", inCore ? 0 : (p > 0.97 ? 0 : 1));
      sys.inEls[i].classList.toggle("is-hot", d < r.lenA);
      if (inCore) stageOn[Math.min(3, Math.floor(((d - r.lenA) / r.lenC) * 4))] = true;
      if (p > 0.96) sys.hitUntil[i] = now + 1800;
      sys.outEls[i].classList.toggle("is-hit", now < sys.hitUntil[i]);
    });
    sys.stageEls.forEach(function (g, i) { g.classList.toggle("is-on", stageOn[i]); });
    requestAnimationFrame(frame);
  }

  if (svg) {
    drawSystem();
    window.addEventListener("resize", drawSystem);
    if (!reduceMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; t0 = t0 || performance.now(); requestAnimationFrame(frame); }
          else if (!e.isIntersecting) { running = false; }
        });
      }).observe(svg);
    }
  }

  /* ---------------------------------------------------------------- Contact form */
  // To receive messages directly in your inbox, create a free form on formspree.io
  // (or web3forms.com) and paste its endpoint here. Until then, Send opens the
  // visitor's email app with the message filled in.
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "omaraladin20@gmail.com";

  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = form.elements, name = f["name"].value.trim(), email = f["email"].value.trim(), msg = f["message"].value.trim();
      if (!name || !email || !msg) { status.textContent = T.missing; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = T.badEmail; return; }

      if (!FORM_ENDPOINT) {
        var body = msg + "\n\n— " + name + " (" + email + ")";
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(T.mailSubject + name) + "&body=" + encodeURIComponent(body);
        status.textContent = T.mailOpened;
        return;
      }
      status.textContent = T.sending;
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.textContent = T.sent;
        })
        .catch(function () {
          status.textContent = T.failed + CONTACT_EMAIL;
        });
    });
  }
})();
