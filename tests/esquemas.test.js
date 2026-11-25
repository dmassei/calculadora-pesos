// Spec 3 — esquemas rotulados de cada forma: C-01 a C-09.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { archivosDeDocs, leerDocs } from './ayuda.js';
import { FORMAS } from '../docs/js/formas.js';
import { esquemaDeForma } from '../docs/js/esquemas.js';

const normalizar = (texto) => texto.trim().toLowerCase();

// Etiqueta de apertura del <svg>.
function aperturaSvg(svg) {
  const apertura = svg.match(/^\s*<svg\b[^>]*>/);
  assert.ok(apertura, 'el esquema no empieza con <svg>');
  return apertura[0];
}

function atributo(etiqueta, nombre) {
  return etiqueta.match(new RegExp(`\\s${nombre}="([^"]*)"`))?.[1];
}

// Grupos <g data-medida="..."> con su contenido. Los esquemas no anidan grupos.
function gruposDeMedida(svg) {
  return [...svg.matchAll(/<g\b[^>]*\bdata-medida="([^"]*)"[^>]*>([\s\S]*?)<\/g>/g)].map(([, id, contenido]) => ({
    id,
    contenido,
  }));
}

function textos(fragmento) {
  return [...fragmento.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(([, contenido]) => contenido);
}

test('C-01: cada forma tiene un único <svg> y los cinco esquemas son distintos', () => {
  const esquemas = FORMAS.map((forma) => esquemaDeForma(forma.id));
  for (const [i, svg] of esquemas.entries()) {
    assert.equal(typeof svg, 'string', FORMAS[i].id);
    assert.match(svg, /^\s*<svg\b/, FORMAS[i].id);
    assert.ok(svg.endsWith('</svg>'), FORMAS[i].id);
    assert.equal(svg.match(/<svg\b/g).length, 1, FORMAS[i].id);
    assert.equal(svg.match(/<\/svg>/g).length, 1, FORMAS[i].id);
  }
  assert.equal(new Set(esquemas).size, FORMAS.length);
});

test('C-01: con un id que no es de ninguna forma, lanza un error', () => {
  for (const id of ['', 'cubo', 'Anillo', undefined, null, 'toString', '__proto__', 'constructor']) {
    assert.throws(() => esquemaDeForma(id), Error, String(id));
  }
});

test('C-02: cada esquema tiene un grupo por medida, con su cota y su nombre, y nada más', () => {
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    const grupos = gruposDeMedida(svg);
    assert.deepEqual(
      grupos.map(({ id }) => id).sort(),
      forma.medidas.map(({ id }) => id).sort(),
      forma.id,
    );
    assert.equal((svg.match(/\bdata-medida=/g) ?? []).length, forma.medidas.length, forma.id);
    for (const { id, nombre } of forma.medidas) {
      const { contenido } = grupos.find((grupo) => grupo.id === id);
      assert.match(contenido, /<(line|path|polyline)\b/, `${forma.id} › ${id}: falta la cota`);
      const rotulos = textos(contenido);
      assert.equal(rotulos.length, 1, `${forma.id} › ${id}`);
      assert.equal(normalizar(rotulos[0]), normalizar(nombre), `${forma.id} › ${id}`);
    }
    const fuera = svg.replace(/<g\b[^>]*\bdata-medida="[^"]*"[^>]*>[\s\S]*?<\/g>/g, '');
    assert.doesNotMatch(fuera, /<text\b/, `${forma.id}: hay <text> fuera de los grupos`);
  }
});

test('C-02: ejemplos del pedido — anillo y barra prismática', () => {
  const rotulosPorGrupo = (idForma) =>
    Object.fromEntries(gruposDeMedida(esquemaDeForma(idForma)).map(({ id, contenido }) => [id, normalizar(textos(contenido)[0])]));
  assert.deepEqual(rotulosPorGrupo('anillo'), {
    diametro_exterior: 'diámetro exterior',
    diametro_interior: 'diámetro interior',
    altura: 'altura',
  });
  assert.deepEqual(rotulosPorGrupo('barra-prismatica'), { ancho: 'ancho', alto: 'alto', largo: 'largo' });
});

test('C-03: la función recibe solo el id, los rótulos no tienen números y el resultado es siempre el mismo', () => {
  assert.equal(esquemaDeForma.length, 1);
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    for (const rotulo of textos(svg)) {
      assert.doesNotMatch(rotulo, /\d/, `${forma.id}: ${rotulo}`);
    }
    assert.equal(esquemaDeForma(forma.id), svg, forma.id);
  }
});

test('C-04: cada esquema tiene role="img" y un <title> con la forma y sus medidas, referenciado y con id propio', () => {
  const ids = [];
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    const apertura = aperturaSvg(svg);
    assert.equal(atributo(apertura, 'role'), 'img', forma.id);
    const titulo = svg.slice(apertura.length).match(/^\s*<title\b([^>]*)>([^<]*)<\/title>/);
    assert.ok(titulo, `${forma.id}: el primer hijo no es <title>`);
    const [, atributosTitulo, contenido] = titulo;
    const texto = normalizar(contenido);
    assert.ok(texto.length > 0, forma.id);
    assert.ok(texto.includes(normalizar(forma.nombre)), `${forma.id}: ${contenido}`);
    for (const { nombre } of forma.medidas) {
      assert.ok(texto.includes(normalizar(nombre)), `${forma.id}: falta ${nombre} en "${contenido}"`);
    }
    const idTitulo = atributo(` ${atributosTitulo}`, 'id');
    assert.ok(idTitulo, `${forma.id}: el <title> no tiene id`);
    assert.equal(atributo(apertura, 'aria-labelledby'), idTitulo, forma.id);
    ids.push(idTitulo);
  }
  assert.equal(new Set(ids).size, FORMAS.length);
});

