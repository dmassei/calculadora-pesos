// Utilidades compartidas por los tests: lectura de los archivos publicables de docs/.
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

export const DOCS = new URL('../docs/', import.meta.url);

export async function leerDocs(ruta) {
  return readFile(new URL(ruta, DOCS), 'utf8');
}

// Rutas relativas a docs/ de todos los archivos publicables.
export async function archivosDeDocs() {
  const entradas = await readdir(DOCS, { recursive: true, withFileTypes: true });
  const raiz = fileURLToPath(DOCS);
  return entradas
    .filter((entrada) => entrada.isFile())
    .map((entrada) => relative(raiz, join(entrada.parentPath, entrada.name)).split(sep).join('/'))
    .sort();
}

// El anexo del pedido, tal como lo confirmó quien pidió. Los tests comparan contra esto,
// no contra la tabla de la aplicación.
export const ANEXO_MATERIALES = [
  ['Acero al carbono', 7.85, 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart'],
  ['Acero inoxidable 304', 8.0, 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart'],
  ['Acero inoxidable 316', 8.0, 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart'],
  ['Acero dúplex 2205', 7.82, 'https://www.atimaterials.com/Products/ati-2205'],
  ['Cobre', 8.94, 'https://wermac.org/materials/density_of_metal.html'],
  ['Bronce fosforoso', 8.8, 'https://aimsindustrial.com.au/en-nz/blogs/product-guides/material-density-chart'],
  ['Tungsteno', 19.25, 'https://ns1.engineersedge.com/materials/density_of_common_engineering_materials__15896.htm'],
  ['Inconel 625', 8.44, 'https://www.fwmetals.com/materials/high-performance-alloys/inconel-alloy-625'],
  ['Inconel 718', 8.19, 'https://www.fwmetals.com/materials/high-performance-alloys/inconel-alloy-718'],
  ['Hastelloy C-276', 8.89, 'https://alloysintl.com/inventory/nickel-cobalt-alloys/hastelloy_c-276/'],
].map(([nombre, densidad, fuente]) => ({ nombre, densidad, fuente }));

export const ANEXO_FORMAS = [
  ['Barra cilíndrica', ['diámetro', 'largo']],
  ['Barra cuadrada', ['lado', 'largo']],
  ['Barra prismática', ['ancho', 'alto', 'largo']],
  ['Anillo', ['diámetro exterior', 'diámetro interior', 'altura']],
  ['Disco', ['diámetro', 'espesor']],
].map(([nombre, medidas]) => ({ nombre, medidas }));
