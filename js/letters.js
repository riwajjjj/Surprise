/* letters.js: open-when envelopes: the flap lifts and the letter slides out */

const openLetter = (() => {
    /* ---------- envelopes: the flap lifts and the letter slides out ---------- */
    const box = $("#letterBox"), stage = $("#stage");
    let opened = {}; try { opened = JSON.parse(localStorage.getItem("opened") || "{}"); } catch (e) {}
    const envColors = ["#e8d3b2", "#dfc6a5", "#ebc3cb"];
    $("#envelopes").innerHTML = C.letters.map((l, i) =>
        `<button class="env rv${opened[i] ? " read" : ""}" data-i="${i}" style="--r:${tilt(3).toFixed(1)}deg" aria-label="Open when ${esc(l.when)}">
    <span class="peek"></span><span class="wax">${TULIP}</span>
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

    return openLetter;
})();