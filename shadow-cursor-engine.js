(function loadShadowCursorEngine() {
    if (window.shadowCursor) return;
    const script = document.createElement("script");
    script.src = "/dist/shadow-toolkit.umd.js";
    script.defer = true;
    document.head.appendChild(script);
}());
