# Contexto — calculadora-pesos

## Qué es
Una calculadora de peso de piezas metálicas. Quien la usa elige la forma de la pieza, carga sus medidas en milímetros y elige el material. La aplicación muestra el peso en kilogramos, con tres decimales: el volumen de la forma por la densidad del material.

## Para quién
Una persona que necesita estimar el peso de una pieza para cotizar, comprar o mover material. La usa desde el navegador, en escritorio o en el celular.

## Cómo se entrega
Aplicación web estática, sin servidor, publicada con GitHub Pages desde la carpeta `docs/`. Calcula sin conexión y no guarda datos.

## Alcance según el pedido
- Formas: barra cilíndrica, barra cuadrada, barra prismática, anillo y disco. Al elegir la forma se muestran solo sus medidas.
- Materiales: diez, con nombre, densidad en g/cm³ y fuente. La tabla vive en un único archivo de datos y la aplicación muestra la densidad del material elegido.
- Las medidas tienen que ser mayores que cero; en el anillo, el diámetro interior menor que el exterior. Con una medida inválida no se muestra un peso, sino qué medida corregir.
- Acepta decimales con coma o con punto. La interfaz está en español.
- Solo muestra el peso: no calcula cantidades, costos ni totales.

## Ejemplos que tienen que dar exacto
- Barra cilíndrica, diámetro 50 mm, largo 1000 mm, acero al carbono (7,85 g/cm³): 15,413 kg.
- Anillo, diámetro exterior 100 mm, diámetro interior 60 mm, altura 20 mm, cobre (8,94 g/cm³): 0,899 kg.

## Supuestos del pedido
- El disco se calcula como un cilindro corto y se ofrece aparte por comodidad.
- Las densidades son valores típicos publicados; varían hasta alrededor de un 1 % según la fuente y la aleación.
- Bronce y superaleaciones son familias: se eligieron el bronce fosforoso y tres superaleaciones comunes como representantes.
