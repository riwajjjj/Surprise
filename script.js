(() => {
    const C = window.CONFIG;
    document.documentElement.classList.add("js");
    const $ = s => document.querySelector(s);
    const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const pad = n => String(n).padStart(2, "0");
    // test mode (for you, not her): add ?days=60 to the address to see the garden 60 days in, or ?night to see night mode now
    const TEST = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
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
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    toTop();
    window.addEventListener("pageshow", toTop);
    document.documentElement.classList.add("locked");
    let rollCounter = () => {}, startLife = () => {}, showNightNote = () => {};
    const unlockScroll = () => { toTop(); document.documentElement.classList.remove("locked"); setTimeout(() => { rollCounter(); startLife(); showNightNote(); }, 350); };

    /* ---------- soothing background music (generated live, no file needed) ----------
       soft pad chords + a slow music-box melody. fades out while any song / voice memo plays. */
    const bg = (() => {
        const btn = $("#musicBtn");
        const VOL = Math.max(0, Math.min(1, C.bgVolume ?? .5));
        const CL = 9;                                                     // seconds per chord
        const CHORDS = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]; // Cmaj7, Am7, Fmaj7, G
        const SCALE = [72, 74, 76, 79, 81, 84, 86];                       // C major pentatonic, music-box range
        const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
        const pick = a => a[Math.floor(Math.random() * a.length)];
        const playing = new Set();
        let ctx, master, padBus, bellBus, started = false, revealed = false, firstFade = true, suspendT;
        let nextChord = 0, ci = 0, nextNote = 0, mi = 2;
        let muted = false; try { muted = localStorage.getItem("bgMuted") === "1"; } catch (e) {}

        function build() {
            master = ctx.createGain(); master.gain.value = 0;
            const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
            const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 2600;
            const len = Math.floor(ctx.sampleRate * 4.5), ir = ctx.createBuffer(2, len, ctx.sampleRate);
            for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
            const verb = ctx.createConvolver(); verb.buffer = ir;
            const dry = ctx.createGain(); dry.gain.value = .55;
            const wet = ctx.createGain(); wet.gain.value = .75;
            padBus = ctx.createBiquadFilter(); padBus.type = "lowpass"; padBus.frequency.value = 900; padBus.Q.value = .3;
            bellBus = ctx.createGain(); bellBus.gain.value = 1;
            padBus.connect(tone); bellBus.connect(tone);
            tone.connect(dry); tone.connect(verb); verb.connect(wet);
            dry.connect(comp); wet.connect(comp); comp.connect(master); master.connect(ctx.destination);
        }
        function pad(m, t, dur) {
            [-7, 7].forEach(det => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "triangle"; o.frequency.value = mtof(m); o.detune.value = det;
                g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.024, t + 3);
                g.gain.setValueAtTime(.024, t + dur - .5); g.gain.linearRampToValueAtTime(0, t + dur + 3);
                o.connect(g); g.connect(padBus); o.start(t); o.stop(t + dur + 3.1);
            });
        }
        function bass(m, t, dur) {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = "sine"; o.frequency.value = mtof(m);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + 2);
            g.gain.setValueAtTime(.07, t + dur - .5); g.gain.linearRampToValueAtTime(0, t + dur + 2.5);
            o.connect(g); g.connect(padBus); o.start(t); o.stop(t + dur + 2.6);
        }
        function bell(m, t, v) {
            const out = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
            if (out.pan) out.pan.value = (Math.random() * 2 - 1) * .5;
            out.connect(bellBus);
            [[1, v, 3.4], [2, v * .22, 1.2], [3.01, v * .06, .6]].forEach(([h, a, d]) => {      // a little music-box timbre
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "sine"; o.frequency.value = mtof(m) * h;
                g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
                o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .05);
            });
        }
        function schedule() {
            const ahead = ctx.currentTime + 1.5;
            while (nextChord < ahead) {
                const ch = CHORDS[ci % CHORDS.length];
                ch.forEach(m => pad(m, nextChord, CL)); bass(ch[0] - 12, nextChord, CL);
                ci++; nextChord += CL;
            }
            while (nextNote < ahead) {
                if (Math.random() < .62) {
                    mi = Math.max(0, Math.min(SCALE.length - 1, mi + pick([-2, -1, -1, 1, 1, 2])));
                    bell(SCALE[mi], nextNote, .045 + Math.random() * .03);
                    if (Math.random() < .18) bell(SCALE[Math.max(0, mi - 2)], nextNote + .03, .03);
                }
                nextNote += pick([.75, 1.5, 1.5, 2.25]);
            }
        }
        function state() { return muted ? "off" : playing.size ? "paused" : "on"; }
        function paintBtn() {
            const st = state();
            btn.dataset.state = st;
            btn.querySelector(".mb-txt").textContent = st === "off" ? "music off" : st === "paused" ? "music paused" : "music on";
            btn.setAttribute("aria-pressed", String(!muted));
        }
        function apply() {
            paintBtn();
            if (!started) return;
            const on = !muted && !playing.size && !document.hidden, t = ctx.currentTime;
            clearTimeout(suspendT);
            master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
            if (on) {
                if (ctx.state !== "running") ctx.resume().catch(() => {});
                master.gain.linearRampToValueAtTime(VOL * 2.4, t + (firstFade ? 5 : 1.8)); firstFade = false;
            } else {
                master.gain.linearRampToValueAtTime(0, t + .8);
                suspendT = setTimeout(() => { if (muted || playing.size || document.hidden) ctx.suspend().catch(() => {}); }, 1000);
            }
        }
        function start() {                                     // must be called from a tap / key press
            if (started || C.bgMusic === false) return;
            const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
            try { ctx = new AC(); } catch (e) { return; }
            build(); started = true;
            nextChord = ctx.currentTime + .1; nextNote = ctx.currentTime + 2.5;
            schedule(); setInterval(schedule, 250);
            apply();
        }
        function reveal() { if (!started || revealed) return; revealed = true; btn.hidden = false; paintBtn(); }
        function hold(el, isPlaying) { isPlaying ? playing.add(el) : playing.delete(el); apply(); }
        btn.addEventListener("click", () => {
            muted = !muted; try { localStorage.setItem("bgMuted", muted ? "1" : "0"); } catch (e) {}
            if (!started) { start(); reveal(); } else apply();
        });
        document.addEventListener("visibilitychange", apply);
        return { start, reveal, hold, get ctx() { return ctx; }, get master() { return master; } };
    })();

    /* ---------- the mixtape: her songs on a little walkman bar ---------- */
    const TRACKS = (Array.isArray(C.playlist) && C.playlist.length ? C.playlist
        : (C.song && C.song.src ? [{ src: C.song.src, title: C.song.title }] : [])).filter(t => t && t.src);
    const mix = (() => {
        if (!TRACKS.length) return null;
        const deck = $("#deck"), hero = $("#songTape");
        const titleEl = deck.querySelector(".deck-title"), artistEl = deck.querySelector(".deck-artist");
        const playBtn = deck.querySelector(".dk.play"), seek = deck.querySelector(".deck-seek");
        const curEl = deck.querySelector(".t-cur"), durEl = deck.querySelector(".t-dur"), minBtn = deck.querySelector(".deck-min");
        const VOL = Math.max(0, Math.min(1, C.musicVolume ?? .8));
        const a = new Audio(); a.preload = "metadata";
        let i = 0, fails = 0, held = false, dragging = false, fadeT, skipT, dir = 1;
        const others = new Set();
        const fmt = t => isFinite(t) ? `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}` : "0:00";
        const name = t => t.title || String(t.src).split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

        function label() {
            const t = TRACKS[i];
            titleEl.textContent = name(t);
            artistEl.textContent = [t.artist, TRACKS.length > 1 ? `${i + 1} / ${TRACKS.length}` : ""].filter(Boolean).join("  ·  ");
            deck.style.setProperty("--p", 0); seek.value = 0; seek.style.setProperty("--pp", "0%");
            curEl.textContent = "0:00"; durEl.textContent = "0:00"; lastSec = -1;
            if ("mediaSession" in navigator && window.MediaMetadata) {
                try { navigator.mediaSession.metadata = new MediaMetadata({ title: name(t), artist: t.artist || "", album: C.mixtapeTitle || "a mixtape" }); } catch (e) {}
            }
        }
        function load(n, andPlay) {
            clearTimeout(skipT);                                    // a newer choice cancels any pending skip
            dir = n < i && !(i === TRACKS.length - 1 && n === TRACKS.length) ? -1 : 1;
            i = (n + TRACKS.length) % TRACKS.length;
            a.src = TRACKS[i].src; label();
            if (andPlay) play();
        }
        function play(fade) {
            held = false;
            others.forEach(o => o.pause());
            if (!a.src) load(i);
            clearInterval(fadeT);
            if (fade) {
                a.volume = 0; let v = 0;
                fadeT = setInterval(() => { v = Math.min(VOL, v + VOL / 30); a.volume = v; if (v >= VOL) clearInterval(fadeT); }, 100);
            } else a.volume = VOL;
            const p = a.play(); if (p) p.catch(() => paint());
        }
        function pause() { held = false; a.pause(); }
        const toggle = () => a.paused ? play() : pause();
        function paint() {
            const on = !a.paused;
            deck.classList.toggle("playing", on); hero.classList.toggle("playing", on);
            playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
            hero.setAttribute("aria-label", on ? "Pause the mixtape" : "Play the mixtape");
            if ("mediaSession" in navigator) try { navigator.mediaSession.playbackState = on ? "playing" : "paused"; } catch (e) {}
        }
        let lastSec = -1;
        function progress(force) {
            const sec = Math.floor(a.currentTime);
            if (force !== true && sec === lastSec) return;
            lastSec = sec;
            const d = a.duration, p = d ? a.currentTime / d : 0;
            deck.style.setProperty("--p", p.toFixed(3));
            if (!dragging) { seek.value = Math.round(p * 1000); seek.style.setProperty("--pp", (p * 100).toFixed(1) + "%"); }
            curEl.textContent = fmt(a.currentTime); durEl.textContent = fmt(d);
        }
        ["play", "pause", "playing"].forEach(ev => a.addEventListener(ev, paint));
        a.addEventListener("playing", () => { fails = 0; });
        a.addEventListener("timeupdate", progress);
        a.addEventListener("loadedmetadata", () => progress(true));
        a.addEventListener("seeked", () => progress(true));
        a.addEventListener("ended", () => load(i + 1, true));
        a.addEventListener("error", () => {
            if (!a.src) return;
            fails++; artistEl.textContent = "couldn't find this song file";
            if (fails < TRACKS.length) skipT = setTimeout(() => load(i + dir, true), 1400); else paint();
        });

        playBtn.addEventListener("click", toggle);
        hero.addEventListener("click", toggle);
        deck.querySelector(".dk.next").addEventListener("click", () => load(i + 1, true));
        deck.querySelector(".dk.prev").addEventListener("click", () => { if (a.currentTime > 3) a.currentTime = 0; else load(i - 1, true); });
        seek.addEventListener("input", () => { dragging = true; seek.style.setProperty("--pp", seek.value / 10 + "%"); curEl.textContent = fmt(seek.value / 1000 * (a.duration || 0)); });
        seek.addEventListener("change", () => { if (a.duration) a.currentTime = seek.value / 1000 * a.duration; dragging = false; });
        let small = false; try { small = localStorage.getItem("deckMin") === "1"; } catch (e) {}
        const setSmall = v => {
            small = v; deck.classList.toggle("min", v);
            minBtn.textContent = v ? "+" : "–"; minBtn.setAttribute("aria-label", v ? "Show the full player" : "Make the player smaller");
            document.documentElement.classList.toggle("deck-small", v);
            try { localStorage.setItem("deckMin", v ? "1" : "0"); } catch (e) {}
        };
        minBtn.addEventListener("click", () => setSmall(!small));
        if ("mediaSession" in navigator) {
            const h = (k, f) => { try { navigator.mediaSession.setActionHandler(k, f); } catch (e) {} };
            h("play", () => play()); h("pause", pause); h("nexttrack", () => load(i + 1, true)); h("previoustrack", () => load(i - 1, true));
        }

        hero.querySelector("#songTitle").textContent = C.mixtapeTitle || (TRACKS.length > 1 ? "a mixtape for you" : name(TRACKS[0]));
        load(0, false);
        return {
            start() { if (C.autoplayMusic !== false) play(true); },          // called from her tap on the cover
            reveal() { setSmall(small); deck.hidden = false; document.documentElement.classList.add("has-deck"); requestAnimationFrame(() => deck.classList.add("in")); },
            // another sound (the voice memo) is playing: step aside, then come back
            duck(on, el) {
                if (el) others.add(el);
                if (on) { if (!a.paused) { a.pause(); held = true; } }
                else if (held) play();
            }
        };
    })();

    /* ---------- lock, then the book cover (she opens it herself) ---------- */
    const lock = $("#lock"), cover = $("#cover");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          <svg class="cover-heart cover-tulip" viewBox="0 0 24 24" aria-hidden="true"><path class="ct-stem" d="M12 13.5v8"/><path class="ct-leaf" d="M12 20.4c-2.9-.2-4.7-1.9-5.3-4.3 2.7.2 4.5 1.7 5.3 4.3z"/><path class="ct-head" d="M6.2 5 9.2 7.8 12 4 14.8 7.8 17.8 5C17.8 11 15.6 14.3 12 14.3S6.2 11 6.2 5Z"/></svg>
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
        const sm = String(C.since || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        const city = esc(String(C.postmarkCity || "KATHMANDU").toUpperCase());
        $("#postmark").innerHTML = `<span class="postage lock-stamp"><i>${TULIP}</i></span>
          <svg class="pm" viewBox="0 0 170 120" aria-hidden="true">
            <defs><path id="pmTop" d="M24 60a36 36 0 0 1 72 0"/><path id="pmBot" d="M20 60a40 40 0 0 0 80 0"/></defs>
            <g fill="none" stroke="currentColor"><circle cx="60" cy="60" r="44" stroke-width="2.2"/><circle cx="60" cy="60" r="31" stroke-width="1.2"/>
              <path d="M104 44c10-6 20 6 30 0s20-6 30 0M106 60c10-6 20 6 30 0s20-6 30 0M104 76c10-6 20 6 30 0s20-6 30 0" stroke-width="2.2" stroke-linecap="round"/></g>
            <text font-size="10.5" letter-spacing="1.6" fill="currentColor"><textPath href="#pmTop" startOffset="50%" text-anchor="middle">${city}</textPath></text>
            <text font-size="9" letter-spacing="2" fill="currentColor"><textPath href="#pmBot" startOffset="50%" text-anchor="middle">♡ US ♡</textPath></text>
            ${sm ? `<text x="60" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${pad(sm[1])} ${MON[+sm[2] - 1] || ""}</text>
                    <text x="60" y="72" text-anchor="middle" font-size="11" letter-spacing="1" fill="currentColor">${sm[3]}</text>` : ""}
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
        $("#hintLbl").textContent = C.passwordHint || "";

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
            const cols = ["#8a1c2e", "#b0384e", "#e07a8f", "#ebc3cb", "#2f6f55"];
            for (let i = 0; i < 26; i++) {
                const h = document.createElement("span"), petal = i % 3 === 0;
                h.className = "pop-heart" + (petal ? " petal" : ""); h.textContent = petal ? "" : "♥";
                h.style.cssText = `--hx:${(Math.random() * 260 - 130).toFixed(0)}px;--hy:${(-60 - Math.random() * 160).toFixed(0)}px;--hr:${(Math.random() * 120 - 60).toFixed(0)}deg;--hd:${(i * .025).toFixed(3)}s;--hc:${cols[i % cols.length]};font-size:${(14 + Math.random() * 16).toFixed(0)}px`;
                box.appendChild(h);
            }
            lock.appendChild(box);
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

    /* ---------- hero ---------- */
    const fonts = ["'Abril Fatface',serif", "'Archivo Black',sans-serif", "'Special Elite',monospace", "'DM Serif Display',serif", "'Instrument Serif',serif", "'Courier Prime',monospace"]; // single quotes: these go inside a style="..." attribute
    const swatches = [["#fbf8f2", "#2b221e"], ["#8a1c2e", "#fbe9ea"], ["#2b221e", "#f3ece1"], ["#ebc3cb", "#7e0f1f"], ["#f6e7a8", "#2b221e"], ["#2f6f55", "#f3efe6"], ["#c9d8e4", "#2b221e"]];
    let ci2 = 0;
    $("#ransom").innerHTML = C.title.split(" ").map(word => `<span class="word">${[...word].map(ch => { const i = ci2++;
        const [bg, fg] = swatches[(i * 3 + 1) % swatches.length];
        const f = fonts[(i * 5 + 2) % fonts.length];
        const italic = i % 4 === 1 ? "font-style:italic;" : "";
        return `<span class="ch" aria-hidden="true" style="background:${bg};color:${fg};font-family:${f};${italic}--r:${tilt(7).toFixed(1)}deg;--y:${tilt(6).toFixed(0)}px">${esc(ch)}</span>`;
    }).join("")}</span>`).join(`<span class="sp"></span>`);
    $("#byline").innerHTML = `for ${esc(C.to)}, from ${esc(C.from)}<svg class="doodle d-tulip" viewBox="0 0 40 50" aria-hidden="true"><path d="M20 47V27"/><path d="M20 27c-7 0-10-6-10-15l5 4 5-7 5 7 5-4c0 9-3 15-10 15z"/><path d="M20 41c-4-1-7-4-8-9 4 0 7 3 8 9z"/></svg>`;
    const sinceN = C.since.replace(/\D/g, "");
    $("#ticket").innerHTML = `<div class="main"><span>admit two · friends since ${esc(C.friendsSince || "")}</span><b>US, OFFICIALLY</b><span>since ${esc(C.since)}</span></div>
  <div class="stub"><span>no.</span><b>${esc(sinceN.slice(0, 6))}</b><span>row ♡</span></div>`;
    /* ---------- live "together for" counter ---------- */
    (function counter() {
        const el = $("#counter");
        const m = String(C.since || "").match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        if (C.counter === false || !m) { el.hidden = true; return; }
        const [hh, mm] = String(C.sinceTime || "").split(":").map(Number);
        const S = { y: +m[3], mo: +m[2] - 1, d: +m[1], h: hh || 0, mi: mm || 0 };
        const start = instantOf(S.y, S.mo, S.d, S.h, S.mi);
        const at = n => instantOf(S.y, S.mo, S.d + n, S.h, S.mi);          // the moment of day-anniversary n
        const startDay = dayNum(S.y, S.mo, S.d);
        const monthDay = n => {                                             // calendar date of month-anniversary n
            const f = new Date(Date.UTC(S.y, S.mo + n, 1)), y = f.getUTCFullYear(), mo = f.getUTCMonth();
            return dayNum(y, mo, Math.min(S.d, new Date(Date.UTC(y, mo + 1, 0)).getUTCDate()));
        };
        const DAY_MARKS = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000];
        const monthName = n => n % 12 === 0 ? (n === 12 ? "1 year" : `${n / 12} years`) : n === 6 ? "half a year" : n === 1 ? "1 month" : `${n} months`;
        function milestone(now) {
            const w = wallOf(now), t = dayNum(w.y, w.mo, w.d), c = [];
            let n = 1; while (monthDay(n) < t) n++;
            c.push([monthDay(n), `${monthName(n)} of us`, true]);
            const dm = DAY_MARKS.find(k => startDay + k >= t);
            if (dm) c.push([startDay + dm, `${dm} days of us`, true]);
            (C.specialDays || []).forEach(s => {                         // your own yearly days (config.js → specialDays)
                const m = String(s && s.date || "").match(/(\d{1,2})\D+(\d{1,2})/); if (!m || !s.label) return;
                let d = dayNum(w.y, +m[2] - 1, +m[1]); if (d < t) d = dayNum(w.y + 1, +m[2] - 1, +m[1]);
                c.push([d, s.label, false]);
            });
            c.sort((a, b) => a[0] - b[0]);
            return { label: c[0][1], inDays: c[0][0] - t, ours: c[0][2] };
        }

        el.innerHTML = `<div class="odo"><svg class="doodle spark sp1" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 6 3 8 10 10-7 2-9 4-10 10-1-6-3-8-10-10 7-2 9-4 10-10z"/></svg><svg class="doodle spark sp2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 6 3 8 10 10-7 2-9 4-10 10-1-6-3-8-10-10 7-2 9-4 10-10z"/></svg><span class="odo-lbl">together for</span><span class="odo-digits" aria-hidden="true"></span><span class="odo-unit hand">days</span><span class="odo-time" aria-hidden="true"></span></div><p class="hand odo-next"></p>`;
        const digitsEl = el.querySelector(".odo-digits"), timeEl = el.querySelector(".odo-time"), nextEl = el.querySelector(".odo-next");
        let wheels = [], rolled = false, shownDays = -1, shownDate = "", special = false;
        const odoEl = el.querySelector(".odo");
        odoEl.title = "tap me ♡";
        // little hearts that float up out of the counter
        const heartColors = ["#8a1c2e", "#b0384e", "#e07a8f", "#ebc3cb", "#2f6f55"];
        function hearts(count) {
            if (reduceMotion) return;
            for (let i = 0; i < count; i++) {
                const h = document.createElement("span");
                h.className = "pop-heart"; h.textContent = "♥"; h.setAttribute("aria-hidden", "true");
                h.style.cssText = `--hx:${(Math.random() * 200 - 100).toFixed(0)}px;--hy:${(-70 - Math.random() * 90).toFixed(0)}px;--hr:${(Math.random() * 60 - 30).toFixed(0)}deg;--hd:${(i * .05).toFixed(2)}s;--hc:${heartColors[i % heartColors.length]};font-size:${(14 + Math.random() * 14).toFixed(0)}px`;
                h.addEventListener("animationend", () => h.remove());
                odoEl.appendChild(h);
            }
        }
        odoEl.addEventListener("click", () => hearts(10));
        const digits = n => String(n).padStart(3, "0");
        function build(len) {
            digitsEl.innerHTML = Array.from({ length: len }, (_, i) =>
                `<span class="wheel"><span class="strip" style="--dl:${(i * .18).toFixed(2)}s">${[...Array(10).keys()].map(k => `<span>${k}</span>`).join("")}</span></span>`).join("");
            wheels = [...digitsEl.querySelectorAll(".strip")];
            void digitsEl.offsetWidth;
        }
        function show(days) {
            const s = digits(days);
            if (wheels.length !== s.length) build(s.length);
            wheels.forEach((w, i) => w.style.setProperty("--d", s[i]));
        }
        function tick() {
            if (document.hidden) return;
            const now = Date.now();
            if (now < start) { el.hidden = true; return; }
            el.hidden = false;
            let days = Math.floor((now - start) / 864e5);           // first guess, then fix for clock changes
            while (days > 0 && at(days) > now) days--;
            while (at(days + 1) <= now) days++;
            const r = Math.floor((now - at(days)) / 1000);
            timeEl.textContent = `+ ${pad(Math.floor(r / 3600))}h ${pad(Math.floor(r % 3600 / 60))}m ${pad(r % 60)}s`;
            if (days !== shownDays) {
                if (!wheels.length) build(digits(days).length);
                shownDays = days;
                el.setAttribute("aria-label", `together for ${days} days`);
                if (rolled) show(days);
            }
            const w = wallOf(now), today = `${w.y}-${w.mo}-${w.d}`;
            if (today !== shownDate) {
                shownDate = today;
                const ms = milestone(now);
                special = ms.inDays === 0;
                nextEl.classList.toggle("today", special);
                odoEl.classList.toggle("special", special);
                nextEl.textContent = special ? (ms.ours ? `happy ${ms.label} ♡` : `today: ${ms.label} ♡`)
                    : ms.inDays === 1 ? `${ms.label} is tomorrow ♡`
                        : `next: ${ms.label} ♡ (${ms.inDays} sleeps)`;
            }
        }
        tick();
        setInterval(tick, 1000);
        document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
        rollCounter = () => {
            if (rolled) return; rolled = true; if (shownDays >= 0) show(shownDays);
            if (special) { setTimeout(() => hearts(24), 1700); setTimeout(() => hearts(16), 3200); }   // a milestone today: celebrate
        };
    })();

    $("#booth").innerHTML = (C.booth || []).map((s, i) => `<span class="ph"><img alt="photo booth" decoding="async" src="${src(s, "4/3.3", true, `booth ${i + 1}`)}"></span>`).join("");
    if (C.cover) $("#heroPol").innerHTML = `<button class="polaroid" style="--r:6deg;--ar:4/5">${washi()}${photo(C.cover.src, "4/5", C.cover.stamp, C.cover.caption, "cover")}<span class="cap">${esc(C.cover.caption)}</span></button>`;

    /* ---------- cassettes ---------- */
    function cassette(btn, file) {
        if (!file) { btn.title = "add an audio file in config.js"; return null; }
        const a = new Audio(); a.preload = "metadata"; a.src = file; a.loop = btn.id === "songTape";
        btn.addEventListener("click", () => a.paused ? a.play().catch(() => {}) : a.pause());
        a.addEventListener("play", () => { btn.classList.add("playing"); bg.hold(a, true); if (mix) mix.duck(true, a); });
        a.addEventListener("pause", () => { btn.classList.remove("playing"); bg.hold(a, false); if (mix) mix.duck(false, a); });
        a.addEventListener("ended", () => { btn.classList.remove("playing"); bg.hold(a, false); if (mix) mix.duck(false, a); });
        return a;
    }
    if (!mix) {   // no songs added yet: the cassette just spins for fun
        $("#songTitle").textContent = (C.song && C.song.title) || C.mixtapeTitle || "our song";
        $("#songTape").addEventListener("click", e => e.currentTarget.classList.toggle("playing"));
    }
    if (C.finalLetter.voice) { $("#voiceTape").hidden = false; cassette($("#voiceTape"), C.finalLetter.voice); }

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

    /* ---------- optional sections: hide what has no photos ---------- */
    const hasAny = a => (a || []).length > 0;
    if (!hasAny(C.filmRoll)) $("#roll").hidden = true;
    if (!hasAny(C.booth)) $("#booth").hidden = true;
    if (!C.cover) $("#heroPol").hidden = true;

    /* ---------- film roll ---------- */
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

    /* ---------- lightbox ---------- */
    const lb = $("#lightbox");
    document.addEventListener("click", e => {
        const ph = e.target.closest(".ph"); if (!ph || ph.closest("#lightbox") || ph.closest(".booth")) return;
        $("#lbImg").src = ph.querySelector("img").src;
        $("#lbStamp").textContent = ph.dataset.stamp || "";
        $("#lbCap").textContent = ph.dataset.cap || "";
        lb.showModal();
    });
    $("#lbClose").onclick = () => lb.close();
    lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });

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

    /* ---------- envelopes: the flap lifts and the letter slides out ---------- */
    const box = $("#letterBox"), stage = $("#stage");
    let opened = {}; try { opened = JSON.parse(localStorage.getItem("opened") || "{}"); } catch (e) {}
    const stamps = ["♡", "✿", "☾", "✦", "♡", "❀"];
    const envColors = ["#e8d3b2", "#dfc6a5", "#ebc3cb"];
    $("#envelopes").innerHTML = C.letters.map((l, i) =>
        `<button class="env rv${opened[i] ? " read" : ""}" data-i="${i}" style="--r:${tilt(3).toFixed(1)}deg" aria-label="Open when ${esc(l.when)}">
    <span class="postage"><i>${stamps[i % stamps.length]}</i></span><span class="wax">${TULIP}</span>
    <span class="to"><small>open when</small>${esc(l.when)}</span></button>`).join("");
    let timers = [];
    function openLetter(toLine, body, sig, color) {
        timers.forEach(clearTimeout); timers = [];
        stage.className = "stage";
        stage.style.setProperty("--ec", color);
        stage.innerHTML = `<div class="env-back"></div>
    <div class="letter-paper"><button class="letter-close type" id="lc">close ×</button><p class="to">${esc(toLine)}</p><p class="body">${esc(body)}</p><p class="sig">${esc(sig)}</p></div>
    <div class="env-front"></div><div class="env-flap"><span class="wax">${TULIP}</span></div>`;
        stage.scrollTop = 0; stage.scrollLeft = 0;
        box.showModal(); $("#lc").onclick = () => box.close();
        // opening the dialog focuses the close button while it's still tucked inside the envelope;
        // don't let the browser scroll the envelope out of place to show it
        $("#lc").focus({ preventScroll: true });
        stage.scrollTop = 0; stage.scrollLeft = 0;
        ruleLetter(stage.querySelector(".letter-paper"));
        const steps = [["s1", 450], ["s2", 1150], ["s3", 2000]];
        steps.forEach(([cls, t]) => timers.push(setTimeout(() => stage.classList.add(cls), t)));
        // once the letter is out, take the envelope away completely so it can never stay stuck on top of the letter
        const finish = () => {
            timers.forEach(clearTimeout); timers = [];
            stage.classList.add("s1", "s2", "s3");
            stage.querySelectorAll(".env-back,.env-front,.env-flap").forEach(e => e.remove());
        };
        timers.push(setTimeout(finish, 3100));
        // tapping the envelope skips straight to the letter
        stage.onclick = e => { if (!e.target.closest(".letter-paper")) finish(); };
    }
    document.querySelectorAll("#envelopes .env").forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.i, l = C.letters[i];
        openLetter(`open when ${l.when} —`, l.body, `${C.from} ♡`, envColors[i % 3]);
        opened[i] = 1; b.classList.add("read"); try { localStorage.setItem("opened", JSON.stringify(opened)); } catch (e) {}
    }));
    box.addEventListener("click", e => { if (e.target === box) box.close(); });
    stage.addEventListener("scroll", () => { if (stage.scrollTop || stage.scrollLeft) { stage.scrollTop = 0; stage.scrollLeft = 0; } });

    /* ---------- someday list ---------- */
    let done = {}; try { done = JSON.parse(localStorage.getItem("someday") || "{}"); } catch (e) {}
    const list = $("#list");
    list.innerHTML = C.someday.map((t, i) => `<li class="${done[i] ? "done" : ""}" data-i="${i}" role="checkbox" aria-checked="${!!done[i]}" tabindex="0"><span class="box"></span><span class="t">${esc(t)}</span></li>`).join("");
    list.querySelectorAll("li").forEach(li => {
        const flip = () => { const i = li.dataset.i; done[i] = !done[i]; li.classList.toggle("done", done[i]); li.setAttribute("aria-checked", done[i]); try { localStorage.setItem("someday", JSON.stringify(done)); } catch (e) {} };
        li.addEventListener("click", flip);
        li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    });

    /* ---------- paper-clipped polaroid on the notebook ---------- */
    if (C.somedayPhoto) $("#clipPol").innerHTML = `<span class="paperclip"></span><button class="polaroid" style="--r:7deg;--ar:1/1">${photo(C.somedayPhoto.src, "1/1", C.somedayPhoto.stamp || "", C.somedayPhoto.caption, "somedayPhoto")}<span class="cap">${esc(C.somedayPhoto.caption)}</span></button>`;
    else $("#clipPol").hidden = true;

    /* ---------- heart cursor (mouse only) ---------- */
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) document.documentElement.classList.add("heart-cursor");

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

    /* ---------- ruled letter paper: line the rules up under the handwriting ---------- */
    function ruleLetter(paper) {
        const b = paper && paper.querySelector(".body"); if (!b) return;
        paper.style.setProperty("--rule", (b.offsetTop % 38) + "px");
    }
    const ruleAll = () => document.querySelectorAll(".letter-paper").forEach(ruleLetter);
    ruleAll(); onWidthChange(ruleAll);
    if (document.fonts) document.fonts.ready.then(ruleAll);

    /* ---------- our little garden: one tulip grows a little every week, a new one is planted every 3 months ---------- */
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

    /* ---------- gentle reveal (only for things below the fold) ---------- */
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
        document.querySelectorAll(".rv").forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); } });
    }
})();