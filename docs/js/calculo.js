// Cálculo del peso de una pieza: volumen geométrico por densidad.
import { buscarForma } from './formas.js';
import { buscarMaterial } from './materiales.js';
import { validarMedidas } from './validacion.js';
import { formatearPeso, redondear3 } from './formato.js';

// mm³ × g/cm³ da miligramos; dividido por un millón, kilogramos.
const MM3_POR_G_CM3_A_KG = 1_000_000;

// Peso en kg, sin redondear, de una pieza con medidas ya validadas en mm.
export function pesoEnKg(idForma, medidas, densidad) {
  const forma = buscarForma(idForma);
  if (!forma) {
    throw new Error(`Forma desconocida: ${idForma}`);
  }
  return (forma.volumen(medidas) * densidad) / MM3_POR_G_CM3_A_KG;
}

// Calcula una sola pieza a partir de lo que escribió quien usa la aplicación.
// Devuelve { peso, texto } si las medidas son válidas, o { errores } si no.
export function calcularPieza({ forma, material, medidas }) {
  const datosMaterial = buscarMaterial(material);
  if (!datosMaterial) {
    throw new Error(`Material desconocido: ${material}`);
  }
  const { valores, errores } = validarMedidas(forma, medidas);
  if (errores.length > 0) {
    return { errores };
  }
  const kilos = pesoEnKg(forma, valores, datosMaterial.densidad_g_cm3);
  return { peso: redondear3(kilos), texto: formatearPeso(kilos) };
}
