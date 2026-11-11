/* opening.js: the lock screen (combination lock, wrong answers, postmark, petals, cracking seal) and the book cover she opens */

(() => {
    /* ---------- lock, then the book cover (she opens it herself) ---------- */
    const lock = $("#lock"), cover = $("#cover");
    (function buildCover() {
        const s0 = seed, p0 = phIndex;                      // don't disturb the scrapbook's layout randomness
        const img = C.cover && C.cover.src ? esc(C.cover.src) : placeholder(0, "1/1", false, "cover");
        seed = s0; phIndex = p0;
        const stamp = (C.cover && C.cover.stamp) || "";
        const dm = String(C.since || "").match(/^(\d{1,2})\D+(\d{1,2})/);
        const short = dm ? `${pad(dm[1])}.${pad(dm[2])}` : "";
        cover.querySelector(".cover-wrap").innerHTML = `
      <div class="cover-pages"><div class="first-page"><p class="type tiny">volume one · ${esc(C.since)}</p><p class="hand fp-line">the story so far,</p><p class="hand fp-line">for ${esc(C.to)} ♡</p></div><span class="cover-ribbon"></span></div>
      <div class="cover-board">
        <div class="cover-front">
          <span class="corner tr"></span><span class="corner br"></span>
          <div class="cover-pol"><span class="washi" style="--wash:var(--rose);top:-11px;left:calc(50% - 42px);transform:rotate(-5deg)"></span><span class="cph"><img alt="" src="${img}">${stamp ? `<span class="date-stamp">${esc(stamp)}</span>` : ""}</span><span class="cap">us ♡</span></div>
          <div class="cover-label"><span class="type tiny">volume one</span><span class="plate-title">a little book of us</span><span class="hand">for ${esc(C.to)}</span></div>
          ${short ? `<span class="cover-date">${short}</span>` : ""}
          <svg class="cover-tulip" viewBox="0 0 24 24" aria-hidden="true"><path class="ct-stem" d="M12 13.5v8"/><path class="ct-leaf" d="M12 20.4c-2.9-.2-4.7-1.9-5.3-4.3 2.7.2 4.5 1.7 5.3 4.3z"/><path class="ct-head" d="M6.2 5 9.2 7.8 12 4 14.8 7.8 17.8 5C17.8 11 15.6 14.3 12 14.3S6.2 11 6.2 5Z"/></svg>
        </div>
        <div class="cover-inside"><div class="bookplate"><span class="type tiny">ex libris</span><span class="bp-small">this book belongs to</span><span class="hand bp-name">${esc(C.to)}</span><span class="bp-small">with love, ${esc(C.from)}</span></div></div>
      </div>
      <span class="cover-strap"></span>`;
    })();
    let coverState = 0; // 0 closed, 1 opening, 2 gone
    function hideCover() { if (coverState === 2) return; coverState = 2; cover.classList.add("gone"); unlockScroll(); setTimeout(() => (mix ? mix.reveal() : bg.reveal()), 900); }
    function showCover() { cover.classList.add("in"); setTimeout(() => cover.focus({ preventScroll: true }), 300); }
    function openCover() {
        if (!cover.classList.contains("in")) return;
        if (coverState === 1) { hideCover(); return; }        // a second tap skips ahead
        if (coverState) return;
        coverState = 1; toTop(); if (mix) mix.start(); else bg.start();
        if (reduceMotion) { hideCover(); return; }
        cover.classList.add("open");                          // strap snaps off, cover swings open
        setTimeout(hideCover, 3500);                          // a moment to see the inside, then into the book
    }
    cover.addEventListener("click", openCover);
    cover.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCover(); } });
    /* ---------- the lock: a little combination lock, cute wrong answers, a postmark, falling petals, and a seal that cracks open ---------- */
    (function lockScreen() {
        const form = $("#lockForm"), env = $(".lock-env"), msg = $("#lockMsg"), pw = $("#pw"), seal = $(".seal-btn"), combo = $("#combo");
        const PASS = String(C.password || "").trim();
        const useCombo = /^\d{3,6}$/.test(PASS);
        const WRONG = Array.isArray(C.wrongAnswers) && C.wrongAnswers.length ? C.wrongAnswers
            : ["nope ♡ try again", "think harder, i'll wait", "hmm, do you not remember?? 😤"];
        let tries = 0, done = false;

        // the postmark + a little tulip stamp in the corner of the envelope
        const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        // the postmark shows the day she opens it (or config.js → postmarkDate), never your 'since' date, which is the password
        const pm = String(C.postmarkDate || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/), tw = wallOf(Date.now());
        const sm = pm || [0, tw.d, tw.mo + 1, tw.y];
        const city = esc(String(C.postmarkCity || "KATHMANDU").toUpperCase());
        $("#postmark").innerHTML = `<span class="postage lock-stamp"><i>${TULIP}</i></span>
          <svg class="pm" viewBox="0 0 170 120" aria-hidden="true">
            <defs><path id="pmTop" d="M84 60a36 36 0 0 1 72 0"/><path id="pmBot" d="M80 60a40 40 0 0 0 80 0"/></defs>
            <g fill="none" stroke="currentColor"><circle cx="120" cy="60" r="44" stroke-width="2.2"/><circle cx="120" cy="60" r="31" stroke-width="1.2"/>
              <path d="M4 44c10-6 20 6 30 0s20-6 30 0M2 60c10-6 20 6 30 0s20-6 30 0M4 76c10-6 20 6 30 0s20-6 30 0" stroke-width="2.2" stroke-linecap="round"/></g>
            <text font-size="10.5" letter-spacing="1.6" fill="currentColor"><textPath href="#pmTop" startOffset="50%" text-anchor="middle">${city}</textPath></text>
            <text font-size="9" letter-spacing="2" fill="currentColor"><textPath href="#pmBot" startOffset="50%" text-anchor="middle">♡ US ♡</textPath></text>
            <text x="120" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${pad(sm[1])} ${MON[+sm[2] - 1] || ""}</text>
            <text x="120" y="72" text-anchor="middle" font-size="11" letter-spacing="1" fill="currentColor">${sm[3]}</text>
          </svg>`;

        // tulip petals drifting down behind the envelope
        if (!reduceMotion) {
            const cols = [["#8a1c2e", "#b0384e"], ["#d47a90", "#f3bcca"], ["#a8344a", "#e07a8f"], ["#ebc3cb", "#fbe3e8"]];
            lock.querySelector(".petals").innerHTML = Array.from({ length: 16 }, (_, i) => {
                const [a, b] = cols[i % cols.length];
                return `<i style="--px:${(Math.random() * 100).toFixed(1)}%;--pw:${(9 + Math.random() * 9).toFixed(0)}px;--pc:${a};--pc2:${b};--sx:${(Math.random() * 80 - 40).toFixed(0)}px;--pd:${(9 + Math.random() * 8).toFixed(1)}s;--pdl:${(-Math.random() * 16).toFixed(1)}s"></i>`;
            }).join("");
        }

        const hideLock = () => { lock.classList.add("gone"); setTimeout(() => { lock.hidden = true; }, 900); };
        if (!PASS) { hideLock(); showCover(); return; }
        // keep a trailing "(day · month)" together on one line
        $("#hintLbl").innerHTML = esc(C.passwordHint || "").replace(/\s*(\([^)]*\))\s*$/, ' <span class="nw">$1</span>');

        // the combination lock: one wheel per digit
        const dials = [];
        function setIdx(d, idx, anim) {
            if (!anim) d.strip.style.transition = "none";
            d.idx = idx; d.strip.style.setProperty("--i", idx);
            if (!anim) { void d.strip.offsetWidth; d.strip.style.transition = ""; }
        }
        function step(d, dir) {
            if (done) return;
            if (d.idx < 4 || d.idx > 25) setIdx(d, 10 + d.v, false);           // recentre before it runs out of numbers
            d.v = (d.v + dir + 10) % 10;
            setIdx(d, d.idx + dir, true);
            d.el.setAttribute("aria-valuenow", d.v);
            clearTimeout(d.t); d.t = setTimeout(() => setIdx(d, 10 + d.v, false), 300);
            if (dials.map(x => x.v).join("") === PASS) success();
        }
        function setTo(d, v) { const diff = ((v - d.v) + 10) % 10; if (diff) step(d, diff <= 5 ? diff : diff - 10); }
        if (useCombo) {
            pw.hidden = true; combo.hidden = false;
            $("#hintLbl").removeAttribute("for"); combo.setAttribute("aria-labelledby", "hintLbl");
            combo.innerHTML = [...PASS].map((_, i) => `<div class="dial" tabindex="0" role="spinbutton" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0" aria-label="number ${i + 1} of ${PASS.length}">
                <button type="button" class="dial-btn" data-dir="1" tabindex="-1" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 7l5-5 5 5"/></svg></button>
                <span class="dial-win"><span class="dial-strip">${Array.from({ length: 30 }, (_, k) => `<span>${k % 10}</span>`).join("")}</span></span>
                <button type="button" class="dial-btn" data-dir="-1" tabindex="-1" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 1l5 5 5-5"/></svg></button></div>`).join("");
            combo.querySelectorAll(".dial").forEach((el, i) => {
                const d = { el, strip: el.querySelector(".dial-strip"), v: 0, idx: 10, t: 0 };
                dials.push(d); setIdx(d, 10, false);
                el.querySelectorAll(".dial-btn").forEach(b => b.addEventListener("click", () => step(d, +b.dataset.dir)));
                const win = el.querySelector(".dial-win");
                let y0 = null, moved = false, acc = 0;
                win.addEventListener("pointerdown", e => { y0 = e.clientY; moved = false; try { win.setPointerCapture(e.pointerId); } catch (x) {} });
                win.addEventListener("pointermove", e => {
                    if (y0 === null) return;
                    const dy = e.clientY - y0;
                    if (Math.abs(dy) >= 20) { step(d, dy < 0 ? 1 : -1); y0 = e.clientY; moved = true; }
                });
                win.addEventListener("pointerup", () => { if (y0 !== null && !moved) step(d, 1); y0 = null; });
                win.addEventListener("pointercancel", () => { y0 = null; });
                el.addEventListener("wheel", e => { e.preventDefault(); acc += e.deltaY; if (Math.abs(acc) >= 40) { step(d, acc < 0 ? 1 : -1); acc = 0; } }, { passive: false });
                el.addEventListener("keydown", e => {
                    if (e.key === "ArrowUp") { e.preventDefault(); step(d, 1); }
                    else if (e.key === "ArrowDown") { e.preventDefault(); step(d, -1); }
                    else if (/^\d$/.test(e.key)) { e.preventDefault(); setTo(d, +e.key); if (dials[i + 1]) dials[i + 1].el.focus(); }
                    else if (e.key === "ArrowRight" && dials[i + 1]) dials[i + 1].el.focus();
                    else if (e.key === "ArrowLeft" && dials[i - 1]) dials[i - 1].el.focus();
                    else if (e.key === "Enter") { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true })); }
                });
            });
        } else setTimeout(() => pw.focus(), 400);

        const value = () => useCombo ? dials.map(x => x.v).join("") : pw.value.trim().toLowerCase();
        function wrong() {
            tries++;
            msg.textContent = tries > WRONG.length ? (C.lastHint || "it's the night you said yes (00:55) ♡") : WRONG[tries - 1];
            env.classList.remove("shake"); void env.offsetWidth; env.classList.add("shake");
        }
        function burst() {
            if (reduceMotion) return;
            const r = seal.getBoundingClientRect(), box = document.createElement("div");
            box.className = "burst-box"; box.style.left = (r.left + r.width / 2) + "px"; box.style.top = (r.top + r.height / 2) + "px";
            lock.appendChild(box);
            popHearts(box, 26, { x: 130, y: [60, 220], spin: 60, step: .025, size: [14, 30], petal: i => i % 3 === 0 });
        }
        function success() {
            if (done) return; done = true;
            toTop(); if (!mix) bg.start();
            msg.textContent = "";
            seal.classList.add("cracked"); seal.innerHTML = `<span class="half l"></span><span class="half r"></span>`;
            lock.classList.add("opening");
            burst();
            setTimeout(() => lock.classList.add("gone"), reduceMotion ? 0 : 1600);
            setTimeout(showCover, reduceMotion ? 300 : 2100);
            setTimeout(() => { lock.hidden = true; }, reduceMotion ? 900 : 2800);
        }
        form.addEventListener("submit", e => { e.preventDefault(); if (done) return; value() === PASS.toLowerCase() ? success() : wrong(); });
    })();
})();
