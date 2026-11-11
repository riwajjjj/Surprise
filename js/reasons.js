/* reasons.js: why it's you: tear off a sticky note, there's always another.
   The ones she has torn off stay scattered around the pad (and are still there when she comes back). */

(() => {
    /* ---------- sticky notes ---------- */
    const notes = $("#notes"), colors = ["var(--butter)", "var(--rose)", "var(--sage)", "var(--sky)"];
    const R = C.reasons, pile = $("#notePile");
    let kept = []; try { kept = JSON.parse(localStorage.getItem("torn") || "[]").filter(i => Number.isInteger(i) && i >= 0 && i < R.length); } catch (e) {}
    let top = Math.max(0, R.findIndex((_, i) => !kept.includes(i)));          // start at the first one she hasn't torn off yet
    // where each torn-off note lands on a laptop: [left %, top %, tilt°], nearest the pad first, left and right in turn
    const SLOTS = [[17, 34, -6], [70, 30, 5], [2, 2, 4], [85, 4, -5], [16, -3, -3], [71, -5, 7], [1, 38, 7], [86, 39, -4], [15, 71, 5], [70, 69, -6], [2, 74, -4], [85, 73, 6]];
    function scrap(i, fresh) {
        if (!pile || pile.querySelector(`[data-i="${i}"]`)) return;
        const [x, y, r] = SLOTS[pile.childElementCount % SLOTS.length];
        pile.insertAdjacentHTML("beforeend", `<div class="scrap${fresh ? " new" : ""}" data-i="${i}" style="--c:${colors[i % 4]};--px:${x}%;--py:${y}%;--r:${r}deg"><span class="num">no. ${pad(i + 1)}</span><p>${esc(R[i])}</p></div>`);
    }
    kept.forEach(i => scrap(i));
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
        if (!kept.includes(top)) { kept.push(top); try { localStorage.setItem("torn", JSON.stringify(kept)); } catch (e) {} }
        scrap(top, true);
        setTimeout(() => { top = (top + 1) % R.length; layoutNotes(); }, 420);
    }
    notes.addEventListener("click", e => { if (e.target.closest(".sticky") === stickies[top]) tear(); });
    notes.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === stickies[top]) { e.preventDefault(); tear(); } });
    layoutNotes();
})();