/* music.js: music: soft generated background music, and the mixtape player for her songs */

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
const TRACKS = (Array.isArray(C.playlist) ? C.playlist : []).filter(t => t && t.src);
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