test('C-05: index.html tiene un único #esquema vacío y ningún <svg>', async () => {
  const html = await leerDocs('index.html');
  assert.equal((html.match(/\bid="esquema"/g) ?? []).length, 1);
  assert.match(html, /<(\w+)\b[^>]*\bid="esquema"[^>]*>\s*<\/\1>/);
  assert.doesNotMatch(html, /<svg\b/i);
});

test('C-05: la interfaz reemplaza el esquema con el de la forma elegida al iniciar y al cambiar de forma', async () => {
  const interfaz = await leerDocs('js/interfaz.js');
  assert.match(interfaz, /import\s*\{[^}]*\besquemaDeForma\b[^}]*\}\s*from\s*'\.\/esquemas\.js'/);
  const contenedor = interfaz.match(/const\s+(\w+)\s*=\s*document\.getElementById\('esquema'\)/);
  assert.ok(contenedor, 'la interfaz no obtiene #esquema');
  const funcion = interfaz.match(/function\s+(\w+)\s*\(\)\s*\{([^}]*)\}/g)?.find((f) => f.includes('esquemaDeForma('));
  assert.ok(funcion, 'no hay una función que muestre el esquema');
  assert.match(
    funcion,
    new RegExp(`${contenedor[1]}\\.innerHTML\\s*=\\s*esquemaDeForma\\(selectorForma\\.value\\)`),
    'el esquema no reemplaza todo el contenido del contenedor',
  );
  const nombre = funcion.match(/function\s+(\w+)/)[1];
  // Al iniciar: la llamada de nivel superior, fuera de cualquier función o manejador.
  assert.match(interfaz, new RegExp(`^${nombre}\\(\\);$`, 'm'), 'no se muestra al iniciar');
  // Al cambiar de forma: dentro del manejador de change del selector de forma.
  const manejador = interfaz.match(/selectorForma\.addEventListener\('change',\s*\(\)\s*=>\s*\{([^}]*)\}\);/);
  assert.ok(manejador, 'falta el manejador de change del selector de forma');
  assert.match(manejador[1], new RegExp(`\\b${nombre}\\(\\);`), 'no se reemplaza al cambiar de forma');
});

test('C-05: el esquema de barra prismática no tiene nada del anillo', () => {
  const svg = esquemaDeForma('barra-prismatica');
  for (const id of ['diametro_exterior', 'diametro_interior', 'altura']) {
    assert.ok(!svg.includes(id), id);
  }
  for (const rotulo of textos(svg)) {
    assert.ok(!['diámetro exterior', 'diámetro interior', 'altura'].includes(normalizar(rotulo)), rotulo);
  }
});

test('C-06: #esquema está dentro del fieldset "Medidas", junto a #medidas', async () => {
  const html = await leerDocs('index.html');
  const fieldsets = [...html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g)].map(([, contenido]) => contenido);
  const medidas = fieldsets.find((contenido) => /<legend\b[^>]*>\s*Medidas\s*<\/legend>/.test(contenido));
  assert.ok(medidas, 'no hay fieldset con leyenda "Medidas"');
  assert.match(medidas, /\bid="esquema"/);
  assert.match(medidas, /\bid="medidas"/);
});

test('C-07: los esquemas no cargan imágenes, recursos ni código', () => {
  for (const forma of FORMAS) {
    const svg = esquemaDeForma(forma.id);
    assert.doesNotMatch(svg, /<(image|use|foreignObject|script|style)\b/i, forma.id);
    assert.doesNotMatch(svg, /\s(href|xlink:href|src)\s*=/i, forma.id);
    assert.doesNotMatch(svg, /url\s*\(/i, forma.id);
  }
});

test('C-07: docs/ no tiene archivos de imagen y package.json no tiene dependencias', async () => {
  const imagenes = (await archivosDeDocs()).filter((ruta) => /\.(svg|png|jpe?g|gif|webp)$/i.test(ruta));
  assert.deepEqual(imagenes, []);
  const paquete = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  for (const clave of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    assert.equal(paquete[clave], undefined, clave);
  }
});

test('C-08: cada <svg> tiene viewBox de cuatro números y no fija width ni height', () => {
  for (const forma of FORMAS) {
    const apertura = aperturaSvg(esquemaDeForma(forma.id));
    assert.match(atributo(apertura, 'viewBox') ?? '', /^\s*-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?){3}\s*$/, forma.id);
    assert.doesNotMatch(apertura, /\s(width|height)\s*=/, forma.id);
  }
});

test('C-08: estilos.css hace que el svg de #esquema se adapte al ancho', async () => {
  const css = await leerDocs('estilos.css');
  const reglas = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .filter(([, selector]) => selector.split(',').some((s) => /#esquema\s+svg\b/.test(s)))
    .map(([, , cuerpo]) => cuerpo);
  assert.ok(
    reglas.some((cuerpo) => /(max-)?width\s*:\s*100%/.test(cuerpo) && /(^|[;\s])height\s*:\s*auto/.test(cuerpo)),
    'falta una regla para #esquema svg con width/max-width: 100% y height: auto',
  );
});

test('C-09: esquemas.js se importa en Node y no usa APIs del navegador', async () => {
  await assert.doesNotReject(import(new URL('../docs/js/esquemas.js', import.meta.url).href));
  const js = await leerDocs('js/esquemas.js');
  assert.doesNotMatch(js, /\b(document|window|navigator|HTMLElement|globalThis)\b/);
});
