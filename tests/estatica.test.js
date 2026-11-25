// C-13, C-14, C-15, C-16, C-17: aplicación estática, sin red, sin guardar datos, en español y probable sin navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archivosDeDocs, leerDocs } from './ayuda.js';
import { FORMAS } from '../docs/js/formas.js';
import { MATERIALES } from '../docs/js/materiales.js';
import { validarMedidas } from '../docs/js/validacion.js';

const MODULOS_DE_LOGICA = ['calculo.js', 'numeros.js', 'validacion.js', 'formato.js', 'materiales.js', 'formas.js'];

async function archivosJs() {
  return (await archivosDeDocs()).filter((ruta) => ruta.endsWith('.js'));
}

test('C-13: ningún recurso cargado por el HTML apunta a una URL absoluta', async () => {
  for (const ruta of (await archivosDeDocs()).filter((r) => r.endsWith('.html'))) {
    const html = await leerDocs(ruta);
    const etiquetas = html.match(/<(script|link|img|source|iframe|audio|video|object|embed)\b[^>]*>/gi) ?? [];
    for (const etiqueta of etiquetas) {
      assert.doesNotMatch(etiqueta, /\b(src|href|srcset|data)\s*=\s*["']?\s*(https?:|\/\/)/i, `${ruta}: ${etiqueta}`);
    }
  }
  for (const ruta of (await archivosDeDocs()).filter((r) => r.endsWith('.css'))) {
    const css = await leerDocs(ruta);
    assert.doesNotMatch(css, /url\(\s*["']?\s*(https?:|\/\/)/i, ruta);
    assert.doesNotMatch(css, /@import\s+["']?(https?:|\/\/)/i, ruta);
  }
});

test('C-13: ningún .js hace pedidos de red ni importa de URLs absolutas', async () => {
  const archivos = await archivosJs();
  assert.ok(archivos.length > 0);
  for (const ruta of archivos) {
    const js = await leerDocs(ruta);
    assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/, ruta);
    assert.doesNotMatch(js, /^\s*(import|export)\b[^;'"]*?(\bfrom\s*)?['"](https?:|\/\/)/m, ruta);
    assert.doesNotMatch(js, /\bimport\s*\(\s*['"](https?:|\/\/)/, ruta);
  }
});

test('C-14: ningún .js guarda datos', async () => {
  for (const ruta of await archivosJs()) {
    const js = await leerDocs(ruta);
    assert.doesNotMatch(js, /\b(localStorage|sessionStorage|indexedDB|caches)\b|document\.cookie/, ruta);
  }
});

test('C-15: index.html no tiene campos ni textos de cantidad, precio, costo o total', async () => {
  const html = await leerDocs('index.html');
  assert.doesNotMatch(html, /total|cantidad|precio|costo/i);
});

test('C-16: index.html declara español, viewport y carga la aplicación como módulo local', async () => {
  const html = await leerDocs('index.html');
  assert.match(html, /<html\b[^>]*\blang="es"/i);
  assert.match(html, /<meta\b[^>]*name="viewport"[^>]*content="[^"]*width=device-width/i);
  const modulo = html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/i);
  assert.ok(modulo, 'falta <script type="module" src="...">');
  const archivos = await archivosDeDocs();
  assert.ok(archivos.includes(modulo[1]), `${modulo[1]} no está dentro de docs/`);
});

test('C-16: los selectores de forma y material tienen etiqueta asociada en español', async () => {
  const html = await leerDocs('index.html');
  for (const [id, texto] of [['forma', 'Forma'], ['material', 'Material']]) {
    assert.match(html, new RegExp(`<select\\b[^>]*id="${id}"`), id);
    assert.match(html, new RegExp(`<label\\b[^>]*for="${id}"[^>]*>\\s*${texto}\\s*</label>`), id);
  }
});

test('C-16: cada campo de medida generado tiene etiqueta asociada con texto en español', async () => {
  const interfaz = await leerDocs('js/interfaz.js');
  // La interfaz crea un <label> por medida, asociado al campo por id, con la etiqueta de la definición.
  assert.match(interfaz, /createElement\('label'\)/);
  assert.match(interfaz, /rotulo\.htmlFor\s*=\s*idCampo\(id\)/);
  assert.match(interfaz, /campo\.id\s*=\s*idCampo\(id\)/);
  assert.match(interfaz, /rotulo\.textContent\s*=\s*etiqueta/);
  for (const f of FORMAS) {
    for (const m of f.medidas) {
      assert.match(m.etiqueta, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ ]+ \(mm\)$/, m.etiqueta);
    }
  }
});

test('C-16: formas, medidas, materiales y mensajes de error están en español', () => {
  const nombres = [
    ...FORMAS.map((f) => f.nombre),
    ...FORMAS.flatMap((f) => f.medidas.map((m) => m.nombre)),
    ...MATERIALES.map((m) => m.nombre),
  ];
  assert.ok(nombres.every((n) => typeof n === 'string' && n.length > 0));
  const anillo = FORMAS.find((f) => f.nombre === 'Anillo');
  const mensajes = [
    ...validarMedidas(anillo.id, { diametro_exterior: '', diametro_interior: 'abc', altura: '0' }).errores,
    ...validarMedidas(anillo.id, { diametro_exterior: '10', diametro_interior: '20', altura: '5' }).errores,
  ].map((e) => e.mensaje);
  assert.deepEqual(mensajes, [
    'Ingresá el diámetro exterior.',
    'El diámetro interior tiene que ser un número.',
    'La altura tiene que ser mayor que cero.',
    'El diámetro interior tiene que ser menor que el exterior.',
  ]);
});

test('C-17: los módulos de lógica no usan APIs del DOM', async () => {
  for (const nombre of MODULOS_DE_LOGICA) {
    const js = await leerDocs(`js/${nombre}`);
    assert.doesNotMatch(js, /\b(document|window|navigator|HTMLElement|globalThis)\b/, nombre);
  }
});

test('C-17: los módulos de lógica se importan en Node sin errores', async () => {
  for (const nombre of MODULOS_DE_LOGICA) {
    await assert.doesNotReject(import(new URL(`../docs/js/${nombre}`, import.meta.url).href), nombre);
  }
});
