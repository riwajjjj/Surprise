/* bouquet.js: the bouquet at the very end */

/* ---------- the bouquet ----------
   A wrapped bundle drops in, shakes ("wait for it…"), the paper fans open,
   eucalyptus bursts out, stems rise with buds, then the roses, lilies and
   tulips bloom one by one, a satin bow ties itself, and it POPS.
   The art lives in the bouquet/ folder (one image per layer);
   bouquet/manifest.js says where each one goes. Words: config.js → bouquet. */
(function bouquet() {
    const B = C.bouquet, M = window.BQ_MANIFEST;
    const btn = $("#bqBtn"), dlg = $("#bouquetBox"), stage = $("#bq");
    if (!B || !M || !btn || !dlg || !stage) return;
    const pct = (v, of) => (v / of * 100).toFixed(3) + "%";

    btn.hidden = false;
    btn.querySelector(".bq-btn-txt").textContent = B.button || "one more thing…";

    const STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z"/></svg>`;
    const sparks = [[6, 14], [92, 10], [2, 44], [96, 40], [20, 2], [78, 0], [50, -3], [10, 66], [90, 62]].map(([x, y], i) =>
        `<span class="bq-spark" style="left:${x}%;top:${y}%;--sd:${(i * .37 % 2).toFixed(2)}s;--ss:${10 + (i * 7) % 12}px">${STAR}</span>`).join("");
    // the flowers bloom in order of how far they are from the middle, so it opens outwards
    const order = M.layers.filter(l => l.role === "flower").map(l => [l.name, Math.hypot(l.x + l.w / 2 - M.W / 2, l.y + l.h / 2 - M.H * .42)]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    const rank = name => Math.max(0, order.indexOf(name));
    const layers = M.layers.map(l => {
        const k = l.role === "flower" ? rank(l.name) : l.role === "bud" ? rank(l.of || l.name) : (l.i || 0);
        return `<img class="ly r-${l.role}" alt="" draggable="false" decoding="async" data-src="${esc(l.src)}"
            style="left:${pct(l.x, M.W)};top:${pct(l.y, M.H)};width:${pct(l.w, M.W)};transform-origin:${l.ox}% ${l.oy}%;--k:${k}">`;
    }).join("");

    stage.innerHTML = `<p class="hand bq-line" aria-live="polite"></p>
      <div class="bq-art"><div class="bq-glow"></div><div class="bq-rain" aria-hidden="true"></div>
        <div class="bq-stage" style="aspect-ratio:${M.W}/${M.H}" role="img" aria-label="a bouquet of roses, lilies and tulips">${layers}</div>
        <div class="burst-box"></div>${sparks}</div>
      <div class="bq-tag"><span class="hole"></span><p class="hand">${esc(B.note || "")}</p><span class="sig">— ${esc(C.from || "")}</span></div>
      <div class="bq-actions"><button type="button" class="type" data-a="again">again ↺</button><button type="button" class="type" data-a="close">close ×</button></div>`;
    if (!B.note) stage.querySelector(".bq-tag").remove();

    const imgs = [...stage.querySelectorAll(".ly")], line = stage.querySelector(".bq-line"),
        burstBox = stage.querySelector(".burst-box"), rain = stage.querySelector(".bq-rain");

    /* load the pictures a little before she reaches the end, so it's instant when she taps */
    let loading = null;
    function load() {
        if (loading) return loading;
        loading = Promise.all(imgs.map(im => { im.src = im.dataset.src; return (im.decode ? im.decode() : Promise.resolve()).catch(() => {}); }));
        return loading;
    }
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: "900px 0px" });
        io.observe(btn);
    } else load();

    function pop() {
        if (reduceMotion) return;
        burstBox.innerHTML = "";
        popHearts(burstBox, 40, { x: 200, y: [30, 270], spin: 100, step: .015, size: [14, 30], petal: i => i % 3 !== 0,
            colors: ["#7a1f31", "#e8b3b3", "#f3d6d2", "#eea586", "#ffffff", "#ec90a8", "#c98a8f"] });
        const fh = rain.offsetHeight + 40, pc = [["#f3d6d2", "#c98a8f"], ["#fde9e4", "#e8b3b3"], ["#b8546a", "#7a1f31"], ["#fff3ec", "#eea586"], ["#ffffff", "#e6d6ba"]];
        rain.innerHTML = Array.from({ length: 14 }, (_, i) => { const [a, b] = pc[i % pc.length];
            return `<i style="--px:${(Math.random() * 100).toFixed(0)}%;--pw:${(8 + Math.random() * 7).toFixed(0)}px;--pc:${b};--pc2:${a};--sx:${(Math.random() * 60 - 30).toFixed(0)}px;--fh:${fh}px;--pd:${(6 + Math.random() * 5).toFixed(1)}s;--pdl:${(.3 + Math.random() * 5).toFixed(1)}s"></i>`; }).join("");
    }

    let T = [], run = 0;
    async function play() {
        T.forEach(clearTimeout); T = [];
        const me = ++run;                                                                  // a newer play (or close) cancels this one
        stage.className = "bq"; line.textContent = ""; burstBox.innerHTML = ""; rain.innerHTML = "";
        void stage.offsetWidth;
        const title = B.title || "for you ♡";
        if (reduceMotion) { await load(); stage.classList.add("b1", "b2", "b3", "b4", "b5", "b6", "b7"); line.textContent = title; return; }
        const t0 = performance.now(), ready = load();
        const at = (ms, fn) => T.push(setTimeout(fn, ms));
        at(60, () => stage.classList.add("b1"));                                         // the wrapped bundle drops in
        at(750, () => { stage.classList.add("b2"); line.textContent = "wait for it…"; });   // it shakes, harder and harder
        await ready;                                                                       // (pictures are almost always ready by now)
        const go = Math.max(0, 2150 - (performance.now() - t0));
        if (!dlg.open || me !== run) return;
        at(go, () => { stage.classList.add("b3"); line.textContent = ""; });              // the paper fans open
        at(go + 450, () => stage.classList.add("b4"));                                    // greenery bursts out, stems rise, buds appear
        at(go + 1700, () => stage.classList.add("b5"));                                   // the flowers bloom, from the middle outwards
        at(go + 3500, () => stage.classList.add("b6"));                                   // the ribbon wraps round and the bow ties
        at(go + 4100, () => { stage.classList.add("b7"); line.textContent = title; pop(); }); // POP
    }
    const close = () => { run++; T.forEach(clearTimeout); T = []; dlg.close(); };
    btn.addEventListener("click", () => { dlg.showModal(); play(); });
    stage.querySelector('[data-a="again"]').addEventListener("click", play);
    stage.querySelector('[data-a="close"]').addEventListener("click", close);
    dlg.addEventListener("click", e => { if (e.target === dlg) close(); });
    dlg.addEventListener("close", () => { if (dlg.open) return; run++; T.forEach(clearTimeout); T = []; rain.innerHTML = ""; });   // (this event arrives a moment late: ignore it if she already reopened)
    })();
