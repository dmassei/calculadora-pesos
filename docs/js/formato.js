// Redondeo y textos que muestra la interfaz.

// Redondeo a tres decimales. Se pasa antes por 12 cifras significativas para que un valor
// como 0.89875, que en binario queda apenas por debajo, redondee hacia arriba como en papel.
export function redondear3(valor) {
  return Math.round(Number((valor * 1000).toPrecision(12))) / 1000;
}

export function formatearPeso(kilos) {
  return `${redondear3(kilos).toFixed(3).replace('.', ',')} kg`;
}

export function formatearDensidad(densidad) {
  return `Densidad: ${String(densidad).replace('.', ',')} g/cm³`;
}
