/* hero.js: the first screen: cut-out title, ticket, live day counter, photo booth strip, cover polaroid, cassettes */

(() => {
    /* ---------- hero ---------- */
    const fonts = ["'Abril Fatface',serif", "'Archivo Black',sans-serif", "'Special Elite',monospace", "'DM Serif Display',serif", "'Instrument Serif',serif", "'Courier Prime',monospace"]; // single quotes: these go inside a style="..." attribute
    const swatches = [["#fbf8f2", "#2b221e"], ["#8a1c2e", "#fbe9ea"], ["#2b221e", "#f3ece1"], ["#ebc3cb", "#7e0f1f"], ["#f6e7a8", "#2b221e"], ["#2f6f55", "#f3efe6"], ["#c9d8e4", "#2b221e"]];
    let ci2 = 0;
    $("#ransom").innerHTML = C.title.split(" ").map(word => `<span class="word">${[...word].map(ch => { const i = ci2++;
        const [bg, fg] = swatches[(i * 3 + 1) % swatches.length];
        const f = fonts[(i * 5 + 2) % fonts.length];
        const italic = i % 4 === 1 ? "font-style:italic;" : "";
        return `<span class="ch" aria-hidden="true" style="background:${bg};color:${fg};font-family:${f};${italic}--r:${tilt(7).toFixed(1)}deg;--y:${tilt(6).toFixed(0)}px">${esc(ch)}</span>`;
    }).join("")}</span>`).join(`<span class="sp"></span>`);
    $("#byline").innerHTML = `for ${esc(C.to)}, from ${esc(C.from)}<svg class="doodle d-tulip" viewBox="0 0 40 50" aria-hidden="true"><path d="M20 47V27"/><path d="M20 27c-7 0-10-6-10-15l5 4 5-7 5 7 5-4c0 9-3 15-10 15z"/><path d="M20 41c-4-1-7-4-8-9 4 0 7 3 8 9z"/></svg>`;
    const sinceN = C.since.replace(/\D/g, "");
    $("#ticket").innerHTML = `<div class="main"><span>admit two · <span class="nw">friends since ${esc(C.friendsSince || "")}</span></span><b>US, OFFICIALLY</b><span>since ${esc(C.since)}</span></div>
  <div class="stub"><span>no.</span><b>${esc(sinceN.slice(0, 6))}</b><span>row ♡</span></div>`;
    /* ---------- live "together for" counter ---------- */
    (function counter() {
        const el = $("#counter");
        const m = String(C.since || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        if (C.counter === false || !m) { el.hidden = true; return; }
        const [hh, mm] = String(C.sinceTime || "").split(":").map(Number);
        const S = { y: +m[3], mo: +m[2] - 1, d: +m[1], h: hh || 0, mi: mm || 0 };
        const start = instantOf(S.y, S.mo, S.d, S.h, S.mi);
        const at = n => instantOf(S.y, S.mo, S.d + n, S.h, S.mi);          // the moment of day-anniversary n
        const startDay = dayNum(S.y, S.mo, S.d);
        const monthDay = n => {                                             // calendar date of month-anniversary n
            const f = new Date(Date.UTC(S.y, S.mo + n, 1)), y = f.getUTCFullYear(), mo = f.getUTCMonth();
            return dayNum(y, mo, Math.min(S.d, new Date(Date.UTC(y, mo + 1, 0)).getUTCDate()));
        };
        const DAY_MARKS = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000];
        const monthName = n => n % 12 === 0 ? (n === 12 ? "1 year" : `${n / 12} years`) : n === 6 ? "half a year" : n === 1 ? "1 month" : `${n} months`;
        function milestone(now) {
            const w = wallOf(now), t = dayNum(w.y, w.mo, w.d), c = [];
            let n = 1; while (monthDay(n) < t) n++;
            c.push([monthDay(n), `${monthName(n)} of us`, true]);
            const dm = DAY_MARKS.find(k => startDay + k >= t);
            if (dm) c.push([startDay + dm, `${dm} days of us`, true]);
            (C.specialDays || []).forEach(s => {                         // your own yearly days (config.js → specialDays)
                const m = String(s && s.date || "").match(/(\d{1,2})\D+(\d{1,2})/); if (!m || !s.label) return;
                let d = dayNum(w.y, +m[2] - 1, +m[1]); if (d < t) d = dayNum(w.y + 1, +m[2] - 1, +m[1]);
                c.push([d, s.label, false]);
            });
            c.sort((a, b) => a[0] - b[0]);
            return { label: c[0][1], inDays: c[0][0] - t, ours: c[0][2] };
        }

        el.innerHTML = `<div class="odo"><svg class="doodle spark sp1" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 6 3 8 10 10-7 2-9 4-10 10-1-6-3-8-10-10 7-2 9-4 10-10z"/></svg><svg class="doodle spark sp2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 6 3 8 10 10-7 2-9 4-10 10-1-6-3-8-10-10 7-2 9-4 10-10z"/></svg><span class="odo-lbl">together for</span><span class="odo-digits" aria-hidden="true"></span><span class="odo-unit hand">days</span><span class="odo-time" aria-hidden="true"></span></div><p class="hand odo-next"></p>`;
        const digitsEl = el.querySelector(".odo-digits"), timeEl = el.querySelector(".odo-time"), nextEl = el.querySelector(".odo-next");
        let wheels = [], rolled = false, shownDays = -1, shownDate = "", special = false;
        const odoEl = el.querySelector(".odo");
        odoEl.title = "tap me ♡";
        const hearts = n => popHearts(odoEl, n);   // little hearts that float up out of the counter
        odoEl.addEventListener("click", () => hearts(10));
        const digits = n => String(n).padStart(3, "0");
        function build(len) {
            digitsEl.innerHTML = Array.from({ length: len }, (_, i) =>
                `<span class="wheel"><span class="strip" style="--dl:${(i * .18).toFixed(2)}s">${[...Array(10).keys()].map(k => `<span>${k}</span>`).join("")}</span></span>`).join("");
            wheels = [...digitsEl.querySelectorAll(".strip")];
            void digitsEl.offsetWidth;
        }
        function show(days) {
            const s = digits(days);
            if (wheels.length !== s.length) build(s.length);
            wheels.forEach((w, i) => w.style.setProperty("--d", s[i]));
        }
        let onScreen = true;
        if ("IntersectionObserver" in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) tick(); }).observe(el.parentElement);
        function tick() {
            if (document.hidden || !onScreen) return;
            const now = Date.now();
            if (now < start) { el.hidden = true; return; }
            el.hidden = false;
            let days = Math.floor((now - start) / 864e5);           // first guess, then fix for clock changes
            while (days > 0 && at(days) > now) days--;
            while (at(days + 1) <= now) days++;
            const r = Math.floor((now - at(days)) / 1000);
            timeEl.textContent = `+ ${pad(Math.floor(r / 3600))}h ${pad(Math.floor(r % 3600 / 60))}m ${pad(r % 60)}s`;
            if (days !== shownDays) {
                if (!wheels.length) build(digits(days).length);
                shownDays = days;
                el.setAttribute("aria-label", `together for ${days} days`);
                if (rolled) show(days);
            }
            const w = wallOf(now), today = `${w.y}-${w.mo}-${w.d}`;
            if (today !== shownDate) {
                shownDate = today;
                const ms = milestone(now);
                special = ms.inDays === 0;
                nextEl.classList.toggle("today", special);
                odoEl.classList.toggle("special", special);
                nextEl.textContent = special ? (ms.ours ? `happy ${ms.label} ♡` : `today: ${ms.label} ♡`)
                    : ms.inDays === 1 ? `${ms.label} is tomorrow ♡`
                        : `next: ${ms.label} ♡ (${ms.inDays} sleeps)`;
            }
        }
        tick();
        setInterval(tick, 1000);
        document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
        rollCounter = () => {
            if (rolled) return; rolled = true; if (shownDays >= 0) show(shownDays);
            if (special) { setTimeout(() => hearts(24), 1700); setTimeout(() => hearts(16), 3200); }   // a milestone today: celebrate
        };
    })();

    $("#booth").innerHTML = (C.booth || []).map((s, i) => `<span class="ph"><img alt="photo booth" decoding="async" src="${src(s, "4/3.3", true, `booth ${i + 1}`)}"></span>`).join("");
    if (C.cover) $("#heroPol").innerHTML = `<button class="polaroid" style="--r:6deg;--ar:4/5">${washi()}${photo(C.cover.src, "4/5", C.cover.stamp, C.cover.caption, "cover")}<span class="cap">${esc(C.cover.caption)}</span></button>`;

    /* ---------- cassettes ---------- */
    function cassette(btn, file) {
        if (!file) { btn.title = "add an audio file in config.js"; return null; }
        const a = new Audio(); a.preload = "metadata"; a.src = file; a.loop = btn.id === "songTape";
        btn.addEventListener("click", () => a.paused ? a.play().catch(() => {}) : a.pause());
        a.addEventListener("play", () => { btn.classList.add("playing"); bg.hold(a, true); if (mix) mix.duck(true, a); });
        a.addEventListener("pause", () => { btn.classList.remove("playing"); bg.hold(a, false); if (mix) mix.duck(false, a); });
        a.addEventListener("ended", () => { btn.classList.remove("playing"); bg.hold(a, false); if (mix) mix.duck(false, a); });
        return a;
    }
    if (!mix) {   // no songs added yet: the cassette just spins for fun
        $("#songTitle").textContent = C.mixtapeTitle || "our song";
        $("#songTape").addEventListener("click", e => e.currentTarget.classList.toggle("playing"));
    }
    if (C.finalLetter.voice) { $("#voiceTape").hidden = false; cassette($("#voiceTape"), C.finalLetter.voice); }

    // hide what has no photos
    if ((C.booth || []).length === 0) $("#booth").hidden = true;
    if (!C.cover) $("#heroPol").hidden = true;
})();
