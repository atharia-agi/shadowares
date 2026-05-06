(function loadShadowCursorEngine() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = 'import "./src/engines/shadow-cursor-engine.js";';
    document.head.appendChild(script);
}());
