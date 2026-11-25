# calculadora-pesos

Calculadora de peso de piezas metálicas por forma, medidas y material. Elegís la forma, cargás las medidas en milímetros y elegís el material: la aplicación muestra el peso en kilogramos, con tres decimales.

## Cómo se usa

Es una página web estática, sin servidor, publicada con GitHub Pages desde la carpeta `docs/`. Para probarla localmente, serví esa carpeta con cualquier servidor estático, por ejemplo:

```sh
python3 -m http.server --directory docs
```

y abrí `http://localhost:8000`.

## Cómo se prueba

Hace falta Node 22 o posterior. No hay nada que instalar:

```sh
mkdir -p reportes && node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination=reportes/junit.xml "tests/**/*.test.js"
```

El informe JUnit queda en `reportes/junit.xml`.

## Estructura

- `docs/`: la aplicación publicada.
- `tests/`: los tests.
- `.factory/`: el contrato con el factory, el Brain del proyecto y las specs.
