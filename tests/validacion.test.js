// C-08, C-09, C-10, C-11: lectura de números y validación de medidas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerNumero } from '../docs/js/numeros.js';
import { validarMedidas } from '../docs/js/validacion.js';
import { calcularPieza } from '../docs/js/calculo.js';
import { FORMAS } from '../docs/js/formas.js';
import { MATERIALES } from '../docs/js/materiales.js';

const material = MATERIALES[0].id;
const forma = (nombre) => FORMAS.find((f) => f.nombre === nombre);

// Medidas válidas para cada forma; el anillo con interior menor que exterior.
function medidasValidas(f) {
  const textos = {};
  for (const m of f.medidas) {
    textos[m.id] = m.id === 'diametro_interior' ? '10' : '100';
  }
  return textos;
}

function sinPeso(r) {
  assert.ok(!('peso' in r) && !('texto' in r), 'no tiene que haber peso');
  assert.ok(Array.isArray(r.errores) && r.errores.length > 0, 'tiene que haber errores');
}

test('C-08: "12,5" y "12.5" se leen como 12.5, y "50" como 50', () => {
  assert.equal(leerNumero('12,5'), 12.5);
  assert.equal(leerNumero('12.5'), 12.5);
  assert.equal(leerNumero('50'), 50);
});

test('C-09: cada medida en "0", "-5" o vacía no da peso y el error la nombra', () => {
  for (const f of FORMAS) {
    for (const m of f.medidas) {
      for (const invalido of ['0', '-5', '']) {
        const medidas = { ...medidasValidas(f), [m.id]: invalido };
        const caso = `${f.nombre}, ${m.nombre} = "${invalido}"`;
        const r = calcularPieza({ forma: f.id, material, medidas });
        sinPeso(r);
        const { valores, errores } = validarMedidas(f.id, medidas);
        assert.equal(valores, null, caso);
        assert.ok(errores.some((e) => e.nombre === m.nombre && e.medida === m.id), caso);
        assert.ok(errores.find((e) => e.medida === m.id).mensaje.includes(m.nombre), caso);
      }
    }
  }
});

test('C-09: barra cilíndrica con largo "0" da error en "largo" y sin peso', () => {
  const f = forma('Barra cilíndrica');
  const r = calcularPieza({ forma: f.id, material, medidas: { diametro: '50', largo: '0' } });
  sinPeso(r);
  assert.deepEqual(r.errores.map((e) => e.nombre), ['largo']);
});

test('C-09: con varias medidas inválidas se identifican todas', () => {
  for (const f of FORMAS) {
    const medidas = Object.fromEntries(f.medidas.map((m) => [m.id, '0']));
    const r = calcularPieza({ forma: f.id, material, medidas });
    sinPeso(r);
    const nombrados = new Set(r.errores.map((e) => e.nombre));
    for (const m of f.medidas) {
      assert.ok(nombrados.has(m.nombre), `${f.nombre}: ${m.nombre}`);
    }
  }
});

test('C-10: "abc", "1,2,3" y "1.2.3" no dan peso y el error nombra la medida', () => {
  for (const f of FORMAS) {
    for (const m of f.medidas) {
      for (const invalido of ['abc', '1,2,3', '1.2.3']) {
        const medidas = { ...medidasValidas(f), [m.id]: invalido };
        const caso = `${f.nombre}, ${m.nombre} = "${invalido}"`;
        assert.ok(Number.isNaN(leerNumero(invalido)), caso);
        const r = calcularPieza({ forma: f.id, material, medidas });
        sinPeso(r);
        assert.ok(r.errores.some((e) => e.nombre === m.nombre && e.medida === m.id), caso);
      }
    }
  }
});

test('C-11: anillo con interior igual o mayor que el exterior no da peso y lo indica', () => {
  const anillo = forma('Anillo');
  for (const interior of ['100', '120']) {
    const medidas = { diametro_exterior: '100', diametro_interior: interior, altura: '20' };
    const r = calcularPieza({ forma: anillo.id, material, medidas });
    sinPeso(r);
    const error = r.errores.find((e) => e.medida === 'diametro_interior');
    assert.ok(error, `interior ${interior}`);
    assert.equal(error.nombre, 'diámetro interior');
    assert.match(error.mensaje, /diámetro interior.*menor que el exterior/i);
  }
});

test('C-11: anillo con interior 99,9 y exterior 100 sí calcula el peso', () => {
  const r = calcularPieza({
    forma: forma('Anillo').id,
    material,
    medidas: { diametro_exterior: '100', diametro_interior: '99,9', altura: '20' },
  });
  assert.equal(r.errores, undefined);
  assert.ok(r.peso > 0);
  assert.match(r.texto, /^\d+,\d{3} kg$/);
});
