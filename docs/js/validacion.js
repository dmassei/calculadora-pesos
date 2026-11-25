// Validación de las medidas de una pieza.
import { camposDeForma } from './formas.js';
import { leerNumero } from './numeros.js';

// Devuelve { valores, errores }. Cada error identifica la medida por id y por nombre.
// Si hay errores, `valores` es null: con una medida inválida no se calcula nada.
export function validarMedidas(idForma, textos = {}) {
  const errores = [];
  const valores = {};

  for (const { id, nombre, articulo } of camposDeForma(idForma)) {
    const sujeto = `${articulo.charAt(0).toUpperCase()}${articulo.slice(1)} ${nombre}`;
    const texto = String(textos[id] ?? '').trim();
    const valor = leerNumero(texto);
    if (texto === '') {
      errores.push({ medida: id, nombre, mensaje: `Ingresá ${articulo} ${nombre}.` });
    } else if (Number.isNaN(valor)) {
      errores.push({ medida: id, nombre, mensaje: `${sujeto} tiene que ser un número.` });
    } else if (!(valor > 0)) {
      errores.push({ medida: id, nombre, mensaje: `${sujeto} tiene que ser mayor que cero.` });
    } else {
      valores[id] = valor;
    }
  }

  const interiorYExteriorValidos =
    'diametro_interior' in valores && 'diametro_exterior' in valores;
  if (interiorYExteriorValidos && valores.diametro_interior >= valores.diametro_exterior) {
    errores.push({
      medida: 'diametro_interior',
      nombre: 'diámetro interior',
      mensaje: 'El diámetro interior tiene que ser menor que el exterior.',
    });
  }

  return errores.length > 0 ? { valores: null, errores } : { valores, errores };
}
