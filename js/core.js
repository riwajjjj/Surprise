/* core.js: shared helpers every other file uses: config, time zone, random layout, placeholder photos, washi tape, popping hearts, scroll lock.
   Loaded first; every file after it can use what's defined here. */

const C = window.CONFIG;
document.documentElement.classList.add("js");
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = n => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const between = (lo, hi) => lo + Math.random() * (hi - lo);

/* hearts (and petals) that pop out of something: the counter, the seal, the xoxo sticker, the bouquet */
const HEARTS = ["#8a1c2e", "#b0384e", "#e07a8f", "#ebc3cb", "#2f6f55"];
function popHearts(host, n, { x = 100, y = [70, 160], spin = 30, step = .05, size = [14, 28], colors = HEARTS, petal = () => false } = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
        const h = document.createElement("span"), isPetal = petal(i);
        h.className = "pop-heart" + (isPetal ? " petal" : ""); h.textContent = isPetal ? "" : "♥"; h.setAttribute("aria-hidden", "true");
        h.style.cssText = `--hx:${between(-x, x).toFixed(0)}px;--hy:${(-between(...y)).toFixed(0)}px;--hr:${between(-spin, spin).toFixed(0)}deg;--hd:${(i * step).toFixed(3)}s;--hc:${colors[i % colors.length]};font-size:${between(...size).toFixed(0)}px`;
        h.addEventListener("animationend", () => h.remove());
        host.appendChild(h);
    }
}
// test mode (for you, not her): add ?days=60 to the address to see the garden 60 days in, or ?night to see night mode now
const TEST = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
// open the site once with ?reset at the end of the address to wipe your test runs (opened letters, ticked boxes, player size…)
if (TEST.has("reset")) {
    try { ["opened", "someday", "torn", "deckMin", "bgMuted", "nightNote"].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
}
const onWidthChange = fn => { let w = innerWidth; addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; fn(); } }); };

/* ---------- time zone: every date on the site follows C.timeZone (e.g. Kathmandu), wherever it's opened ---------- */
const TZ = (() => { try { if (C.timeZone) { new Intl.DateTimeFormat("en-US", { timeZone: C.timeZone }); return C.timeZone; } } catch (e) {} return null; })();
const tzFmt = TZ && new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
function wallOf(ms) {                       // what the clock says in TZ at this moment
    if (!TZ) { const x = new Date(ms); return { y: x.getFullYear(), mo: x.getMonth(), d: x.getDate(), h: x.getHours(), mi: x.getMinutes(), s: x.getSeconds() }; }
    const p = {}; tzFmt.formatToParts(new Date(ms)).forEach(({ type, value }) => { p[type] = +value; });
    return { y: p.year, mo: p.month - 1, d: p.day, h: p.hour % 24, mi: p.minute, s: p.second };
}
function instantOf(y, mo, d, h = 0, mi = 0) {   // a clock time in TZ -> the real moment (ms)
    if (!TZ) return new Date(y, mo, d, h, mi).getTime();
    let t = Date.UTC(y, mo, d, h, mi);
    for (let k = 0; k < 2; k++) { const w = wallOf(t); t -= Date.UTC(w.y, w.mo, w.d, w.h, w.mi) - Date.UTC(y, mo, d, h, mi); }
    return t;
}
const dayNum = (y, mo, d) => Math.round(Date.UTC(y, mo, d) / 864e5);   // a calendar date as a plain number
let seed = 7;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const tilt = (max = 4) => (rnd() * 2 - 1) * max;

/* ---------- bake the SVG-filter paper textures into plain images, once ----------
   (phones re-run SVG filters whenever they repaint, which made scrolling stutter) */
