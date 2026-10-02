// Se ejecuta antes que el código de la app y sus dependencias.
// sockjs-client (browser-crypto.js) necesita `global` en el navegador.
(globalThis as any).global = globalThis;
