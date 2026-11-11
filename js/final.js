/* final.js: the final letter, the keepsake polaroid + pressed tulip, and the sealed letter */

(() => {
    /* ---------- final letter ---------- */
    const F = C.finalLetter;
    // showScan: true  -> a scanned handwritten note (your photo in "scan", or your letter written out in ink)
    // showScan: false -> the lined letter paper
    const inked = t => esc(t).split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w
        : `<span style="--jy:${tilt(1.2).toFixed(1)}px;--jr:${tilt(1.4).toFixed(1)}deg">${w}</span>`).join("");
    const useScan = F.showScan ?? !!F.scan;
    $("#finalLetter").innerHTML = !useScan
        ? `<div class="letter-paper torn"><p class="to">dear ${esc(C.to)},</p><p class="body">${esc(F.body)}</p><p class="sig">always, ${esc(C.from)}</p></div>`
        : F.scan
            ? `<div class="scan">${washi()}<span class="ph scan-photo" data-cap="read it twice ♡"><img src="${esc(F.scan)}" alt="a handwritten letter" loading="lazy" decoding="async"></span></div>`
            : `<div class="scan"><div class="scan-sheet" role="img" aria-label="${esc(`a handwritten letter: dear ${C.to}, ${F.body} always, ${C.from}`)}">
                 <span class="stain" aria-hidden="true"></span>
                 <div class="ink" aria-hidden="true"><p class="ink-to">dear ${esc(C.to)},</p><p class="ink-body">${inked(F.body)}</p>
                 <p class="ink-sig">always, ${esc(C.from)} <svg class="ink-heart" viewBox="0 0 60 56"><path d="M30 50C18 41 5 32 5 19 5 10 12 5 19 6c6 1 9 6 11 10 2-5 6-10 13-10 8 0 13 7 11 15-2 12-14 21-24 29"/></svg></p></div>
               </div></div>`;
    $("#footer").textContent = `made by hand, for ${C.to} ♡`;

    const P = F.photo;
    const PRESSED = `<svg viewBox="0 0 90 170" aria-hidden="true">
      <path class="st" d="M46 168C45 136 48 104 45 70"/>
      <path class="lf" d="M45 160C30 146 22 120 26 92c9 18 16 40 19 68z"/><path class="lf" d="M46 140c14-14 20-34 17-58-9 15-15 35-17 58z"/>
      <path class="p-petal2" d="M33 44c1-16 7-25 12-30 5 5 11 14 12 30-3 20-21 20-24 0z"/>
      <path class="p-petal" d="M45 74C30 72 23 58 25 34c7 5 14 11 20 22z"/><path class="p-petal" d="M45 74c15-2 22-16 20-40-7 5-14 11-20 22z"/>
      <path class="p-petal2" d="M36 47c1-12 6-18 9-22 4 4 8 10 9 22-1 17-6 27-9 27s-8-10-9-27z"/>
      <path d="M71 120c6-2 11 1 12 6-6 2-11-1-12-6z" class="p-petal"/></svg>`;
    $("#keep").innerHTML = (P ? `<button class="polaroid" style="--r:5deg;--ar:4/5">${washi()}${photo(P.src, "4/5", P.stamp || "", P.caption, "finalLetter photo")}<span class="cap">${esc(P.caption)}</span></button>` : "") +
        `<span class="pressed${P ? "" : " alone"}">${PRESSED}<span class="washi dots" style="--wash:var(--sky)"></span></span>`;

    (function sealedLetter() {
        const S = C.sealedLetter, wrap = $("#sealed");
        const m = S && String(S.opensOn || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        if (!m || !S.body) return;
        const at = instantOf(+m[3], +m[2] - 1, +m[1]);
        const title = S.title || "later";
        wrap.hidden = false;
        wrap.innerHTML = `<p class="hand sealed-kicker">oh, and one more thing…</p>
      <button class="env" aria-label="A sealed letter: open on ${esc(title)}"><span class="postage"><i>♡</i></span><span class="wax">${TULIP}</span>
      <span class="to"><small>open on</small>${esc(title)}</span><span class="rubber">do not open<br>until ${esc(S.opensOn)}</span></button>
      <p class="type sealed-count" aria-live="polite"></p>`;
        const btn = wrap.querySelector(".env"), cnt = wrap.querySelector(".sealed-count");
        let msgT;
        const left = () => at - Date.now();
        function paint() {
            const ms = left();
            wrap.classList.toggle("ready", ms <= 0);
            if (ms <= 0) { cnt.textContent = "it's time. open it ♡"; return; }
            const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), mi = Math.floor(ms % 36e5 / 6e4);
            cnt.textContent = d > 0 ? `opens in ${d} day${d === 1 ? "" : "s"}, ${h} hour${h === 1 ? "" : "s"}` : `opens in ${h}h ${pad(mi)}m`;
        }
        paint(); setInterval(paint, 30000);
        btn.addEventListener("click", () => {
            if (left() > 0) {
                clearTimeout(msgT); cnt.textContent = "not yet ♡ patience";
                btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
                msgT = setTimeout(paint, 2600); return;
            }
            openLetter(`for ${title} —`, S.body, `${C.from} ♡`, "#ebc3cb");
        });
    })();

    // line the ruled paper up under the handwriting
    ruleAll(); onWidthChange(ruleAll);
    if (document.fonts) document.fonts.ready.then(ruleAll);
})();
