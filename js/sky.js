/* sky.js: "that night": the real sky over Kathmandu the moment she said yes, drawn as a star chart.
   The positions come from js/sky-data.js; this file only draws them. */

(() => {
    const S = window.SKY, sec = $("#sky"), svg = $("#skyChart"), card = $("#skyCard");
    if (!sec) return;
    if (!S || C.sky === false) { sec.hidden = true; return; }

    // looking straight up: north at the top, east on the LEFT (like a real star map held over your head)
    const CX = 210, CY = 210, R = 180, rad = Math.PI / 180, f = n => n.toFixed(1);
    const xy = ([az, alt]) => { const r = R * Math.tan((90 - alt) / 2 * rad); return [CX - r * Math.sin(az * rad), CY - r * Math.cos(az * rad)]; };

    const rings = [30, 60].map(alt => `<circle cx="${CX}" cy="${CY}" r="${f(R * Math.tan((90 - alt) / 2 * rad))}" class="sky-grid"/>`).join("");
    const ticks = Array.from({ length: 24 }, (_, i) => {
        const a = i * 15 * rad, k = i % 6 ? 5 : 9, s = Math.sin(a), c = Math.cos(a);
        return `<line x1="${f(CX - R * s)}" y1="${f(CY - R * c)}" x2="${f(CX - (R + k) * s)}" y2="${f(CY - (R + k) * c)}"/>`;
    }).join("");
    const compass = [["N", 0], ["E", 90], ["S", 180], ["W", 270]].map(([t, az]) => {
        const [x, y] = [CX - (R + 21) * Math.sin(az * rad), CY - (R + 21) * Math.cos(az * rad)];
        return `<text x="${f(x)}" y="${f(y + 4)}" class="sky-dir">${t}</text>`;
    }).join("");
    const lines = S.lines.map(l => `<polyline points="${l.map(p => xy(p).map(f).join(",")).join(" ")}"/>`).join("");
    const stars = S.stars.map(([az, alt, mag], i) => {
        const [x, y] = xy([az, alt]), r = Math.max(.45, 2.5 - .42 * mag), o = Math.min(1, .45 + (5 - mag) * .14);
        const tw = mag < 1.6 ? ` class="tw" style="--td:${(-(i % 7) * .6).toFixed(1)}s"` : "";
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${r.toFixed(2)}" opacity="${o.toFixed(2)}"${tw}/>`;
    }).join("");
    const labels = S.labels.map(l => {
        const [x, y] = xy(l.at), left = x > CX + 60;                      // near the right edge: write it to the left
        const dot = l.planet ? (l.text.startsWith("Saturn")
            ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="5.2" ry="1.6" transform="rotate(-18 ${f(x)} ${f(y)})" class="ring"/><circle cx="${f(x)}" cy="${f(y)}" r="2.7" class="planet saturn"/>`
            : `<circle cx="${f(x)}" cy="${f(y)}" r="2.3" class="planet mars"/>`) : "";
        return `${dot}<text x="${f(x + (left ? -8 : 8))}" y="${f(y - 6)}" text-anchor="${left ? "end" : "start"}" class="sky-label">${esc(l.text)}</text>`;
    }).join("");

    svg.innerHTML = `<defs>
        <radialGradient id="skyBg" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#26306a"/><stop offset=".7" stop-color="#151b44"/><stop offset="1" stop-color="#0c1030"/></radialGradient>
        <clipPath id="skyClip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>
      <circle cx="${CX}" cy="${CY}" r="${R + 14}" class="sky-rim"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#skyBg)"/>
      <g clip-path="url(#skyClip)">${rings}<g class="sky-lines">${lines}</g><g class="sky-stars">${stars}</g><g class="sky-labels">${labels}</g></g>
      <circle cx="${CX}" cy="${CY}" r="${R}" class="sky-horizon"/>
      <g class="sky-ticks">${ticks}</g>${compass}`;
    svg.setAttribute("aria-label", `a star chart: the sky over ${S.place} at ${S.when}, with ${S.labels.map(l => l.text.split(",")[0]).join(", ")}`);

    // the moon: drawn as it really was that night
    const M = S.moon, k = M.lit / 100, r = 15, rx = f(r * Math.abs(1 - 2 * k)), side = M.waning ? 0 : 1;   // a waning moon is lit on the left
    const litPath = `M20 ${20 - r}A${r} ${r} 0 0 ${side} 20 ${20 + r}A${rx} ${r} 0 0 ${k < .5 ? 1 - side : side} 20 ${20 - r}Z`;
    $("#skyMoon").innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" class="moon-dark"/><path d="${litPath}" class="moon-lit"/></svg>
      <p class="hand">${M.up ? `the moon was out: ${M.waning ? "waning" : "waxing"}, ${M.lit}% lit`
        : `the moon was still asleep. it rose at ${esc(M.rise)}, a thin ${M.waning ? "waning" : "waxing"} crescent, ${M.lit}% lit`}</p>`;
    $("#skyWhen").innerHTML = `<span class="nw">${esc(S.place)} · ${S.lat}° N, ${S.lon}° E</span> · <span class="nw">${esc(S.when)}</span>`;

    // it fades in when she scrolls to it; the brightest stars only twinkle while it's on screen
    if (reduceMotion || !("IntersectionObserver" in window)) { card.classList.add("shown", "live"); return; }
    new IntersectionObserver(es => {
        const vis = es[0].isIntersecting;
        card.classList.toggle("live", vis);
        if (vis) card.classList.add("shown");
    }, { threshold: .3 }).observe(card);
})();