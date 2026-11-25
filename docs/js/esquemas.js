// Esquemas rotulados de cada forma, como marcado SVG en texto. No toca el DOM.
// El esquema es ilustrativo: depende solo de la forma, nunca de las medidas cargadas.
import { buscarForma } from './formas.js';

const COLOR_PIEZA = '#57606a';
const COLOR_COTA = '#0969da';
const COLOR_TEXTO = '#1f2328';

const ENTIDADES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
}

// Trazos de la pieza: contorno lleno y líneas ocultas punteadas.
const contorno = (d) => `<path d="${d}" fill="#eaeef2" stroke="${COLOR_PIEZA}" stroke-width="2" stroke-linejoin="round"/>`;
const arista = (d) => `<path d="${d}" fill="none" stroke="${COLOR_PIEZA}" stroke-width="2" stroke-linejoin="round"/>`;
const oculta = (d) => `<path d="${d}" fill="none" stroke="${COLOR_PIEZA}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
const circulo = (cx, cy, r, relleno) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${COLOR_PIEZA}" stroke-width="2"/>`;
const elipse = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#eaeef2" stroke="${COLOR_PIEZA}" stroke-width="2"/>`;

// Una cota: línea de medida con flechas en los dos extremos y líneas de referencia opcionales.
function cota([x1, y1], [x2, y2], referencias = []) {
  const largo = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / largo;
  const uy = (y2 - y1) / largo;
  const punto = (px, py) => `${Number(px.toFixed(1))},${Number(py.toFixed(1))}`;
  const flecha = (x, y, sentido) => {
    const bx = x + sentido * ux * 8;
    const by = y + sentido * uy * 8;
    return `<polyline points="${punto(bx - uy * 4, by + ux * 4)} ${punto(x, y)} ${punto(bx + uy * 4, by - ux * 4)}" fill="none" stroke="${COLOR_COTA}" stroke-width="1.5"/>`;
  };
  const lineasDeReferencia = referencias.map(
    ([[ax, ay], [bx, by]]) =>
      `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${COLOR_COTA}" stroke-width="1" stroke-dasharray="3 3"/>`,
  );
  return [
    ...lineasDeReferencia,
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLOR_COTA}" stroke-width="1.5"/>`,
    flecha(x1, y1, 1),
    flecha(x2, y2, -1),
  ].join('');
}

// Dónde va el rótulo de una cota.
const rotulo = (x, y, alineacion = 'middle') => ({ x, y, alineacion });

