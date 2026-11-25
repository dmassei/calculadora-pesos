# Borrador de capa de tipo: app-web

Propuesta para `brain/oficio/tipos/app-web/`. Surge de la Fundación de `calculadora-pesos`; no existe todavía una capa para este tipo. Reglas pensadas para aplicaciones web que corren en el navegador.

- **AW-01. La lógica no toca el DOM.** Cálculos, validaciones y transformación de datos viven en módulos que se pueden probar sin navegador. La interfaz solo lee el formulario, llama a esa lógica y muestra el resultado.
- **AW-02. El texto que viene de afuera se inserta como texto.** Para mostrar datos del usuario o de archivos se usa `textContent` o equivalentes; no se arma HTML concatenando datos.
- **AW-03. Sin recursos de terceros en tiempo de ejecución.** Scripts, estilos y fuentes se sirven desde el propio sitio. Si una spec declara una excepción, el recurso se carga por HTTPS y con integridad (`integrity`).
- **AW-04. Funciona en escritorio y en celular.** La página declara `viewport`, el diseño se adapta a pantallas angostas y los controles se pueden usar con el dedo.
- **AW-05. Accesible por defecto.** Cada campo tiene su etiqueta asociada, los errores se anuncian junto al campo que hay que corregir y todo se puede operar con teclado.
- **AW-06. El idioma de la interfaz se declara.** El elemento `html` lleva el atributo `lang` del idioma de la interfaz.
- **AW-07. Los errores de validación dicen qué corregir.** Ante una entrada inválida no se muestra un resultado parcial ni un valor por defecto: se indica qué campo corregir y por qué.
- **AW-08. Los datos de referencia viven en un solo archivo.** Tablas como listas de opciones o constantes del dominio se definen una vez y la interfaz las lee de ahí (`oficio/base/principios.md#P-08`).
