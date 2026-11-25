# Borrador de capa de stack: HTML, CSS y JavaScript sin dependencias

Propuesta para `brain/oficio/stacks/html-css-javascript/`. Surge de la Fundación de `calculadora-pesos`. Vale para sitios en HTML, CSS y JavaScript sin framework ni paso de build, probados con el test runner de Node.

- **HJ-01. Módulos ES nativos.** El código usa `import` y `export`, y el navegador lo carga con `<script type="module">`. Sin bundler ni transpilador.
- **HJ-02. Sin dependencias de npm.** `package.json` existe solo para declarar `"type": "module"`. Sumar una dependencia es una decisión que se declara en la spec (`oficio/base/seguridad.md#S-17`).
- **HJ-03. Los tests usan `node:test` y `node:assert/strict`.** Viven en `tests/`, con nombre `*.test.js`, e importan los módulos de la aplicación por ruta relativa.
- **HJ-04. Los módulos que se prueban en Node no usan APIs del navegador.** `document`, `window` y el DOM quedan solo en el módulo de interfaz.
- **HJ-05. Comparaciones numéricas con redondeo explícito.** Cuando el resultado se muestra con una cantidad fija de decimales, los tests comparan el valor ya redondeado, no el número en coma flotante crudo.
- **HJ-06. Sin código que el navegador actual no soporte.** Se usa JavaScript estándar soportado por las últimas versiones de los navegadores principales, sin polyfills.
