// Test de humo: comprueba que el entorno de tests funciona y que existe la página publicable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('la página publicable existe y es un documento HTML', async () => {
  const pagina = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');
  assert.match(pagina, /^<!doctype html>/i);
});
