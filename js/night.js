/* night.js: night mode: after 11pm the page dims, stars come out, a goodnight note */

(() => {
    /* ---------- night mode: after 11pm the page dims, stars come out, and a goodnight note pops up once a night ---------- */
    (function night() {
        const sky = $("#night"), note = $("#nightNote");
        if (C.nightMode === false || !sky) return;
        sky.innerHTML = Array.from({ length: 34 }, () =>
            `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;--tw:${(2 + Math.random() * 3).toFixed(1)}s;--td:${(-Math.random() * 5).toFixed(1)}s;--ts:${(1.5 + Math.random() * 2).toFixed(1)}px"></i>`).join("");
        let on = null;
        const check = () => { const h = wallOf(Date.now()).h, n = TEST.has("night") || h >= 23 || h < 5; if (n !== on) { on = n; document.documentElement.classList.toggle("night", n); } };
        check(); setInterval(check, 60000);
        note.querySelector("p").textContent = C.nightNote || "it's late. go to sleep, i'll still be here tomorrow ♡";
        let hideT;
        const hide = () => { clearTimeout(hideT); note.classList.remove("in"); setTimeout(() => { note.hidden = true; }, 600); };
        note.querySelector("button").addEventListener("click", hide);
        showNightNote = () => {
            if (!on) return;
            const w = wallOf(Date.now() - 5 * 36e5), key = `${w.y}-${w.mo}-${w.d}`;   // one note per night (a night runs until 5am)
            let seen = ""; try { seen = localStorage.getItem("nightNote") || ""; } catch (e) {}
            if (seen === key && !TEST.has("night")) return;
            try { localStorage.setItem("nightNote", key); } catch (e) {}
            setTimeout(() => {
                note.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => note.classList.add("in")));
                hideT = setTimeout(hide, 15000);
            }, 2500);
        };
    })();
})();
