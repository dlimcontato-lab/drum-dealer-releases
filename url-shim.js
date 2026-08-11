// O AudioWorkletGlobalScope não tem vários globais que o glue do Emscripten
// referencia. Nada disso é usado de verdade no nosso caminho (o wasm chega via
// wasmBinary), só precisa existir.
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = class URL {
    constructor(path, _base) { this.href = String(path); }
    toString() { return this.href; }
  };
}

if (typeof globalThis.performance === 'undefined') {
  // currentTime (segundos) é global no AudioWorkletGlobalScope
  globalThis.performance = {
    now: () => (typeof currentTime !== 'undefined' ? currentTime * 1000 : Date.now()),
  };
}

if (typeof globalThis.location === 'undefined') {
  globalThis.location = { href: '/', origin: '/', pathname: '/' };
}
