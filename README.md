# Química Interactiva

Aplicación web para estudiar química general, inorgánica y orgánica en 2D y 3D: desde la preparación para el
examen de admisión (San Marcos, UNI y otras universidades del Perú) hasta la química general universitaria.

- Interfaz en español; nomenclatura tradicional, Stock e IUPAC.
- Funciona sin conexión e instalable como aplicación (PWA).
- Datos de fuentes públicas citadas (PubChem, CODATA/NIST).

## Uso local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # pruebas
npm run build     # compilación de producción en dist/
npm run preview   # sirve dist/ para probar la versión instalable
```

## Despliegue

Cada push a `main` ejecuta las pruebas, compila y publica en GitHub Pages
(`.github/workflows/deploy.yml`). En el repositorio: **Settings → Pages → Source: GitHub Actions**.

## Créditos

Ver la página «Créditos y fuentes» dentro de la aplicación.
