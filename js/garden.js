/* garden.js: our little garden: a new tulip every month */

(() => {
    /* ---------- our little garden: a new tulip is planted every month and blooms on the next monthly anniversary ---------- */
    (function garden() {
        const sec = $("#garden"), svg = $("#gardenSvg"), card = $("#gardenCard");
        const m = String(C.since || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        if (!sec || C.garden === false || !m) { if (sec) sec.hidden = true; return; }
        const startDay = dayNum(+m[3], +m[2] - 1, +m[1]);
        const MAXT = 7, SD = +m[1], SM = +m[2] - 1, SY = +m[3];
        // tulip k is planted on month-anniversary k and blooms on the next one (the 7th of every month)
        const monthStart = k => { const f = new Date(Date.UTC(SY, SM + k, 1)), y = f.getUTCFullYear(), mo = f.getUTCMonth();
            return dayNum(y, mo, Math.min(SD, new Date(Date.UTC(y, mo + 1, 0)).getUTCDate())); };
        const planted = T => { let n = 1; while (monthStart(n) <= T) n++; return n; };          // how many tulips are in the pot
        const grow = (i, T) => clamp((T - monthStart(i)) / (monthStart(i + 1) - monthStart(i)));
        const ddmm = k => { const f = new Date(monthStart(k) * 864e5); return `${pad(f.getUTCDate())}.${pad(f.getUTCMonth() + 1)}`; };
        const clamp = t => t < 0 ? 0 : t > 1 ? 1 : t;
        const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
        const testDays = TEST.has("days") ? parseInt(TEST.get("days"), 10) : NaN;
        const days = () => { if (!isNaN(testDays)) return testDays; const w = wallOf(Date.now()); return dayNum(w.y, w.mo, w.d) - startDay; };
        const f = n => n.toFixed(2);

        // petal colours: [deep base, body, tip, rim light]. Index 5 is the green of a young bud.
        const PAL = [
            ["#4a0a16", "#8a1c2e", "#c4475f", "#f08fa2"],   // burgundy
            ["#a1455d", "#d47a90", "#f3bcca", "#fff0f3"],   // lily pink
            ["#560b19", "#a2203a", "#de566e", "#ffa3b2"],   // tulip red
            ["#a8691a", "#e3a23a", "#f7d58a", "#fff3cf"],   // butter
            ["#6e2443", "#ae4a71", "#e08aab", "#fbd0df"],   // plum rose
            ["#2c5a40", "#4f8f6c", "#8cc29f", "#cdeed7"]    // bud green
        ];
        // [x, lean°, colour] for each tulip, centre first
        const SLOTS = [[150, -2, 0, 1], [128, -10, 1, .9], [172, 9, 2, .94], [110, -16, 3, .8], [190, 15, 4, .84], [140, -5, 2, .74], [161, 5, 1, .78]];   // x, lean°, colour, height

        const grads = PAL.map((p, i) => `
          <linearGradient id="gp${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${p[0]}"/><stop offset=".42" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient>
          <linearGradient id="gb${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient>`).join("");

        // one tulip head, base of the flower at 0,0, pointing up. o = how open (0 bud, 1 full bloom)
        function head(pi, o) {
            const p = PAL[pi], side = -4 + 19 * o, back = 8 + 9 * o;
            return `
              <path transform="rotate(${f(-back)})" d="M-12-5C-18-27-11-53 0-65C11-53 18-27 12-5Z" fill="url(#gb${pi})"/>
              <path transform="rotate(${f(back)})" d="M-12-5C-18-27-11-53 0-65C11-53 18-27 12-5Z" fill="url(#gb${pi})"/>
              <g transform="rotate(${f(-side)})"><path d="M-1 0C-17-1-26-20-25-36C-24-48-18-57-12-63C-9-46-5-26 3-5Z" fill="url(#gp${pi})"/>
                <path d="M-1 0C-17-1-26-20-25-36C-24-48-18-57-12-63C-9-46-5-26 3-5Z" fill="#2a0008" opacity=".14"/>
                <path d="M-12-62C-20-52-24-40-23-30" fill="none" stroke="${p[3]}" stroke-width=".9" stroke-linecap="round" opacity=".55"/></g>
              <g transform="rotate(${f(side)})"><path d="M1 0C17-1 26-20 25-36C24-48 18-57 12-63C9-46 5-26-3-5Z" fill="url(#gp${pi})"/>
                <path d="M1 0C17-1 26-20 25-36C24-48 18-57 12-63C9-46 5-26-3-5Z" fill="#2a0008" opacity=".2"/></g>
              <g transform="scale(${f(.86 + .16 * o)} 1)">
                <path d="M0 2C-14 1-19-18-17-36C-15-50-8-59 0-64C8-59 15-50 17-36C19-18 14 1 0 2Z" fill="url(#gp${pi})"/>
                <path d="M0 2C-14 1-19-18-17-36C-15-50-8-59 0-64C8-59 15-50 17-36C19-18 14 1 0 2Z" fill="url(#gShade)"/>
                <path d="M0-3C-1-23-1-42 0-58M-7-5C-10-23-10-40-6-52M7-5C10-23 10-40 6-52" fill="none" stroke="${p[0]}" stroke-width=".7" stroke-linecap="round" opacity=".35"/>
                <path d="M-10-14C-12-30-10-45-4-56" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".3"/>
                <path d="M0-64C8-59 15-50 17-36" fill="none" stroke="${p[3]}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
              </g>
              <ellipse cx="0" cy="1" rx="5.5" ry="3.2" fill="#3f7a58"/>`;
        }
        // a leaf with a fold down the middle (dark half + light half), base at 0,0
        const LEAF = `<path d="M0 0C-16-18-24-50-18-78C-15-90-10-98-4-104C-7-80-6-48 2-2Z" fill="#3a7353"/>
              <path d="M2-2C-6-48-7-80-4-104C3-86 8-60 7-36C6-20 5-9 2-2Z" fill="#6aa883"/>
              <path d="M1-2C-5-44-6-78-4-104" fill="none" stroke="#d6f0de" stroke-width=".8" opacity=".45"/>`;

        function tulip(i, s) {
            const [x, lean, pi, tall] = SLOTS[i], B = 210;
            const H = (14 + 104 * ease(s / .55)) * tall, L = ease((s - .03) / .32);
            let g = `<g class="sway" style="--sd:${(i * -1.3).toFixed(1)}s;transform-origin:${x}px ${B}px"><g transform="translate(${x} ${B}) rotate(${lean})">`;
            if (L > 0) {   // leaves unfurl first
                g += `<g transform="translate(-1 -4) rotate(-13) scale(${f((.45 + .55 * L) * .9)} ${f(L * .9)})">${LEAF}</g>`;
                g += `<g transform="translate(1 -6) rotate(15) scale(${f(-(.45 + .55 * L) * .72)} ${f(L * .72)})">${LEAF}</g>`;
                g += `<g transform="translate(-1 -2) rotate(-46) scale(${f((.45 + .55 * L) * .48)} ${f(L * .48)})">${LEAF}</g>`;
            }
            // tapered stem with a soft curve
            g += `<path d="M-2.4 0C-.4${f(-H * .35)} -4.9${f(-H * .7)} -1.5${f(-H)}L1.5${f(-H)}C-1.1${f(-H * .7)} 3.9${f(-H * .35)} 2.4 0Z" fill="url(#gStem)"/>`;
            if (s >= .26) {
                const o = ease((s - .74) / .26), k = s < .74 ? .3 + .48 * clamp((s - .26) / .48) : .78 + .06 * o;
                const colour = clamp((s - .4) / .24), nod = -lean * .25;
                const at = `translate(0 ${f(-H + 2)}) rotate(${f(nod)}) scale(${f(k)})`;
                if (colour < 1) g += `<g transform="${at}">${head(5, o)}</g>`;            // a young bud starts green
                if (colour > 0) g += `<g transform="${at}" opacity="${f(colour)}">${head(pi, o)}</g>`;
            }
            return g + `</g></g>`;
        }

        svg.innerHTML = `<defs>${grads}
            <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop class="sky0" offset="0" stop-color="#cfe2ec"/><stop class="sky1" offset=".75" stop-color="#eef0e4"/><stop class="sky2" offset="1" stop-color="#f7ecd6"/></linearGradient>
            <linearGradient id="gStem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#285c41"/><stop offset=".5" stop-color="#5f9c76"/><stop offset="1" stop-color="#2c6247"/></linearGradient>
            <radialGradient id="gShade" cx=".5" cy="1" r=".85"><stop offset="0" stop-color="#1a0005" stop-opacity=".42"/><stop offset=".6" stop-color="#1a0005" stop-opacity="0"/></radialGradient>
            <linearGradient id="gPot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a65536"/><stop offset=".4" stop-color="#d98a64"/><stop offset=".7" stop-color="#c9724d"/><stop offset="1" stop-color="#9c4d31"/></linearGradient>
            <linearGradient id="gRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaa483"/><stop offset=".35" stop-color="#d4825f"/><stop offset="1" stop-color="#b7643f"/></linearGradient>
            <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c49a6a"/><stop offset="1" stop-color="#a87e52"/></linearGradient>
            <pattern id="gWall" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#f1e6d2"/><circle cx="4" cy="4" r="1.1" fill="#e2cfb3"/><circle cx="13" cy="13" r="1.1" fill="#e2cfb3"/></pattern>
          </defs>
          <rect width="300" height="300" fill="url(#gWall)"/>
          <rect x="38" y="18" width="224" height="244" rx="3" fill="url(#gSky)"/>
          <g class="g-day"><circle cx="222" cy="60" r="15" fill="#fff4c9"/><circle cx="222" cy="60" r="24" fill="#fff4c9" opacity=".35"/>
            <g fill="#fff" opacity=".8"><ellipse cx="88" cy="58" rx="20" ry="7"/><ellipse cx="102" cy="52" rx="13" ry="8"/><ellipse cx="190" cy="104" rx="16" ry="5"/><ellipse cx="200" cy="100" rx="10" ry="6"/></g></g>
          <g class="g-night"><circle cx="222" cy="60" r="14" fill="#f6efd2"/><circle cx="228" cy="55" r="12" fill="#232a5a"/>
            <g fill="#fff6dc"><circle cx="70" cy="44" r="1.3"/><circle cx="120" cy="80" r="1"/><circle cx="96" cy="120" r="1.4"/><circle cx="182" cy="40" r="1"/><circle cx="244" cy="118" r="1.2"/><circle cx="60" cy="160" r="1"/><circle cx="238" cy="190" r="1"/></g></g>
          <path d="M150 18v244M38 138h224" stroke="#fbf8f2" stroke-width="6"/>
          <rect x="38" y="18" width="224" height="244" rx="3" fill="none" stroke="#fbf8f2" stroke-width="9"/>
          <path d="M43 24h214" stroke="#d9cdb8" stroke-width="2" opacity=".6"/>
          <path d="M22 10h44c-4 30 3 58-2 92-4 28-14 52-30 66H22z" fill="#ebc3cb"/><path d="M38 14c2 34-2 72-8 106M52 14c2 30 0 58-6 88" stroke="#d29aa6" stroke-width="2" fill="none" opacity=".7"/>
          <path d="M278 10h-44c4 30-3 58 2 92 4 28 14 52 30 66h12z" fill="#ebc3cb"/><path d="M262 14c-2 34 2 72 8 106M248 14c-2 30 0 58 6 88" stroke="#d29aa6" stroke-width="2" fill="none" opacity=".7"/>
          <path d="M16 8h268" stroke="#9a7350" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="150" cy="264" rx="60" ry="5" fill="#5b3b22" opacity=".25"/>
          <ellipse cx="150" cy="206" rx="47" ry="7.5" fill="#3e2a1f"/><ellipse cx="146" cy="205" rx="32" ry="4" fill="#5a3d2c"/>
          <g fill="#7a5640"><circle cx="128" cy="206" r="1.3"/><circle cx="168" cy="204" r="1.1"/><circle cx="182" cy="207" r="1"/><circle cx="118" cy="205" r=".9"/></g>
          <g id="gTulips"></g>
          <path d="M104 212h92l-10 50h-72z" fill="url(#gPot)"/><path d="M104 212h92l-1.6 8h-88.8z" fill="#7d3a22" opacity=".35"/>
          <rect x="95" y="197" width="110" height="17" rx="3" fill="url(#gRim)"/><path d="M99 200h102" stroke="#f6c3a8" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
          <path d="M150 248c-6-4-12-8-12-14 0-4 3-6 6-6 3 0 5 2 6 4 1-2 3-4 6-4 3 0 6 2 6 6 0 6-6 10-12 14z" fill="#f6dccd" opacity=".9"/>
          <path d="M114 222l3 36" stroke="#f0b394" stroke-width="2" stroke-linecap="round" opacity=".45"/>
          <rect x="10" y="262" width="280" height="12" rx="2" fill="url(#gWood)"/><rect x="10" y="272" width="280" height="12" fill="#8f6743"/>
          <path d="M14 266h272" stroke="#d8b386" stroke-width="1.2" opacity=".7"/>`;
        const layer = svg.querySelector("#gTulips");

        function draw(p) {
            const T = startDay + Math.max(0, days()), n = planted(T), shown = Math.min(n, MAXT);
            let t = "";
            for (let i = shown - 1; i >= 0; i--) {                       // back tulips first, the newest one in front
                const s = n > MAXT ? 1 : grow(i, T);
                t += tulip(i, s * p);
            }
            layer.innerHTML = t;
        }
        function caption() {
            const d = days();
            if (d < 0) { sec.hidden = true; return; }
            const T = startDay + d, n = planted(T), s = grow(n - 1, T);
            const stage = s < .26 ? "just a little sprout" : s < .45 ? "a tiny green bud" : s < .74 ? "a bud getting its colour" : "almost blooming";
            if (n > MAXT) {
                $("#gardenCap").textContent = `${n - 1} tulips, one for every month ♡`;
                $("#gardenSub").textContent = `the pot's full now · next month: tulip no. ${n} (on ${ddmm(n)})`;
            } else {
                $("#gardenCap").textContent = n === 1 ? "our first tulip" : `${n - 1} in bloom · one for every month`;
                $("#gardenSub").textContent = n === 1 ? `${stage} · it blooms on ${ddmm(1)} ♡` : `tulip no. ${n} is ${stage} · it blooms on ${ddmm(n)} ♡`;
            }
            svg.setAttribute("aria-label", $("#gardenCap").textContent);
        }
        let grown = reduceMotion;
        caption(); draw(grown ? 1 : 0);
        setInterval(() => { caption(); if (grown) draw(1); }, 600000);
        if (!("IntersectionObserver" in window)) { grown = true; draw(1); return; }
        new IntersectionObserver(es => {
            const vis = es[0].isIntersecting;
            card.classList.toggle("live", vis);
            if (vis && !grown) {
                grown = true;
                const t0 = performance.now(), dur = 2800;
                const step = t => { const k = clamp((t - t0) / dur); draw(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(step); };
                requestAnimationFrame(step);
            }
        }, { threshold: .35 }).observe(card);
    })();
})();