// Dibujo de cada forma: la pieza y una cota por cada medida, con la clave igual al id de la medida.
const DIBUJOS = Object.freeze({
  'barra-cilindrica': {
    viewBox: '0 0 360 220',
    pieza: [
      contorno('M120 55 H300 A18 45 0 0 1 300 145 H120 Z'),
      elipse(120, 100, 18, 45),
    ],
    cotas: {
      diametro: {
        trazo: cota([85, 55], [85, 145], [[[120, 55], [79, 55]], [[120, 145], [79, 145]]]),
        rotulo: rotulo(77, 105, 'end'),
      },
      largo: {
        trazo: cota([120, 180], [300, 180], [[[120, 150], [120, 186]], [[300, 150], [300, 186]]]),
        rotulo: rotulo(210, 205),
      },
    },
  },
  'barra-cuadrada': {
    viewBox: '0 0 360 220',
    pieza: [
      contorno('M80 90 H260 V150 H80 Z'),
      contorno('M80 90 L110 60 H290 L260 90 Z'),
      contorno('M260 90 L290 60 V120 L260 150 Z'),
    ],
    cotas: {
      lado: {
        trazo: cota([50, 90], [50, 150], [[[80, 90], [44, 90]], [[80, 150], [44, 150]]]),
        rotulo: rotulo(42, 125, 'end'),
      },
      largo: {
        trazo: cota([80, 180], [260, 180], [[[80, 155], [80, 186]], [[260, 155], [260, 186]]]),
        rotulo: rotulo(170, 205),
      },
    },
  },
  'barra-prismatica': {
    viewBox: '0 0 360 220',
    pieza: [
      contorno('M80 100 H260 V150 H80 Z'),
      contorno('M80 100 L120 60 H300 L260 100 Z'),
      contorno('M260 100 L300 60 V110 L260 150 Z'),
    ],
    cotas: {
      ancho: {
        trazo: cota([276, 166], [316, 126], [[[263, 153], [281, 171]], [[303, 113], [321, 131]]]),
        rotulo: rotulo(304, 168, 'start'),
      },
      alto: {
        trazo: cota([50, 100], [50, 150], [[[80, 100], [44, 100]], [[80, 150], [44, 150]]]),
        rotulo: rotulo(42, 130, 'end'),
      },
      largo: {
        trazo: cota([80, 180], [260, 180], [[[80, 155], [80, 186]], [[260, 155], [260, 186]]]),
        rotulo: rotulo(170, 205),
      },
    },
  },
  anillo: {
    viewBox: '0 0 400 220',
    pieza: [
      circulo(100, 100, 60, '#eaeef2'),
      circulo(100, 100, 32, '#ffffff'),
      contorno('M200 80 H320 V120 H200 Z'),
      oculta('M228 80 V120 M292 80 V120'),
    ],
    cotas: {
      diametro_exterior: {
        trazo: cota([40, 185], [160, 185], [[[40, 100], [40, 191]], [[160, 100], [160, 191]]]),
        rotulo: rotulo(100, 208),
      },
      diametro_interior: {
        trazo: cota([68, 32], [132, 32], [[[68, 100], [68, 26]], [[132, 100], [132, 26]]]),
        rotulo: rotulo(100, 20),
      },
      altura: {
        trazo: cota([335, 80], [335, 120], [[[320, 80], [341, 80]], [[320, 120], [341, 120]]]),
        rotulo: rotulo(345, 105, 'start'),
      },
    },
  },
  disco: {
    viewBox: '0 0 400 220',
    pieza: [
      circulo(100, 100, 60, '#eaeef2'),
      arista('M97 100 H103 M100 97 V103'),
      contorno('M200 90 H320 V110 H200 Z'),
    ],
    cotas: {
      diametro: {
        trazo: cota([40, 185], [160, 185], [[[40, 100], [40, 191]], [[160, 100], [160, 191]]]),
        rotulo: rotulo(100, 208),
      },
      espesor: {
        trazo: cota([335, 90], [335, 110], [[[320, 90], [341, 90]], [[320, 110], [341, 110]]]),
        rotulo: rotulo(345, 105, 'start'),
      },
    },
  },
});

function listar(nombres) {
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres.join('');
}

// Devuelve el esquema de la forma como marcado SVG. Lanza un error si la forma no existe.
export function esquemaDeForma(idForma) {
  const forma = buscarForma(idForma);
  const dibujo = Object.hasOwn(DIBUJOS, String(idForma)) ? DIBUJOS[idForma] : undefined;
  if (!forma || !dibujo) {
    throw new Error(`Forma desconocida: ${idForma}`);
  }

  const grupos = forma.medidas.map(({ id, nombre }) => {
    const cotaDeMedida = dibujo.cotas[id];
    if (!cotaDeMedida) {
      throw new Error(`Falta la cota de ${id} en el esquema de ${forma.id}`);
    }
    const { x, y, alineacion } = cotaDeMedida.rotulo;
    return (
      `<g data-medida="${escapar(id)}">${cotaDeMedida.trazo}` +
      `<text x="${x}" y="${y}" text-anchor="${alineacion}" fill="${COLOR_TEXTO}" font-size="14">${escapar(nombre)}</text></g>`
    );
  });

  const idTitulo = `esquema-titulo-${forma.id}`;
  const titulo = `${forma.nombre}: esquema con ${listar(forma.medidas.map(({ nombre }) => nombre))}.`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${dibujo.viewBox}" role="img" aria-labelledby="${escapar(idTitulo)}" font-family="system-ui, sans-serif">` +
    `<title id="${escapar(idTitulo)}">${escapar(titulo)}</title>` +
    dibujo.pieza.join('') +
    grupos.join('') +
    '</svg>'
  );
}
