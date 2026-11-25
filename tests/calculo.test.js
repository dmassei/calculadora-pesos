// C-01, C-02, C-03, C-08, C-15: el peso es volumen por densidad, con los ejemplos del pedido exactos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPieza, pesoEnKg } from '../docs/js/calculo.js';
import { FORMAS } from '../docs/js/formas.js';
import { MATERIALES } from '../docs/js/materiales.js';
import { ANEXO_MATERIALES } from './ayuda.js';

const forma = (nombre) => FORMAS.find((f) => f.nombre === nombre).id;
const material = (nombre) => MATERIALES.find((m) => m.nombre === nombre).id;
// Redondeo de referencia del test, independiente del de la aplicación.
const round3 = (x) => Number((Math.round(Number((x * 1000).toPrecision(12))) / 1000).toFixed(3));

test('C-01: barra cilíndrica 50 × 1000 de acero al carbono pesa 15,413 kg', () => {
  const r = calcularPieza({
    forma: forma('Barra cilíndrica'),
    material: material('Acero al carbono'),
    medidas: { diametro: '50', largo: '1000' },
  });
  assert.equal(r.peso, 15.413);
  assert.equal(r.texto, '15,413 kg');
});

test('C-02: anillo 100/60 × 20 de cobre pesa 0,899 kg', () => {
  const r = calcularPieza({
    forma: forma('Anillo'),
    material: material('Cobre'),
    medidas: { diametro_exterior: '100', diametro_interior: '60', altura: '20' },
  });
  assert.equal(r.peso, 0.899);
  assert.equal(r.texto, '0,899 kg');
});

// Volúmenes de referencia en mm³, escritos a partir de las fórmulas de la spec.
const CASOS_C03 = [
  { nombre: 'Barra cilíndrica', medidas: { diametro: '50', largo: '1000' }, volumen: Math.PI * 25 ** 2 * 1000 },
  { nombre: 'Barra cuadrada', medidas: { lado: '40', largo: '500' }, volumen: 40 ** 2 * 500 },
  { nombre: 'Barra prismática', medidas: { ancho: '100', alto: '10', largo: '1000' }, volumen: 100 * 10 * 1000 },
  {
    nombre: 'Anillo',
    medidas: { diametro_exterior: '100', diametro_interior: '60', altura: '20' },
    volumen: (Math.PI / 4) * (100 ** 2 - 60 ** 2) * 20,
  },
  { nombre: 'Disco', medidas: { diametro: '200', espesor: '10' }, volumen: Math.PI * 100 ** 2 * 10 },
];

test('C-03: las 50 combinaciones de forma y material dan volumen × densidad redondeado', () => {
  let combinaciones = 0;
  for (const caso of CASOS_C03) {
    for (const anexo of ANEXO_MATERIALES) {
      const r = calcularPieza({ forma: forma(caso.nombre), material: material(anexo.nombre), medidas: caso.medidas });
      const esperado = round3((caso.volumen * anexo.densidad) / 1_000_000);
      assert.equal(r.peso, esperado, `${caso.nombre} de ${anexo.nombre}`);
      combinaciones += 1;
    }
  }
  assert.equal(combinaciones, 50);
});

test('C-03: casos de control', () => {
  const controles = [
    ['Barra cuadrada', { lado: '40', largo: '500' }, 'Acero inoxidable 304', 6.4, '6,400 kg'],
    ['Barra prismática', { ancho: '100', alto: '10', largo: '1000' }, 'Tungsteno', 19.25, '19,250 kg'],
    ['Disco', { diametro: '200', espesor: '10' }, 'Inconel 625', 2.652, '2,652 kg'],
  ];
  for (const [nombreForma, medidas, nombreMaterial, peso, texto] of controles) {
    const r = calcularPieza({ forma: forma(nombreForma), material: material(nombreMaterial), medidas });
    assert.equal(r.peso, peso, `${nombreForma} de ${nombreMaterial}`);
    assert.equal(r.texto, texto, `${nombreForma} de ${nombreMaterial}`);
  }
});

test('C-08: diámetro "25,4" y "25.4" dan el mismo peso con cualquier material', () => {
  for (const { id } of MATERIALES) {
    const conComa = calcularPieza({ forma: forma('Barra cilíndrica'), material: id, medidas: { diametro: '25,4', largo: '1000' } });
    const conPunto = calcularPieza({ forma: forma('Barra cilíndrica'), material: id, medidas: { diametro: '25.4', largo: '1000' } });
    assert.ok(typeof conComa.peso === 'number' && conComa.peso > 0, id);
    assert.equal(conComa.peso, conPunto.peso, id);
    assert.equal(conComa.texto, conPunto.texto, id);
  }
});

test('C-15: la lógica recibe una sola pieza y devuelve un solo peso', () => {
  const r = calcularPieza({
    forma: forma('Barra cilíndrica'),
    material: material('Acero al carbono'),
    medidas: { diametro: '50', largo: '1000' },
  });
  assert.deepEqual(Object.keys(r).sort(), ['peso', 'texto']);
  assert.equal(typeof r.peso, 'number');
  assert.equal(typeof pesoEnKg(forma('Disco'), { diametro: 200, espesor: 10 }, 8.44), 'number');
});
