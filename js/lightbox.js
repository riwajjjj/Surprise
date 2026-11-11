/* lightbox.js: tap any photo to see it big */

(() => {
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
})();
