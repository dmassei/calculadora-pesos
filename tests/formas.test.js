// C-04, C-05: formas del anexo y campos que se muestran para cada una.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORMAS, camposDeForma } from '../docs/js/formas.js';
import { ANEXO_FORMAS, leerDocs } from './ayuda.js';

test('C-04: las formas son exactamente las cinco del anexo, en orden', () => {
  assert.deepEqual(FORMAS.map((f) => f.nombre), ANEXO_FORMAS.map((f) => f.nombre));
});

test('C-04: cada forma pide exactamente sus medidas, en orden, rotuladas en español y en mm', () => {
  for (const anexo of ANEXO_FORMAS) {
    const forma = FORMAS.find((f) => f.nombre === anexo.nombre);
    assert.deepEqual(forma.medidas.map((m) => m.nombre), anexo.medidas, anexo.nombre);
    for (const m of forma.medidas) {
      assert.match(m.etiqueta, /\(mm\)$/, `${anexo.nombre}: ${m.etiqueta}`);
      assert.ok(m.etiqueta.toLowerCase().startsWith(m.nombre), `${anexo.nombre}: ${m.etiqueta}`);
    }
  }
});

test('C-05: dada cada forma, los campos a mostrar son exactamente sus medidas', () => {
  for (const anexo of ANEXO_FORMAS) {
    const forma = FORMAS.find((f) => f.nombre === anexo.nombre);
    assert.deepEqual(camposDeForma(forma.id).map((m) => m.nombre), anexo.medidas, anexo.nombre);
  }
});

test('C-05: con Disco no aparecen largo ni lado; con Barra cilíndrica no aparecen espesor, lado ni diámetro interior', () => {
  const disco = camposDeForma(FORMAS.find((f) => f.nombre === 'Disco').id).map((m) => m.nombre);
  assert.ok(!disco.includes('largo') && !disco.includes('lado'));
  const cilindrica = camposDeForma(FORMAS.find((f) => f.nombre === 'Barra cilíndrica').id).map((m) => m.nombre);
  for (const ajena of ['espesor', 'lado', 'diámetro interior']) {
    assert.ok(!cilindrica.includes(ajena), ajena);
  }
});

test('C-05: el HTML no tiene campos de medidas fijos y la interfaz los arma desde la definición', async () => {
  const html = await leerDocs('index.html');
  assert.doesNotMatch(html, /<input\b/i);
  assert.doesNotMatch(html, /<textarea\b/i);
  const interfaz = await leerDocs('js/interfaz.js');
  assert.match(interfaz, /import\s*\{[^}]*camposDeForma[^}]*\}\s*from\s*'\.\/formas\.js'/);
});