(function bakeTextures() {
    const root = document.documentElement, cs = getComputedStyle(root);
    [["--fibres-src", "--fibres", 320], ["--crease-src", "--crease", 400]].forEach(([from, to, size]) => {
        const raw = cs.getPropertyValue(from).trim();
        const m = raw.match(/^url\((["']?)(.*)\1\)$/);
        if (!m) return;
        const fallback = () => root.style.setProperty(to, raw);
        const img = new Image();
        img.onload = () => {
            try {
                const px = Math.round(size * Math.min(3, Math.max(1, window.devicePixelRatio || 1)));   // sharp on high-res phone screens
                const c = document.createElement("canvas"); c.width = c.height = px;
                c.getContext("2d").drawImage(img, 0, 0, px, px);
                const done = url => root.style.setProperty(to, `url(${url})`);
                if (c.toBlob) c.toBlob(b => b ? done(URL.createObjectURL(b)) : fallback(), "image/png");
                else done(c.toDataURL("image/png"));
            } catch (e) { fallback(); }
        };
        img.onerror = fallback;
        img.src = m[2];
    });
})();

/* ---------- paper grain (generated once) ---------- */
(function grain() {
    const c = document.createElement("canvas"); c.width = c.height = 180;
    const x = c.getContext("2d"); const d = x.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) {
        const v = 120 + Math.random() * 100; d.data[i] = v; d.data[i + 1] = v * .92; d.data[i + 2] = v * .82;
        d.data[i + 3] = Math.random() < .5 ? Math.random() * 17 : 0;
    }
    x.putImageData(d, 0, 0);
    document.documentElement.style.setProperty("--grain", `url(${c.toDataURL()})`);
})();

/* ---------- placeholder film photos ---------- */
const moods = [
    ["#f6b26b", "#e06666", "#4c3a51"], ["#ffd9a0", "#c27c5c", "#3e4a3d"], ["#f4c7c3", "#b4837a", "#5b4b58"],
    ["#c8d8c0", "#e8c39e", "#55624f"], ["#fbe3b0", "#d98b6a", "#2f3a4a"], ["#e6b8a2", "#8e6f86", "#2d2a38"]
];
function placeholder(i, ar = "4/5", mono = false, label = "") {
    const [w, h] = ar.split("/").map(Number); const W = 420, H = Math.round(W * h / w);
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const m = moods[i % moods.length];
    const g = x.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, m[0]); g.addColorStop(.55, m[1]); g.addColorStop(1, m[2]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let k = 0; k < 6; k++) {
        const cx = rnd() * W, cy = rnd() * H, r = 80 + rnd() * 260; const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, m[k % 3] + "aa"); rg.addColorStop(1, m[k % 3] + "00"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    }
    const lk = x.createRadialGradient(0, H * .2, 0, 0, H * .2, W * .7); lk.addColorStop(0, "rgba(255,170,90,.55)"); lk.addColorStop(1, "rgba(255,170,90,0)");
    x.fillStyle = lk; x.fillRect(0, 0, W, H);
    const id = x.getImageData(0, 0, W, H);
    for (let p = 0; p < id.data.length; p += 4) {
        const n = (Math.random() - .5) * 26; id.data[p] += n; id.data[p + 1] += n; id.data[p + 2] += n;
        if (mono) { const l = id.data[p] * .3 + id.data[p + 1] * .59 + id.data[p + 2] * .11; id.data[p] = id.data[p + 1] = id.data[p + 2] = l; }
    }
    x.putImageData(id, 0, 0);
    x.fillStyle = "rgba(255,248,238,.85)"; x.font = `${Math.round(W / 14)}px Caveat, cursive`; x.textAlign = "center";
    x.fillText("your photo here", W / 2, H / 2 - (label ? W / 40 : 0));
    if (label) {   // which line in config.js controls this photo
        x.font = `${Math.round(W / 26)}px "Courier Prime", "Courier New", monospace`; x.fillStyle = "rgba(255,248,238,.78)";
        x.fillText("config.js → " + label, W / 2, H / 2 + W / 18);
    }
    return c.toDataURL("image/jpeg", .86);
}
let phIndex = 0;
const src = (s, ar, mono, label) => s ? esc(s) : placeholder(phIndex++, ar, mono, label);
const photo = (s, ar, stamp, cap, label) =>
    `<span class="ph" data-cap="${esc(cap)}" data-stamp="${esc(stamp)}"><img alt="${esc(cap || "a photo of us")}"${label === "cover" ? "" : " loading=\"lazy\""} decoding="async" src="${src(s, ar, false, label)}">${stamp ? `<span class="date-stamp">${esc(stamp)}</span>` : ""}</span>`;

const TULIP = `<svg class="tulip-g" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5.5 9.3 8 12 4.5 14.7 8 17.5 5.5C17.5 11 15.5 14 12 14S6.5 11 6.5 5.5Z"/><path class="tg-stem" d="M12 14v6.5"/><path d="M12 19.2c-2.6-.2-4.2-1.7-4.8-3.8 2.4.2 4 1.5 4.8 3.8z"/></svg>`;
const washes = ["var(--rose)", "var(--sage)", "var(--butter)", "var(--sky)", "rgba(138,28,46,.55)"];
const tapeKinds = ["", "dots", "grid"];
function washi(pos = "top") {
    const w = washes[Math.floor(rnd() * washes.length)], k = tapeKinds[Math.floor(rnd() * 3)];
    const r = tilt(14);
    const place = pos === "corner"
        ? `top:-10px;left:-24px;transform:rotate(${-38 + r / 3}deg)`
        : `top:-13px;left:calc(50% - 48px);transform:rotate(${r}deg)`;
    return `<span class="washi ${k}" style="--wash:${w};${place}"></span>`;
}

/* ---------- always start at the top, no scrolling until the book is open ---------- */
try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
const toTop = () => { try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); } };   // older Safari doesn't know "instant"
toTop();
window.addEventListener("pageshow", toTop);
document.documentElement.classList.add("locked");
let rollCounter = () => {}, startLife = () => {}, showNightNote = () => {};
const unlockScroll = () => { toTop(); document.documentElement.classList.remove("locked"); setTimeout(() => { rollCounter(); startLife(); showNightNote(); }, 350); };

/* ---------- ruled letter paper: line the rules up under the handwriting ---------- */
function ruleLetter(paper) {
    const b = paper && paper.querySelector(".body"); if (!b) return;
    paper.style.setProperty("--rule", (b.offsetTop % 38) + "px");
}
const ruleAll = () => document.querySelectorAll(".letter-paper").forEach(ruleLetter);