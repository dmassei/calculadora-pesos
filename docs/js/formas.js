// Definición de las formas: qué medidas pide cada una y cómo se calcula su volumen en mm³.

const MEDIDAS = Object.freeze({
  diametro: { id: 'diametro', nombre: 'diámetro' },
  largo: { id: 'largo', nombre: 'largo' },
  lado: { id: 'lado', nombre: 'lado' },
  ancho: { id: 'ancho', nombre: 'ancho' },
  alto: { id: 'alto', nombre: 'alto' },
  diametro_exterior: { id: 'diametro_exterior', nombre: 'diámetro exterior' },
  diametro_interior: { id: 'diametro_interior', nombre: 'diámetro interior' },
  altura: { id: 'altura', nombre: 'altura', articulo: 'la' },
  espesor: { id: 'espesor', nombre: 'espesor' },
});

const mayuscula = (texto) => `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;

function medida(id) {
  const { nombre, articulo = 'el' } = MEDIDAS[id];
  return Object.freeze({ id, nombre, articulo, etiqueta: `${mayuscula(nombre)} (mm)` });
}

export const FORMAS = Object.freeze([
  {
    id: 'barra-cilindrica',
    nombre: 'Barra cilíndrica',
    medidas: [medida('diametro'), medida('largo')],
    volumen: ({ diametro, largo }) => Math.PI * (diametro / 2) ** 2 * largo,
  },
  {
    id: 'barra-cuadrada',
    nombre: 'Barra cuadrada',
    medidas: [medida('lado'), medida('largo')],
    volumen: ({ lado, largo }) => lado ** 2 * largo,
  },
  {
    id: 'barra-prismatica',
    nombre: 'Barra prismática',
    medidas: [medida('ancho'), medida('alto'), medida('largo')],
    volumen: ({ ancho, alto, largo }) => ancho * alto * largo,
  },
  {
    id: 'anillo',
    nombre: 'Anillo',
    medidas: [medida('diametro_exterior'), medida('diametro_interior'), medida('altura')],
    volumen: ({ diametro_exterior, diametro_interior, altura }) =>
      (Math.PI / 4) * (diametro_exterior ** 2 - diametro_interior ** 2) * altura,
  },
  {
    id: 'disco',
    nombre: 'Disco',
    medidas: [medida('diametro'), medida('espesor')],
    volumen: ({ diametro, espesor }) => Math.PI * (diametro / 2) ** 2 * espesor,
  },
].map((forma) => Object.freeze({ ...forma, medidas: Object.freeze(forma.medidas) })));

export function buscarForma(id) {
  return FORMAS.find((forma) => forma.id === id);
}

// Campos de medida que la interfaz tiene que mostrar para una forma, en orden.
export function camposDeForma(idForma) {
  const forma = buscarForma(idForma);
  if (!forma) {
    throw new Error(`Forma desconocida: ${idForma}`);
  }
  return forma.medidas;
}
