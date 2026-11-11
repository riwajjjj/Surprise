/* scrapbook.js: the scrapbook pages: photos and mementos laid out like a hand-made collage */

(() => {
    /* ---------- scrapbook spreads: hand-placed, overlapping collages ---------- */
    const richText = t => String(t ?? "").split(/<br\s*\/?>/i).map(esc).join("<br>");
    function memento(m) {
        switch (m.type) {
            case "ticket": return `<div class="m m-ticket${m.red ? " red" : ""}"><div class="a"><span>admit one</span><b>${esc(m.title)}</b><span>${esc(m.date)}</span></div><div class="s">no. ${pad(Math.floor(rnd() * 90 + 10))}${pad(Math.floor(rnd() * 99))}</div></div>`;
            case "receipt": return `<div class="m m-receipt"><b>${esc(m.title)}</b><span class="dt">${esc(m.date)}</span>${(m.lines || []).map(([a, b]) => `<div class="row"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join("")}<hr><div class="row tot"><span>total</span><span>${esc(m.total)}</span></div><span class="thx">thank you, come again ♡</span></div>`;
            case "note": return `<div class="m m-note torn">${esc(m.text)}</div>`;
            case "sticker": return `<div class="m"><span class="m-sticker${m.heart ? " heart" : ""}" style="--sc:${washes[Math.floor(rnd() * 4)]}">${richText(m.text)}</span></div>`;
            case "tag": return `<div class="m m-tag"><span class="hole"></span><span class="lbl">${esc(m.label)}</span><span class="val">${esc(m.text)}</span></div>`;
            case "screenshot": return `<div class="m m-shot"><span class="washi" style="--wash:var(--rose);top:-12px;left:calc(50% - 40px);width:80px;transform:rotate(${tilt(6).toFixed(1)}deg)"></span><span class="ph shot-ph" data-cap="${esc(m.caption || "")}" data-stamp=""><img alt="${esc(m.caption || "a screenshot of our texts")}" loading="lazy" decoding="async" src="${src(m.src, "9/16", false, "screenshot")}"></span>${m.caption ? `<span class="shot-cap">${esc(m.caption)}</span>` : ""}</div>`;
            case "chat": return `<div class="m m-chat"><div class="chat-top"><span class="dot"></span><b>${esc(m.with || C.to)}</b><span>${esc(m.date || "")}</span></div>${(m.messages || []).map(([who, t]) => `<p class="b ${who === "me" ? "me" : "them"}">${esc(t)}</p>`).join("")}</div>`;
            case "leaf": return `<div class="m"><svg class="m-leaf" viewBox="0 0 100 160" aria-hidden="true"><path d="M50 150C48 120 52 95 50 70 30 62 14 44 16 22 34 24 46 40 50 58 54 40 66 24 84 22 86 44 70 62 50 70"/><path class="vein" d="M50 155V40M50 90 34 78M50 110 66 98M50 70 28 40M50 66 72 38"/></svg></div>`;
        }
        return "";
    }
// slot = [left %, top %, width %, rotation]; two mirrored layouts alternate between pages
    const PHOTO_SLOTS = [[2, 3, 30, -4], [29, 15, 26, 3], [56, 1, 31, -2], [6, 52, 28, 5], [60, 46, 31, -3]];
    const MEMO_SLOTS = [[37, 63, 20, -6], [86, 4, 13, 9], [40, 0, 15, -7]];
    const FEW_PHOTO_SLOTS = [[3, 6, 32, -4], [60, 12, 30, 3]];
    const FEW_MEMO_SLOTS = [[38, 3, 23, -4], [36, 48, 24, 4], [36, 80, 10, 7], [86, 74, 11, -8], [86, 1, 13, 10]];
    const SHOT_MEMO_SLOTS = [[37, 3, 23, -4], [38, 27, 20, 3], [36, 44, 25, -3], [90, 1, 9, 10], [40, 62, 22, -4]];   // photo + screenshot pages
    const ONE_PHOTO_SLOTS = [[4, 4, 34, -4]];
    const ONE_MEMO_SLOTS = [[41, 1, 22, 3], [65, 9, 25, -3], [42, 50, 21, -5], [89, -1, 9, 10], [68, 62, 20, 4]];
    const NONE_MEMO_SLOTS = [[3, 6, 27, -4], [34, 14, 26, 3], [64, 4, 26, -3], [10, 50, 25, 4], [44, 56, 26, -4], [78, 48, 14, 9]];
    const mirror = ([l, t, w, r]) => [100 - l - w, t, w, -r];
    const ULINES = [
        `<svg class="doodle u-line" viewBox="0 0 300 16" aria-hidden="true"><path d="M3 10c40-6 80-7 122-3s92 5 120-1 38-4 52-2"/></svg>`,
        `<svg class="doodle u-line" viewBox="0 0 300 16" aria-hidden="true"><path d="M4 6c50 4 110 6 170 3s90-4 120 2M30 13c60-2 130-3 190-1"/></svg>`];
    const CIRCLE = `<svg class="doodle d-circle" viewBox="0 0 116 44" aria-hidden="true"><path d="M20 8C40 1 86 2 104 12s8 24-30 28S6 38 6 24C6 14 20 6 44 4"/></svg>`;
    const pages = [];
    C.chapters.forEach((ch, ci) => {
        const photos = ch.photos || [], memos = ch.mementos || [];
        if (!photos.length) { pages.push({ ch, ci, cont: false, photos: [], mementos: memos.slice(0, 6) }); return; }
        for (let i = 0; i < photos.length; i += 5) {
            const chunk = photos.slice(i, i + 5);
            pages.push({ ch, ci, start: i, cont: i > 0, photos: chunk, mementos: i === 0 ? memos.slice(0, (chunk.length <= 2 ? 5 : 3) + (chunk.length <= 1 && memos.some(m => m.type === "screenshot") ? 1 : 0)) : [] });
        }
    });
    $("#spreads").innerHTML = pages.map((pg, pi) => {
        const flip = pi % 2 === 1;
        // a page with no photos but a screenshot: the screenshot takes the main photo spot
        // a screenshot on a page with 0 or 1 photos becomes a main picture too (the next photo spot)
        const shotLead = pg.photos.length <= 1 && pg.mementos.some(m => m.type === "screenshot");
        const n = pg.photos.length + (shotLead ? 1 : 0);
        const pSlots = n === 1 ? ONE_PHOTO_SLOTS : n <= 2 ? FEW_PHOTO_SLOTS : PHOTO_SLOTS;
        const mSlots = shotLead && pg.photos.length === 1 ? SHOT_MEMO_SLOTS : n === 0 ? NONE_MEMO_SLOTS : n === 1 ? ONE_MEMO_SLOTS : n <= 2 ? FEW_MEMO_SLOTS : MEMO_SLOTS;
        const car = n === 0 ? "10/3.6" : n === 1 ? "10/5.6" : n <= 2 ? "10/6.3" : n <= 3 ? "10/5.8" : "10/7.2";
        const tw = t => (t * Number(car.split("/")[1]) / 10).toFixed(2);   // top as % of page width
        let d = 0;
        const items = pg.photos.map((p, k) => {
            let [l, t, w, r] = pSlots[k]; if (flip) [l, t, w, r] = mirror([l, t, w, r]);
            r = (r + tilt(1.5)).toFixed(1);
            const tape = k % 2 ? washi("corner") : washi();
            const pos = `--l:${l}%;--t:${t}%;--tw:${tw(t)};--w:${w}%;--r:${r}deg;--z:${k + 1};--d:${(d++ * .09).toFixed(2)}s`;
            if (p.print) return `<button class="print rv wide" style="${pos};--ar:${p.ar || "3/2"}">${tape}${photo(p.src, p.ar || "3/2", p.stamp, p.caption, `chapter ${pg.ci + 1}, photo ${pg.start + k + 1}`)}</button>`;
            const arrow = p.arrow ? `<span class="pointer" aria-hidden="true"><svg class="doodle" viewBox="0 0 60 30"><path d="M56 15C40 6 22 8 6 19"/><path d="M6 19l8-10M6 19l12 2"/></svg><span>${esc(p.arrow)}</span></span>` : "";
            return `<button class="polaroid rv${n === 1 ? " solo" : ""}${p.arrow ? " has-arrow" : ""}${flip ? " flip" : ""}" style="${pos};--ar:${p.ar || "1/1"}">${tape}${photo(p.src, p.ar || "1/1", p.stamp, p.caption, `chapter ${pg.ci + 1}, photo ${pg.start + k + 1}`)}<span class="cap">${esc(p.caption)}</span>${arrow}</button>`;
        });
        let mk = 0, leadDone = false;
        pg.mementos.forEach((m, k) => {
            const lead = shotLead && !leadDone && m.type === "screenshot";
            if (lead) leadDone = true;
            let [l, t, w, r] = lead ? (n === 1 ? [6, 3, 30, -3] : [FEW_PHOTO_SLOTS[1][0] + 2, FEW_PHOTO_SLOTS[1][1], 28, 3]) : (mSlots[mk++] || mSlots[mSlots.length - 1]);
            if (flip) [l, t, w, r] = mirror([l, t, w, r]);
            const html = memento(m).replace('class="m', `style="--l:${l}%;--t:${t}%;--tw:${tw(t)};--w:${w}%;--r:${(r + tilt(2)).toFixed(1)}deg;--d:${(d++ * .09).toFixed(2)}s" class="rv m`);
            items.splice(Math.min(2 + k * 2, items.length), 0, html); // weave mementos between photos on phones
        });
        const scrawl = pg.ch.scrawl && !pg.cont ? `<span class="scrawl" style="${flip ? "left" : "right"}:6%;bottom:4%;transform:rotate(${tilt(8).toFixed(1)}deg)">${esc(pg.ch.scrawl)} ${flip ? "↗" : "↖"}</span>` : "";
        return `<article class="spread"><div class="spread-page torn">
      <div class="chapter"><h2>${esc(pg.ch.title)}${pg.cont ? " (cont.)" : ""}${ULINES[pi % 2]}</h2>${(() => { const w = String(pg.ch.when || ""), c = w.length > 0 && w.length <= 6; return `<span class="when${c ? " circled" : ""}">${esc(w)}${c ? CIRCLE : ""}</span>`; })()}</div>
      <div class="collage free" style="--car:${car}">${items.join("")}</div>${scrawl}
    </div></article>`;
    }).join("");

    /* ---------- desktop: trim each scrapbook page to its contents ---------- */
    function fitCollages() {
        const desktop = innerWidth > 760 && CSS.supports("container-type", "inline-size");
        const cs = [...document.querySelectorAll(".collage.free")];
        if (!desktop) { cs.forEach(c => { c.style.height = ""; c.style.aspectRatio = ""; }); return; }
        const hs = cs.map(c => { let b = 0; for (const k of c.children) b = Math.max(b, k.offsetTop + k.offsetHeight); return b; });
        cs.forEach((c, i) => { c.style.aspectRatio = "auto"; c.style.height = Math.ceil(hs[i] + 34) + "px"; });
    }
    let fitT; const refit = () => { clearTimeout(fitT); fitT = setTimeout(fitCollages, 60); };
    fitCollages();
    onWidthChange(refit); addEventListener("load", refit);
    if (document.fonts) document.fonts.ready.then(refit);
    document.querySelectorAll(".collage img").forEach(im => im.complete || im.addEventListener("load", refit));
})();
