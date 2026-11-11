/* reasons.js: why it's you: tear off a sticky note, there's always another */

(() => {
    /* ---------- sticky notes ---------- */
    const notes = $("#notes"), colors = ["var(--butter)", "var(--rose)", "var(--sage)", "var(--sky)"];
    const R = C.reasons; let top = 0;
    notes.innerHTML = R.map((t, i) => `<div class="sticky" style="--c:${colors[i % 4]}"><span class="num">no. ${pad(i + 1)}</span><p>${esc(t)}</p><span class="num">tap to tear off →</span></div>`).join("");
    const stickies = [...notes.children];
    const offs = stickies.map(() => [tilt(5).toFixed(1), tilt(10).toFixed(0), tilt(8).toFixed(0)]);
    function layoutNotes() {
        stickies.forEach((s, i) => {
            const rel = (i - top + R.length) % R.length;
            s.classList.remove("off");
            s.style.zIndex = R.length - rel;
            s.style.opacity = rel > 3 ? 0 : 1;
            const [r, x, y] = rel === 0 ? [-1.5, 0, 0] : offs[i];
            s.style.setProperty("--r", r + "deg"); s.style.setProperty("--x", x + "px"); s.style.setProperty("--y", y + "px");
            s.setAttribute("aria-hidden", rel === 0 ? "false" : "true");
            s.tabIndex = rel === 0 ? 0 : -1; s.setAttribute("role", "button");
        });
        $("#noteCount").textContent = `${top + 1} of ${R.length} (and counting)`;
    }
    function tear() {
        const cur = stickies[top]; cur.classList.add("off");
        setTimeout(() => { top = (top + 1) % R.length; layoutNotes(); }, 420);
    }
    notes.addEventListener("click", e => { if (e.target.closest(".sticky") === stickies[top]) tear(); });
    notes.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === stickies[top]) { e.preventDefault(); tear(); } });
    layoutNotes();
})();
