# Entrega — spec 3: esquema rotulado de cada forma

## Verificación

Corrí el comando `verificar.tests` del contrato sin cambios: 49 tests (34 que ya estaban y 15 nuevos). Pasan los 49, no falla ninguno y no hay salteados. El informe JUnit queda en `reportes/junit.xml`, con 49 `testcase` y ningún `failure` ni `skipped`. No toqué el bloque `verificar`, `package.json` ni ningún test existente.

## Qué se construyó

- **`docs/js/esquemas.js`** (nuevo, sin DOM). `esquemaDeForma(idForma)` devuelve el esquema de la forma como marcado SVG en texto. Recorre las medidas de `buscarForma` (`docs/js/formas.js`) y arma un grupo `<g data-medida="ID">` por cada una, con su cota (una línea con flechas y líneas de referencia punteadas) y un `<text>` con el `nombre` de la medida. Si una medida no tiene cota dibujada, o si el id no es de una forma, lanza un error. El `<svg>` lleva `viewBox`, `role="img"` y `aria-labelledby`, y su primer hijo es un `<title id="esquema-titulo-<forma>">` con el texto «Anillo: esquema con diámetro exterior, diámetro interior y altura.». Los nombres pasan por un escape de HTML.
- **Dibujos.** Barra cilíndrica: vista lateral con la cara del extremo como elipse. Barra cuadrada y barra prismática: perspectiva oblicua. Anillo y disco: vista de frente (circunferencias) y vista lateral (rectángulo; en el anillo, el agujero en líneas ocultas). Solo se dibujan las cotas de las medidas de cada forma.
- **`docs/index.html`**: `<div id="esquema"></div>` vacío dentro del fieldset «Medidas», antes de `#medidas`.
- **`docs/js/interfaz.js`**: importa `esquemaDeForma` y agrega `mostrarEsquema()`, que reemplaza el contenido de `#esquema` con `innerHTML = esquemaDeForma(selectorForma.value)`. Se llama al iniciar y en el manejador de `change` del selector de forma.
- **`docs/estilos.css`**: `#esquema svg { display: block; width: 100%; max-width: 100%; height: auto; }` y un margen para el contenedor.

## Criterios y tests que los cubren

Todos los tests nuevos están en `tests/esquemas.test.js`.

| Criterio | Tests |
|---|---|
| C-01 | «C-01: cada forma tiene un único `<svg>` y los cinco esquemas son distintos»; «C-01: con un id que no es de ninguna forma, lanza un error» (incluye `toString`, `__proto__` y `constructor`) |
| C-02 | «C-02: cada esquema tiene un grupo por medida, con su cota y su nombre, y nada más»; «C-02: ejemplos del pedido — anillo y barra prismática» |
| C-03 | «C-03: la función recibe solo el id, los rótulos no tienen números y el resultado es siempre el mismo» |
| C-04 | «C-04: cada esquema tiene role="img" y un `<title>` con la forma y sus medidas, referenciado y con id propio» |
| C-05 | «C-05: index.html tiene un único #esquema vacío y ningún `<svg>`»; «C-05: la interfaz reemplaza el esquema con el de la forma elegida al iniciar y al cambiar de forma»; «C-05: el esquema de barra prismática no tiene nada del anillo» |
| C-06 | «C-06: #esquema está dentro del fieldset "Medidas", junto a #medidas» |
| C-07 | «C-07: los esquemas no cargan imágenes, recursos ni código»; «C-07: docs/ no tiene archivos de imagen y package.json no tiene dependencias»; además siguen pasando los dos tests C-13 de `tests/estatica.test.js` |
| C-08 | «C-08: cada `<svg>` tiene viewBox de cuatro números y no fija width ni height»; «C-08: estilos.css hace que el svg de #esquema se adapte al ancho» |
| C-09 | «C-09: esquemas.js se importa en Node y no usa APIs del navegador»; todos los tests corren con el comando del contrato, sin skips |
| C-10 | Sin test automático: comparar con la rama base exige el historial de git, que los tests no tienen. Lo comprobé con `git diff`: `calculo.js`, `numeros.js`, `validacion.js`, `formato.js`, `materiales.js` y `formas.js` no tienen cambios. |
| C-11 | Lo mismo: `git diff -- tests/` no muestra cambios en archivos existentes (solo se suma `tests/esquemas.test.js`). Los 34 tests anteriores pasan con el comando del contrato, incluidos C-15 (sin «total», «cantidad», «precio» ni «costo») y C-16 (armado de etiquetas en `interfaz.js`). |

## Zonas tocadas

- `docs/js/esquemas.js` (nuevo), `docs/js/interfaz.js`, `docs/index.html` y `docs/estilos.css`.
- `tests/esquemas.test.js` (nuevo).
- `.factory/entrega.md`: este archivo, como pide el workflow.

Todo lo tocado está dentro de las zonas de la spec. No sumé dependencias.

## Decisiones dentro de la spec

- **`innerHTML` en la interfaz.** La spec lo admite para reemplazar el contenido. El marcado lo arma `esquemas.js` solo con las definiciones de `formas.js` y un id que sale del `<select>`, cuyas opciones vienen de `FORMAS`; un id que no es de una forma lanza un error antes de tocar el DOM. No entra texto de quien usa la página, así que AW-02 no aplica. Igual escapo los nombres por si alguna vez llevan `&` o `<`.
- **Flechas sin `<marker>`.** Las puntas de flecha se dibujan con `<polyline>`. Un `<marker>` exige `marker-end="url(#…)"`, y C-07 prohíbe `url(...)`.
- **Esquema antes de los campos.** Dentro del fieldset, el esquema va arriba y los campos abajo. En una columna de 32rem no entra uno al lado del otro sin achicar el dibujo.
- **Colores como atributos del SVG.** Así el esquema no depende de `<style>`, que C-07 prohíbe dentro del SVG. Usé los mismos grises y azules que `estilos.css`.

## Objeciones y avisos

- Sin objeciones a la spec.
- **No pude ver los esquemas renderizados.** En este entorno no hay navegador ni conversor de SVG, y D-03 no permite un navegador en los tests. Revisé a mano las coordenadas para que rótulos y cotas no se pisen y entren en el `viewBox`, pero el aspecto final queda para el revisor de UI.
- En un celular angosto (unos 300 px de ancho útil), los dibujos de `viewBox` 400 se achican y los rótulos de 14 unidades se ven a unos 10–11 px. Son legibles pero chicos; si el revisor de UI lo objeta, se puede agrandar `font-size` o achicar el `viewBox`.
- El test de C-05 sobre `interfaz.js` lee el código fuente (no hay DOM en los tests, D-03), así que depende de la forma del código, igual que el de C-16 de la spec 1.
- `.factory/specs/3-esquemas-de-formas.json` figura como archivo sin seguimiento en el árbol de trabajo; lo dejó el workflow y no lo toqué.
