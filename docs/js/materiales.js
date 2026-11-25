// Tabla de materiales: único lugar donde viven nombre, densidad y fuente de cada uno.
// Es un módulo JS y no un .json para que el navegador lo cargue con import, sin pedidos de red.
export const MATERIALES = Object.freeze([
  {
    id: 'acero-carbono',
    nombre: 'Acero al carbono',
    densidad_g_cm3: 7.85,
    fuente: 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart',
  },
  {
    id: 'acero-inoxidable-304',
    nombre: 'Acero inoxidable 304',
    densidad_g_cm3: 8.0,
    fuente: 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart',
  },
  {
    id: 'acero-inoxidable-316',
    nombre: 'Acero inoxidable 316',
    densidad_g_cm3: 8.0,
    fuente: 'https://aimsindustrial.com.au/blogs/product-guides/material-density-chart',
  },
  {
    id: 'acero-duplex-2205',
    nombre: 'Acero dúplex 2205',
    densidad_g_cm3: 7.82,
    fuente: 'https://www.atimaterials.com/Products/ati-2205',
  },
  {
    id: 'cobre',
    nombre: 'Cobre',
    densidad_g_cm3: 8.94,
    fuente: 'https://wermac.org/materials/density_of_metal.html',
  },
  {
    id: 'bronce-fosforoso',
    nombre: 'Bronce fosforoso',
    densidad_g_cm3: 8.8,
    fuente: 'https://aimsindustrial.com.au/en-nz/blogs/product-guides/material-density-chart',
  },
  {
    id: 'tungsteno',
    nombre: 'Tungsteno',
    densidad_g_cm3: 19.25,
    fuente: 'https://ns1.engineersedge.com/materials/density_of_common_engineering_materials__15896.htm',
  },
  {
    id: 'inconel-625',
    nombre: 'Inconel 625',
    densidad_g_cm3: 8.44,
    fuente: 'https://www.fwmetals.com/materials/high-performance-alloys/inconel-alloy-625',
  },
  {
    id: 'inconel-718',
    nombre: 'Inconel 718',
    densidad_g_cm3: 8.19,
    fuente: 'https://www.fwmetals.com/materials/high-performance-alloys/inconel-alloy-718',
  },
  {
    id: 'hastelloy-c276',
    nombre: 'Hastelloy C-276',
    densidad_g_cm3: 8.89,
    fuente: 'https://alloysintl.com/inventory/nickel-cobalt-alloys/hastelloy_c-276/',
  },
].map((material) => Object.freeze(material)));

export function buscarMaterial(id) {
  return MATERIALES.find((material) => material.id === id);
}
