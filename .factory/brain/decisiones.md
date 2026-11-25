# Decisiones — calculadora-pesos

## D-01. Tipo: aplicación web estática
El pedido exige una aplicación sin servidor, publicada como sitio estático y usable desde el navegador. Tipo declarado: `app-web`.

## D-02. Stack: HTML, CSS y JavaScript sin dependencias
La aplicación es HTML, CSS y JavaScript en módulos ES, sin framework, sin paso de build y sin paquetes de npm. El navegador carga directamente los archivos de `docs/`.

Por qué: es la opción con menos piezas que cumple el pedido. La lógica es aritmética sobre cinco formas y una tabla de diez materiales; un framework o un bundler no agregan nada y suman instalación, build y dependencias que mantener.

Descartadas:
- Un framework de interfaz (React, Vue, Svelte): exige build y dependencias que el pedido no necesita.
- TypeScript: exige un paso de compilación.
- Un generador de sitios estáticos: no hay contenido que generar.

## D-03. Pruebas: test runner de Node, sin dependencias
Los tests corren con `node --test`, que viene con Node, y dejan el informe JUnit con el reporter incluido en `reportes/junit.xml`. No hace falta instalar nada: el contrato no declara comando de instalación.

Node se usa solo para probar; la aplicación publicada no lo necesita. Hace falta Node 22 o posterior, por el reporter JUnit y los patrones de archivos en `--test`.

Descartadas:
- Jest o Vitest: dependencias de npm y un paso de instalación para algo que Node ya trae.
- Un navegador automatizado (Playwright, Puppeteer): descarga navegadores y vuelve lentos y frágiles los tests. Se puede sumar más adelante si una spec necesita probar la interfaz renderizada.

## D-04. Cómo se organiza el código para poder probarlo
Para que Node y el navegador usen el mismo código, la lógica vive en módulos ES dentro de `docs/` y no toca el DOM (`oficio/base/principios.md#P-07`): cálculo de volúmenes, conversión de unidades, lectura de números con coma o punto y validación de medidas. Los tests de `tests/` importan esos módulos directamente. La interfaz es un módulo aparte que solo conecta el formulario con esa lógica.

`package.json` existe solo para declarar `"type": "module"`, de modo que Node trate los `.js` como módulos ES igual que el navegador. No lleva dependencias.

## D-05. Publicación: GitHub Pages desde `docs/`
Todo lo publicable vive en `docs/`, y el contrato declara `github-pages` con carpeta `/docs`. Así los tests, el Brain y la configuración del proyecto no se publican.

## D-06. Revisores
Se activan los cuatro: código y seguridad, y además UX y UI porque el proyecto es una interfaz que se usa desde el navegador y el celular.
