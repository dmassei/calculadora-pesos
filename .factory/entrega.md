# Entrega — spec 1: calculadora de pesos

## Verificación

Corrí el comando `verificar.tests` del contrato, sin cambios: 34 tests, 34 pasan, 0 fallan, 0 salteados. El informe JUnit queda en `reportes/junit.xml` (34 `testcase`, sin `failure` ni `skipped`). No toqué el bloque `verificar` ni el test de humo.

## Qué se construyó

Todo en `docs/`, en módulos ES sin dependencias ni build (D-02, D-04):

| Archivo | Qué hace | DOM |
|---|---|---|
| `docs/js/materiales.js` | Único archivo de datos de materiales: nombre, densidad en g/cm³ y fuente. | No |
| `docs/js/formas.js` | Las cinco formas, sus medidas en orden con su etiqueta en mm, y su volumen en mm³. `camposDeForma` dice qué campos mostrar. | No |
| `docs/js/numeros.js` | Lee números con coma o con punto; lo que no es un número da `NaN`. | No |
| `docs/js/validacion.js` | Valida las medidas: vacías, no numéricas, no mayores que cero y, en el anillo, interior menor que exterior. Cada error nombra su medida. | No |
| `docs/js/formato.js` | Redondeo a tres decimales y textos de peso (`15,413 kg`) y densidad (`8,94 g/cm³`). | No |
| `docs/js/calculo.js` | Peso = volumen × densidad / 1 000 000. `calcularPieza` recibe una sola pieza y devuelve `{ peso, texto }` o `{ errores }`, nunca las dos cosas. | No |
| `docs/js/interfaz.js` | Arma los selectores y los campos desde las definiciones, muestra la densidad y su fuente, y el peso o qué medida corregir. | Sí |
| `docs/index.html`, `docs/estilos.css` | Página en español, adaptable a celular, sin recursos externos. | — |

## Criterios y tests que los cubren

| Criterio | Tests |
|---|---|
| C-01 | `tests/calculo.test.js` › "C-01: barra cilíndrica 50 × 1000 de acero al carbono pesa 15,413 kg" |
| C-02 | `tests/calculo.test.js` › "C-02: anillo 100/60 × 20 de cobre pesa 0,899 kg" |
| C-03 | `tests/calculo.test.js` › "C-03: las 50 combinaciones de forma y material…" y "C-03: casos de control" |
| C-04 | `tests/formas.test.js` › "C-04: las formas son exactamente las cinco del anexo, en orden" y "C-04: cada forma pide exactamente sus medidas, en orden, rotuladas en español y en mm" |
| C-05 | `tests/formas.test.js` › los tres tests "C-05: …" (campos por forma, exclusiones de Disco y Barra cilíndrica, HTML sin `<input>` fijos e interfaz que usa `camposDeForma`) |
| C-06 | `tests/materiales.test.js` › "C-06: la tabla tiene exactamente los diez materiales del anexo…", "C-06: ningún otro archivo de docs/ repite las densidades…" y "C-06: los demás archivos de docs/ no contienen otra tabla de materiales" |
| C-07 | `tests/materiales.test.js` › "C-07: el texto de densidad de cada material sale de la tabla, con coma decimal" |
| C-08 | `tests/validacion.test.js` › "C-08: \"12,5\" y \"12.5\" se leen como 12.5…"; `tests/calculo.test.js` › "C-08: diámetro \"25,4\" y \"25.4\" dan el mismo peso…" |
| C-09 | `tests/validacion.test.js` › "C-09: cada medida en \"0\", \"-5\" o vacía…", "C-09: barra cilíndrica con largo \"0\"…" y "C-09: con varias medidas inválidas se identifican todas" |
| C-10 | `tests/validacion.test.js` › "C-10: \"abc\", \"1,2,3\" y \"1.2.3\" no dan peso…" |
| C-11 | `tests/validacion.test.js` › "C-11: anillo con interior igual o mayor que el exterior…" y "C-11: anillo con interior 99,9…" |
| C-12 | `tests/formato.test.js` › "C-12: el formato es siempre tres decimales, coma decimal y kg" |
| C-13 | `tests/estatica.test.js` › "C-13: ningún recurso cargado por el HTML apunta a una URL absoluta" y "C-13: ningún .js hace pedidos de red ni importa de URLs absolutas" |
| C-14 | `tests/estatica.test.js` › "C-14: ningún .js guarda datos" |
| C-15 | `tests/estatica.test.js` › "C-15: index.html no tiene campos ni textos…"; `tests/calculo.test.js` › "C-15: la lógica recibe una sola pieza y devuelve un solo peso" |
| C-16 | `tests/estatica.test.js` › los cuatro tests "C-16: …" (lang, viewport y módulo local; etiquetas de los selectores; etiquetas de los campos generados; textos y mensajes en español) |
| C-17 | `tests/estatica.test.js` › "C-17: los módulos de lógica no usan APIs del DOM" y "C-17: los módulos de lógica se importan en Node sin errores"; además, toda la suite corre con el comando del contrato sin skips |

