// C-12: el peso se muestra en kg con tres decimales y coma decimal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatearPeso } from '../docs/js/formato.js';

test('C-12: el formato es siempre tres decimales, coma decimal y kg', () => {
  assert.equal(formatearPeso(15.4134), '15,413 kg');
  assert.equal(formatearPeso(6.4), '6,400 kg');
  assert.equal(formatearPeso(0.89875), '0,899 kg');
  assert.equal(formatearPeso(19.25), '19,250 kg');
});
