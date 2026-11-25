// C-06, C-07: la tabla de materiales en un único archivo y la densidad visible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MATERIALES } from '../docs/js/materiales.js';
import { formatearDensidad } from '../docs/js/formato.js';
import { ANEXO_MATERIALES, archivosDeDocs, leerDocs } from './ayuda.js';

const ARCHIVO_DE_DATOS = 'js/materiales.js';

test('C-06: la tabla tiene exactamente los diez materiales del anexo con densidad y fuente', () => {
  assert.equal(MATERIALES.length, 10);
  assert.deepEqual(
    MATERIALES.map(({ nombre, densidad_g_cm3, fuente }) => ({ nombre, densidad: densidad_g_cm3, fuente })),
    ANEXO_MATERIALES,
  );
  for (const m of MATERIALES) {
    assert.match(m.fuente, /^https:\/\//, m.nombre);
  }
});

test('C-06: ningún otro archivo de docs/ repite las densidades como literales numéricos', async () => {
  const densidades = [...new Set(ANEXO_MATERIALES.map((m) => m.densidad))];
  const archivos = (await archivosDeDocs()).filter((ruta) => ruta !== ARCHIVO_DE_DATOS);
  assert.ok(archivos.includes('index.html'));
  for (const ruta of archivos) {
    const contenido = await leerDocs(ruta);
    for (const densidad of densidades) {
      const [entero, decimales = ''] = String(densidad).split('.');
      // 8.0 se escribe también "8.0" o "8.00"; 7.85, "7.85" o "7,85".
      const literal = new RegExp(`(?<![\\d.,])${entero}[.,]${decimales || '0'}0*(?![\\d])`);
      assert.doesNotMatch(contenido, literal, `${ruta} repite ${densidad}`);
    }
  }
});

test('C-06: los demás archivos de docs/ no contienen otra tabla de materiales', async () => {
  const archivos = (await archivosDeDocs()).filter((ruta) => ruta !== ARCHIVO_DE_DATOS);
  for (const ruta of archivos) {
    const contenido = await leerDocs(ruta);
    for (const { nombre } of ANEXO_MATERIALES) {
      assert.ok(!contenido.includes(nombre), `${ruta} menciona ${nombre}`);
    }
  }
});

test('C-07: el texto de densidad de cada material sale de la tabla, con coma decimal', () => {
  for (const m of MATERIALES) {
    const texto = formatearDensidad(m.densidad_g_cm3);
    const esperado = `${String(m.densidad_g_cm3).replace('.', ',')} g/cm³`;
    assert.ok(texto.includes(esperado), `${m.nombre}: ${texto}`);
  }
  const densidad = (nombre) => MATERIALES.find((m) => m.nombre === nombre).densidad_g_cm3;
  assert.ok(formatearDensidad(densidad('Cobre')).includes('8,94 g/cm³'));
  assert.ok(formatearDensidad(densidad('Tungsteno')).includes('19,25 g/cm³'));
});