Los tests comparan contra el anexo del pedido, copiado en `tests/ayuda.js`, no contra la tabla de la aplicación: si alguien cambia una densidad en `docs/js/materiales.js`, C-03 y C-06 fallan.

## Zonas tocadas

- `docs/`: `index.html` (modificado) y archivos nuevos `estilos.css` y `js/*.js`.
- `tests/`: archivos nuevos `ayuda.js` (utilidades, no es un test), `calculo.test.js`, `formas.test.js`, `materiales.test.js`, `validacion.test.js`, `formato.test.js` y `estatica.test.js`.
- `.factory/entrega.md`: este archivo, como pidió el workflow.

`tests/humo.test.js` sigue sin cambios y `docs/index.html` sigue empezando con `<!doctype html>`. No sumé dependencias: `package.json` no cambió.

## Decisiones dentro de la spec

- **Archivo de datos como módulo JS.** La tabla de materiales es `docs/js/materiales.js` y no un `.json`: leer un `.json` desde el navegador exige `fetch`, y C-13 lo prohíbe. Importar el `.json` como módulo (`with { type: 'json' }`) evitaría `fetch`, pero no todos los navegadores actuales lo soportan (HJ-06).
- **Redondeo.** `redondear3` pasa el valor por 12 cifras significativas antes de `Math.round`, para que 0.89875, que en binario queda apenas por debajo, dé 0,899 como pide C-12.
- **Densidad en pantalla.** Se muestra tal como está en la tabla, con coma: `8 g/cm³` para los inoxidables, `8,94 g/cm³` para el cobre. La spec no fija cuántos decimales lleva la densidad.
- **Cuándo se ven los errores.** El peso se recalcula a cada tecla. El error de un campo aparece cuando ese campo ya se editó, o en todos los campos al apretar "Calcular". Al abrir la página, el resultado dice "Cargá las medidas para ver el peso." en lugar de listar errores de campos que nadie tocó todavía. Con alguna medida inválida nunca se muestra un peso.
- **Fuente del material.** Junto a la densidad hay un enlace de texto "(fuente)" que abre la URL de la tabla. C-13 lo permite porque es un enlace, no un recurso cargado.

## Objeciones y avisos

- Sin objeciones a la spec.
- C-16 pide que cada campo generado tenga una etiqueta asociada, y D-03 no permite usar un navegador en los tests. Por eso el test revisa dos cosas: que las etiquetas de la definición de formas estén en español y en mm, y que `interfaz.js` cree un `<label>` asociado al campo por `id`. Esa segunda parte lee el código fuente, así que depende de la implementación (P-17). Lo dejo dicho para el revisor.
- `README.md` del proyecto ya figuraba modificado en el árbol de trabajo antes de que yo empezara. No lo toqué y está fuera de las zonas de esta spec.
