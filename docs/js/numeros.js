// Lectura de números escritos por quien usa la aplicación: acepta coma o punto decimal.

// Un signo opcional, dígitos y a lo sumo un separador decimal. Sin separadores de miles.
const NUMERO = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/;

// Devuelve el número leído, o NaN si el texto no es un número.
export function leerNumero(texto) {
  const limpio = String(texto ?? '').trim();
  if (!NUMERO.test(limpio)) {
    return Number.NaN;
  }
  return Number(limpio.replace(',', '.'));
}
