/* someday.js: the someday notebook: tick things off together */

(() => {
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
})();
