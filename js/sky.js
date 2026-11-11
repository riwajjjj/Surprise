/* sky.js: "that night": the real sky over Kathmandu the moment she said yes, as a star chart
   with handwritten notes beside it. Shooting stars streak out of the two meteor showers that
   were really going on that night, and she can tap the sky to make one herself.
   The positions come from js/sky-data.js; this file only draws them. The notes are in config.js → skyNotes. */

(() => {
    const S = window.SKY, sec = $("#sky"), svg = $("#skyChart"), card = $("#skyCard");
    if (!sec) return;
    if (!S || C.sky === false) { sec.hidden = true; return; }

    // looking straight up: north at the top, east on the LEFT (like a real star map held over your head)
    const CX = 210, CY = 210, R = 180, rad = Math.PI / 180, f = n => n.toFixed(1);
    const xy = ([az, alt]) => { const r = R * Math.tan((90 - alt) / 2 * rad); return [CX - r * Math.sin(az * rad), CY - r * Math.cos(az * rad)]; };
    const pts = l => l.map(p => xy(p).map(f).join(",")).join(" ");
    const ring = l => "M" + l.map(p => xy(p).map(f).join(" ")).join("L") + "Z";

    /* ---------- the chart ---------- */
    const milkyWay = ["outer", "inner"].map(k => `<path class="mw mw-${k}" d="${(S.mw[k] || []).map(ring).join("")}"/>`).join("");
    const rings = [30, 60].map(alt => `<circle cx="${CX}" cy="${CY}" r="${f(R * Math.tan((90 - alt) / 2 * rad))}" class="sky-grid"/>`).join("");
    const ticks = Array.from({ length: 24 }, (_, i) => {
        const a = i * 15 * rad, k = i % 6 ? 5 : 9, s = Math.sin(a), c = Math.cos(a);
        return `<line x1="${f(CX - R * s)}" y1="${f(CY - R * c)}" x2="${f(CX - (R + k) * s)}" y2="${f(CY - (R + k) * c)}"/>`;
    }).join("");
    const compass = [["N", 0], ["E", 90], ["S", 180], ["W", 270]].map(([t, az]) =>
        `<text x="${f(CX - (R + 21) * Math.sin(az * rad))}" y="${f(CY - (R + 21) * Math.cos(az * rad) + 4)}" class="sky-dir">${t}</text>`).join("");
    const lines = S.lines.map(l => `<polyline points="${pts(l)}"/>`).join("");
    const gold = (S.gold || []).map(l => `<polyline points="${pts(l)}"/>`).join("");
    const stars = S.stars.map(([az, alt, mag], i) => {
        const [x, y] = xy([az, alt]), r = Math.max(.45, 2.5 - .42 * mag), o = Math.min(1, .45 + (5 - mag) * .14);
        const tw = mag < 1.6 ? ` class="tw" style="--td:${(-(i % 7) * .6).toFixed(1)}s"` : "";
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${r.toFixed(2)}" opacity="${o.toFixed(2)}"${tw}/>`;
    }).join("");
    const labels = S.labels.map(l => {
        const [x, y] = xy(l.at);
        const left = x > CX + 60 || (Math.abs(x - CX) < 70 && Math.abs(y - CY) < 40);   // near the right edge, or about to run into the heart in the middle: write it to the left
        const dot = l.planet === "saturn"
            ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="5.4" ry="1.7" transform="rotate(-18 ${f(x)} ${f(y)})" class="ring"/><circle cx="${f(x)}" cy="${f(y)}" r="2.8" class="planet saturn"/>`
            : l.planet ? `<circle cx="${f(x)}" cy="${f(y)}" r="2.3" class="planet ${l.planet}"/>` : "";
        return `${dot}<text x="${f(x + (left ? -8 : 8))}" y="${f(y - 6)}" text-anchor="${left ? "end" : "start"}" class="sky-label">${esc(l.text)}</text>`;
    }).join("");
    // a little heart at the point straight above you
    const us = `<g class="sky-us" transform="translate(${CX} ${CY})"><path d="M0 5C-3.2 2.6-5.6.6-5.6-1.9-5.6-3.6-4.3-4.8-2.8-4.8-1.6-4.8-.6-4.1 0-3.1.6-4.1 1.6-4.8 2.8-4.8 4.3-4.8 5.6-3.6 5.6-1.9 5.6.6 3.2 2.6 0 5Z"/>
        <text x="0" y="19" class="sky-label us">right above us</text></g>`;

    svg.innerHTML = `<defs>
        <radialGradient id="skyBg" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#26306a"/><stop offset=".7" stop-color="#151b44"/><stop offset="1" stop-color="#0c1030"/></radialGradient>
        <clipPath id="skyClip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>
      <circle cx="${CX}" cy="${CY}" r="${R + 14}" class="sky-rim"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#skyBg)"/>
      <g clip-path="url(#skyClip)">
        <g class="sky-mw">${milkyWay}</g>${rings}
        <g class="sky-lines">${lines}</g><g class="sky-lines gold">${gold}</g>
        <g class="sky-stars">${stars}</g><g class="sky-meteors"></g>
        <g class="sky-labels">${labels}${us}</g>
      </g>
      <circle cx="${CX}" cy="${CY}" r="${R}" class="sky-horizon"/>
      <g class="sky-ticks">${ticks}</g>${compass}`;
    svg.setAttribute("aria-label", `a star chart: the sky over ${S.place} at ${S.when}, with ${S.labels.map(l => l.text.split(",")[0]).join(", ")}`);
    $("#skyWhen").innerHTML = `<span class="nw">${esc(S.place)} · ${S.lat}° N, ${S.lon}° E</span> · <span class="nw">${esc(S.when)}</span>`;

    /* ---------- the handwritten notes beside it (config.js → skyNotes) + the moon ---------- */
    const M = S.moon, k = M.lit / 100, r = 15, rx = f(r * Math.abs(1 - 2 * k)), side = M.waning ? 0 : 1;   // a waning moon is lit on the left
    const moonSvg = `<svg class="sky-moon-img" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" class="moon-dark"/>
        <path d="M20 ${20 - r}A${r} ${r} 0 0 ${side} 20 ${20 + r}A${rx} ${r} 0 0 ${k < .5 ? 1 - side : side} 20 ${20 - r}Z" class="moon-lit"/></svg>`;
    const moonText = M.up ? `the moon was out: ${M.waning ? "waning" : "waxing"}, ${M.lit}% lit`
        : `the moon was still asleep. it rose at ${esc(M.rise)}, a thin crescent, ${M.lit}% lit`;
    const ARROW = `<svg class="doodle sky-arrow" viewBox="0 0 70 40" aria-hidden="true"><path d="M66 10C46 4 24 10 8 28"/><path d="M8 28l3-12M8 28l12-2"/></svg>`;
    const notes = (Array.isArray(C.skyNotes) ? C.skyNotes : []).filter(Boolean).map(t => `<div class="sky-note"><div class="m m-note torn">${esc(t)}</div>${ARROW}</div>`);
    notes.push(`<div class="sky-note"><div class="m m-note torn moon-note">${moonSvg}<span>${moonText}</span></div>${ARROW}</div>`);
    $("#skyNotes").innerHTML = notes.join("");

    /* ---------- shooting stars: from the Orionids and Draconids, or wherever she taps ---------- */
    const meteorLayer = svg.querySelector(".sky-meteors"), showers = S.meteors || [];
    let meteorId = 0;
    function meteor(from) {                                     // from = [x, y] on the chart, or a shower's radiant
        if (meteorLayer.childElementCount > 3) return true;
        let x0, y0, ang;
        if (from) { [x0, y0] = from; ang = between(0, 360) * rad; }
        else {
            const total = showers.reduce((n, s) => n + s.weight, 0); let pick = between(0, total), sh = showers[0];
            for (const s of showers) { if ((pick -= s.weight) <= 0) { sh = s; break; } }
            const [rx0, ry0] = xy(sh.at); ang = between(0, 360) * rad;
            const d = between(25, 110); x0 = rx0 + Math.cos(ang) * d; y0 = ry0 + Math.sin(ang) * d;   // they streak away from the radiant
        }
        const len = between(45, 85), x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
        if (Math.hypot(x0 - CX, y0 - CY) > R - 8 || Math.hypot(x1 - CX, y1 - CY) > R) return false;   // it would leave the sky: not this one
        const id = "met" + meteorId++;
        meteorLayer.insertAdjacentHTML("beforeend", `<g class="meteor">
            <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}"><stop offset="0" stop-color="#fff8e6" stop-opacity="0"/><stop offset="1" stop-color="#fff8e6"/></linearGradient>
            <line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke="url(#${id})"/></g>`);
        const g = meteorLayer.lastElementChild, line = g.querySelector("line");
        line.style.strokeDasharray = `${f(len)} ${f(len * 2)}`;
        const run = line.animate ? line.animate([{ strokeDashoffset: len, opacity: 1 }, { strokeDashoffset: len * .1, opacity: 1, offset: .55 }, { strokeDashoffset: -len, opacity: 0 }],
            { duration: between(750, 1100), easing: "ease-out", fill: "forwards" }) : null;
        if (run) run.onfinish = () => g.remove(); else setTimeout(() => g.remove(), 900);
        return true;
    }
    const shoot = from => { for (let tries = 0; tries < 12 && !meteor(from); tries++); };   // roll again until one fits
    let live = false, inView = false, timer = 0;
    const schedule = () => { clearTimeout(timer); if (!live) return; timer = setTimeout(() => { shoot(); schedule(); }, between(2600, 6500)); };
    // tap the sky to make a wish: a shooting star from wherever she taps
    svg.addEventListener("click", e => {
        if (reduceMotion) return;
        const box = svg.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * 420, y = (e.clientY - box.top) / box.height * 420;
        if (Math.hypot(x - CX, y - CY) < R) { shoot([x, y]); shoot([x, y]); }
    });

    // it fades in when she scrolls to it; twinkling and shooting stars only while it's on screen
    if (reduceMotion || !("IntersectionObserver" in window)) { card.classList.add("shown", "live"); sec.classList.add("shown"); return; }
    new IntersectionObserver(es => {
        inView = es[0].isIntersecting; live = inView && !document.hidden;
        card.classList.toggle("live", live);
        if (live) { card.classList.add("shown"); sec.classList.add("shown"); setTimeout(shoot, 3200); }
        schedule();
    }, { threshold: .3 }).observe(card);
    document.addEventListener("visibilitychange", () => { live = inView && !document.hidden; card.classList.toggle("live", live); schedule(); });
})();