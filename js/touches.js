/* touches.js: little touches: doodles draw themselves, photos develop, the tab misses her, the xoxo sticker, gentle reveals */

(() => {
    /* ---------- life: doodles draw themselves, polaroids develop ---------- */
    (function life() {
        if (reduceMotion || !("IntersectionObserver" in window)) return;
        const GEO = "path,ellipse,circle,line,polyline,polygon";
        const doodles = [...document.querySelectorAll("svg.doodle")].filter(svg => {
            let ok = false;
            svg.querySelectorAll(GEO).forEach(g => {
                let L = 0; try { L = g.getTotalLength(); } catch (e) {}
                if (!L) return;
                ok = true; g.dataset.len = L; g.style.strokeDasharray = L + 2; g.style.strokeDashoffset = L + 2;
            });
            return ok;
        });
        const devs = [...document.querySelectorAll(".hero-collage .ph, .collage .ph, .clip-pol .ph, .keep .ph")].filter(ph => !ph.classList.contains("shot-ph"));   // screenshots don't "develop"
        devs.forEach(ph => ph.classList.add("undev"));
        function draw(svg) {
            let t = 0;
            svg.querySelectorAll(GEO).forEach(g => {
                const L = +g.dataset.len; if (!L) return;
                const d = Math.min(1.1, Math.max(.3, L / 240));
                g.style.transition = `stroke-dashoffset ${d.toFixed(2)}s cubic-bezier(.45,.05,.4,1) ${t.toFixed(2)}s`;
                g.style.strokeDashoffset = "0"; t += d * .85;
            });
        }
        let started = false;
        startLife = () => {
            if (started) return; started = true;
            const io = new IntersectionObserver(es => es.forEach(e => {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                if (e.target instanceof SVGElement) draw(e.target);
                else setTimeout(() => e.target.classList.remove("undev"), 250 + Math.random() * 450);
            }), { threshold: .45 });
            doodles.forEach(s => io.observe(s));
            devs.forEach(ph => io.observe(ph));
        };
    })();

    /* ---------- little touches ---------- */
    // the tab misses her when she looks away
    (function missYou() {
        const real = document.title;
        document.addEventListener("visibilitychange", () => { document.title = document.hidden ? "come back ♡" : real; });
    })();

    // the xoxo sticker: tap it for hearts
    (function xoxo() {
        const st = document.querySelector(".hero .sticker"); if (!st) return;
        st.setAttribute("role", "button"); st.tabIndex = 0; st.title = "tap me ♡";
        function hearts() {
            st.classList.remove("boop"); void st.offsetWidth; st.classList.add("boop");
            popHearts(st, 12, { x: 80, y: [60, 150], step: .04, size: [14, 26] });
        }
        st.addEventListener("click", hearts);
        st.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hearts(); } });
    })();

    /* ---------- gentle reveal (only for things below the fold) ---------- */
    if ("IntersectionObserver" in window && !reduceMotion) {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
        document.querySelectorAll(".rv").forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); } });
    }

    /* ---------- heart cursor (mouse only) ---------- */
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) document.documentElement.classList.add("heart-cursor");
})();
