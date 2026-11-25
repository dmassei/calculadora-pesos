// Conecta el formulario con la lógica. Es el único módulo que toca el DOM.
import { FORMAS, camposDeForma } from './formas.js';
import { MATERIALES, buscarMaterial } from './materiales.js';
import { calcularPieza } from './calculo.js';
import { formatearDensidad } from './formato.js';
import { esquemaDeForma } from './esquemas.js';

const formulario = document.getElementById('calculadora');
const selectorForma = document.getElementById('forma');
const selectorMaterial = document.getElementById('material');
const contenedorMedidas = document.getElementById('medidas');
const contenedorEsquema = document.getElementById('esquema');
const textoDensidad = document.getElementById('densidad');
const enlaceFuente = document.getElementById('fuente');
const resultado = document.getElementById('resultado');

// Medidas que quien usa la aplicación ya editó: sus errores se muestran sin esperar a "Calcular".
let medidasTocadas = new Set();

function agregarOpciones(selector, elementos) {
  for (const { id, nombre } of elementos) {
    selector.append(new Option(nombre, id));
  }
}

function idCampo(idMedida) {
  return `medida-${idMedida}`;
}

function idError(idMedida) {
  return `error-${idMedida}`;
}

function construirCampos() {
  const textosPrevios = leerMedidas();
  medidasTocadas = new Set();
  contenedorMedidas.replaceChildren();

  for (const { id, etiqueta } of camposDeForma(selectorForma.value)) {
    const grupo = document.createElement('div');
    grupo.className = 'campo';

    const rotulo = document.createElement('label');
    rotulo.htmlFor = idCampo(id);
    rotulo.textContent = etiqueta;

    const campo = document.createElement('input');
    campo.id = idCampo(id);
    campo.name = id;
    campo.type = 'text';
    campo.inputMode = 'decimal';
    campo.autocomplete = 'off';
    campo.setAttribute('aria-describedby', idError(id));
    campo.value = textosPrevios[id] ?? '';
    campo.addEventListener('input', () => medidasTocadas.add(id));

    const error = document.createElement('p');
    error.id = idError(id);
    error.className = 'error';

    grupo.append(rotulo, campo, error);
    contenedorMedidas.append(grupo);
  }
}

// Reemplaza el esquema anterior por el de la forma elegida. El marcado sale de esquemas.js,
// que lo arma solo con las definiciones de formas.js: no lleva datos de quien usa la página.
function mostrarEsquema() {
  contenedorEsquema.innerHTML = esquemaDeForma(selectorForma.value);
}

function leerMedidas() {
  const textos = {};
  for (const campo of contenedorMedidas.querySelectorAll('input')) {
    textos[campo.name] = campo.value;
  }
  return textos;
}

function mostrarDensidad() {
  const material = buscarMaterial(selectorMaterial.value);
  textoDensidad.textContent = formatearDensidad(material.densidad_g_cm3);
  enlaceFuente.href = material.fuente;
}

function mostrarErrores(errores, mostrarTodos) {
  const mensajes = new Map();
  for (const { medida, mensaje } of errores) {
    if (!mensajes.has(medida)) {
      mensajes.set(medida, mensaje);
    }
  }
  for (const { id } of camposDeForma(selectorForma.value)) {
    const visible = mensajes.has(id) && (mostrarTodos || medidasTocadas.has(id));
    const campo = document.getElementById(idCampo(id));
    document.getElementById(idError(id)).textContent = visible ? mensajes.get(id) : '';
    campo.setAttribute('aria-invalid', String(visible));
  }
}

function actualizar(mostrarTodos = false) {
  const calculo = calcularPieza({
    forma: selectorForma.value,
    material: selectorMaterial.value,
    medidas: leerMedidas(),
  });

  if (calculo.errores) {
    mostrarErrores(calculo.errores, mostrarTodos);
    const nombres = [...new Set(calculo.errores.map(({ nombre }) => nombre))];
    const sinEmpezar = !mostrarTodos && medidasTocadas.size === 0;
    resultado.textContent = sinEmpezar
      ? 'Cargá las medidas para ver el peso.'
      : `Revisá: ${nombres.join(', ')}.`;
    resultado.classList.remove('con-peso');
    return;
  }

  mostrarErrores([], mostrarTodos);
  resultado.textContent = `Peso: ${calculo.texto}`;
  resultado.classList.add('con-peso');
}

agregarOpciones(selectorForma, FORMAS);
agregarOpciones(selectorMaterial, MATERIALES);
mostrarEsquema();
construirCampos();
mostrarDensidad();
actualizar();

selectorForma.addEventListener('change', () => {
  mostrarEsquema();
  construirCampos();
  actualizar();
});
selectorMaterial.addEventListener('change', () => {
  mostrarDensidad();
  actualizar();
});
contenedorMedidas.addEventListener('input', () => actualizar());
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  actualizar(true);
});
