/* film.js: the film roll on the cork board (it drifts sideways on its own) */

(() => {
    /* ---------- film roll ---------- */
    const hasAny = a => (a || []).length > 0;
    if (!hasAny(C.filmRoll)) $("#roll").hidden = true;
    $("#film").innerHTML = (C.filmRoll || []).map(f => typeof f === "string" ? { src: f } : (f || {})).map((f, i) =>
            `<div class="frame"><span class="fnum">${i * 2 + 1} ▸ ${i * 2 + 1}A</span>${photo(f.src, "3/2", f.stamp || "", f.caption || "", `filmRoll ${i + 1}`)}<span class="fnum b">400 ▸ ${i * 2 + 2}</span></div>`).join("") +
        `<span class="pin" style="left:18px"></span><span class="pin" style="right:18px;left:auto"></span>`;

    (function filmDrift() {
        const fs = $(".film-scroll"), note = $("#rollNote");
        if (!fs || $("#roll").hidden) return;
        const room = () => fs.scrollWidth - fs.clientWidth;
        const setNote = () => { note.textContent = room() > 8 ? "scroll sideways →" : "tap a frame to look closer"; };
        setNote(); onWidthChange(setNote);
        if (reduceMotion) return;
        let pos = 0, set = -1, dir = 1, last = 0, until = 0, hover = false, inView = false, running = false, max = room();
        onWidthChange(() => { max = room(); }); addEventListener("load", () => { max = room(); });
        const hold = () => { until = performance.now() + 4000; };
        ["pointerdown", "wheel", "touchstart", "keydown", "focusin"].forEach(ev => fs.addEventListener(ev, hold, { passive: true }));
        fs.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });   // touch taps don't count as hovering
        fs.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { hover = false; hold(); } });
        const kick = () => { if (running || !inView || document.hidden) return; running = true; last = 0; set = -1; pos = fs.scrollLeft; requestAnimationFrame(step); };
        if ("IntersectionObserver" in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; kick(); }, { threshold: .3 }).observe(fs);
        else inView = true;
        document.addEventListener("visibilitychange", kick);
        function step(t) {
            if (!inView || document.hidden) { running = false; return; }
            const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
            if (!hover && t > until && max > 8) {
                if (set >= 0 && Math.abs(fs.scrollLeft - set) > 2) { pos = fs.scrollLeft; hold(); }   // she moved it herself
                else {
                    pos += dir * 22 * dt;
                    if (pos >= max) { pos = max; dir = -1; until = t + 1800; } else if (pos <= 0) { pos = 0; dir = 1; until = t + 1800; }
                    fs.scrollLeft = pos;
                }
                set = fs.scrollLeft;
            } else { pos = fs.scrollLeft; set = -1; }
            requestAnimationFrame(step);
        }
        kick();
    })();
})();
