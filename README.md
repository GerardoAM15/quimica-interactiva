# Química Interactiva

Aplicación web para estudiar química general, inorgánica y orgánica en 2D y 3D: desde la preparación para el
examen de admisión (San Marcos, UNI y otras universidades del Perú) hasta la química general universitaria.

- **24 módulos** en 7 bloques: átomo y tabla periódica, enlace y moléculas, química inorgánica y reacciones, estados
  de la materia y soluciones, termoquímica/cinética/equilibrio, ácidos-bases y electroquímica, y química orgánica.
- **Simulaciones y 3D:** orbitales, moléculas (conformeros de PubChem), redes cristalinas, muestras de los elementos y
  compuestos, gases, titulación, pila galvánica, Le Chatelier…
- **Cálculos explicados:** cada resultado tiene «Ver paso a paso» y cada módulo su panel de «Teoría».
- **Modo estudio:** quiz, tarjetas con repetición espaciada (SM-2), simulacros de admisión cronometrados (A–E) y
  hojas de trabajo imprimibles en A4 con hoja de respuestas.
- **En español**, con nomenclatura tradicional, Stock e IUPAC.
- **Funciona sin conexión** e instalable como aplicación (PWA).
- **Datos citados** (PubChem, CODATA/NIST, CRC, Chang, Brown); lo no verificado se marca «pendiente de revisión».

## Uso local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev         # http://localhost:5173
npm test            # pruebas (y regenera docs/tabla_validacion.md)
npm run build       # compilación de producción en dist/
npm run preview     # sirve dist/ para probar la versión instalable y sin conexión
npm run datos       # vuelve a descargar los datos de PubChem, NIST y CODATA
npm run pendientes  # lista los datos pendientes de revisión
```

## Documentación

- [Manual de usuario](docs/manual_usuario.md)
- [Informe técnico](docs/informe_tecnico.md)
- [Tabla de validación](docs/tabla_validacion.md)
- [Datos](docs/datos.md) · [Nomenclatura](docs/nomenclatura.md) · [Pendientes de revisión](docs/pendientes_revision.md)
- [Especificación del proyecto](prompt_quimica_interactiva.md)

## Estructura

```
src/chem/      química (funciones puras, con pruebas)
src/study/     generadores de preguntas, SM-2, simulacros
src/modules/   un componente por módulo
src/components/, src/pages/, src/store/, src/lib/   interfaz
src/data/      datos con fuente citada
scripts/       descarga y preparación de datos
docs/          documentación
```

## Despliegue

Cada push a `main` ejecuta las pruebas, compila y publica en GitHub Pages
(`.github/workflows/deploy.yml`). En el repositorio: **Settings → Pages → Source: GitHub Actions**.

## Créditos

Fuentes de datos y software de terceros con sus licencias: página «Créditos y fuentes» de la aplicación
(`src/data/fuentes.ts`). Proyecto personal de estudio.
