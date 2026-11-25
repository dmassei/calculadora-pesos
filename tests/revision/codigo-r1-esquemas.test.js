// Revisión de código, ronda 1, spec 3: el marcado de cada esquema es un SVG bien armado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORMAS } from '../../docs/js/formas.js';
import { esquemaDeForma } from '../../docs/js/esquemas.js';

const numeros = (texto) => [...texto.matchAll(/-?\d+(?:\.\d+)?/g)].map(([n]) => Number(n));

function gruposDeMedida(svg) {
  return [...svg.matchAll(/<g\b[^>]*\bdata-medida="([^"]*)"[^>]*>([\s\S]*?)<\/g>/g)].map(([, id, contenido]) => ({
    id,
    contenido,
  }));
}

// Respalda C-01 y C-02: el texto devuelto es un único SVG, con las etiquetas bien cerradas.
test('C-01: el marcado de cada esquema tiene las etiquetas balanceadas y sin atributos repetidos', () => {
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    const pila = [];
    for (const [, cierra, nombre, atributos, autocierre] of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
      if (cierra) {
        assert.equal(pila.pop(), nombre, `${forma.id}: cierre inesperado de ${nombre}`);
        continue;
      }
      const nombres = [...atributos.matchAll(/\s([a-zA-Z:][\w:-]*)=/g)].map(([, n]) => n);
      assert.equal(new Set(nombres).size, nombres.length, `${forma.id}: atributo repetido en <${nombre}>`);
      if (!autocierre) pila.push(nombre);
    }
    assert.deepEqual(pila, [], `${forma.id}: etiquetas sin cerrar`);
    assert.doesNotMatch(svg, /NaN|undefined|null|Infinity|\[object/, forma.id);
  }
});

// Respalda C-02: cada cota señala una medida distinta y tiene longitud.
test('C-02: cada medida tiene su propia cota y ninguna línea es un punto', () => {
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    const grupos = gruposDeMedida(svg);
    const trazos = grupos.map(({ contenido }) => contenido.replace(/<text\b[\s\S]*?<\/text>/g, ''));
    assert.equal(new Set(trazos).size, grupos.length, `${forma.id}: dos medidas comparten el mismo dibujo`);
    for (const [, atributos] of svg.matchAll(/<line\b([^>]*)\/>/g)) {
      const valor = (nombre) => Number(atributos.match(new RegExp(`\\s${nombre}="([^"]*)"`))?.[1]);
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(valor);
      assert.ok([x1, y1, x2, y2].every(Number.isFinite), `${forma.id}: línea con coordenadas inválidas`);
      assert.ok(x1 !== x2 || y1 !== y2, `${forma.id}: línea de largo cero`);
    }
  }
});

// Respalda C-08: lo que se dibuja cae dentro del viewBox, o el esquema se vería cortado al adaptarse.
test('C-08: cotas y rótulos quedan dentro del viewBox', () => {
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    const [minX, minY, ancho, alto] = numeros(svg.match(/\bviewBox="([^"]*)"/)[1]);
    const dentro = (x, y, que) => {
      assert.ok(x >= minX && x <= minX + ancho, `${forma.id}: ${que} con x=${x} fuera del viewBox`);
      assert.ok(y >= minY && y <= minY + alto, `${forma.id}: ${que} con y=${y} fuera del viewBox`);
    };
    for (const [, atributos] of svg.matchAll(/<line\b([^>]*)\/>/g)) {
      const valor = (nombre) => Number(atributos.match(new RegExp(`\\s${nombre}="([^"]*)"`))[1]);
      dentro(valor('x1'), valor('y1'), 'línea');
      dentro(valor('x2'), valor('y2'), 'línea');
    }
    for (const [, puntos] of svg.matchAll(/<polyline\b[^>]*\spoints="([^"]*)"/g)) {
      for (const par of puntos.trim().split(/\s+/)) {
        const [x, y] = numeros(par);
        dentro(x, y, 'punta de flecha');
      }
    }
    for (const [, atributos] of svg.matchAll(/<text\b([^>]*)>/g)) {
      const valor = (nombre) => Number(atributos.match(new RegExp(`\\s${nombre}="([^"]*)"`))[1]);
      dentro(valor('x'), valor('y'), 'rótulo');
    }
  }
});
