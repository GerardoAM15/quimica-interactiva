# Estado del proyecto

Documento de relevo: permite retomar el trabajo (con cualquier asistente) sin leer el historial.
**Se actualiza al final de cada fase.** Última actualización: 2026-11-12.

- Reglas del proyecto: `CLAUDE.md` (= `AGENTS.md`, copia idéntica).
- Especificación original (fases 0–12): `prompt_quimica_interactiva.md`.
- Plan de mejoras (fases M0–M3 y 9–12): `prompt_quimica_mejoras.md`.
- Repositorio: https://github.com/GerardoAM15/quimica-interactiva (rama `main`).

## Fase actual

**M3 — «Del mineral al producto»: terminada, en espera de la aprobación del autor** (commit local, sin subir).
Siguiente: **Fase 9 — Estereoquímica** (no empezar sin confirmación).

## Terminado

| Fase | Contenido | Commit |
|---|---|---|
| 0–3 | Proyecto, datos, módulos 1–11, tabla de solubilidad | hasta `4f42cb7` |
| 4 | Gases, soluciones, termoquímica (módulos 12–14) | `b624d8b` |
| 5 | Cinética, equilibrio, ácidos-bases, titulación, electroquímica (15–19) | `6c106f7` |
| 6 | Orgánica básica y nomenclatura IUPAC (20–24) | `9008f44` |
| — | Compuestos: red cristalina y muestra 3D a 25 °C | `0f1cd9a` |
| 7 | Modo estudio, simulacros y hojas de trabajo imprimibles | `5023300` |
| 8 | Uso sin conexión completo, accesibilidad, documentación, README | `e608c57` |
| M0 | `AGENTS.md`, `docs/ESTADO.md`, `prompt_quimica_mejoras.md` | `ae0af9c` |
| M1 | Aviso «sin conexión» (5 s, una vez), lienzo del constructor según el tema, `docs/revision_datos.md` | `31070b4` |
| M2 | Muestras 3D por presentación, «En la vida diaria», Vitrina 3D | `6b86c0d` |
| M3 | «Del mineral al producto» (41 elementos), selector de la vitrina, enlace al balanceador | (commit local, sin subir) |

Todo hasta M2 está en `origin/main`. Validación: 28 archivos de prueba, 1296 pruebas en verde.

## M2 — qué quedó hecho y qué difiere de la especificación

Hecho: presentación por elemento (bloque `presentaciones` de `apariencia.json`), geometría procedural por
presentación sobre pedestal oscuro, encuadre automático, ACES, efectos (iridiscencia Bi, pátina opcional Cu,
opaco Pb, diamante, vidrio con transmisión), tubos de descarga (núcleo sin mapeo de tonos + halo + vidrio +
electrodos), placa amarilla «sin muestra» con vida media, pestaña «En la vida diaria» (25 objetos), Vitrina 3D
(fondo claro, placa negra con símbolo y Z, misma presentación en miniatura, placas de aviso, acercamiento con
clic, botón «Volver a la vitrina», LOD + instancias, botón FPS, encuadre para móvil).

Diferencias conscientes con `prompt_quimica_mejoras.md` (pendientes de la decisión del autor):

- **Iluminación**: HDRI de estudio local (Poly Haven, CC0, 1,6 MB en el precache) en lugar de
  `RoomEnvironment` + `PMREMGenerator`. Lo pidió el autor en la primera versión de esta mejora y las capturas
  aprobadas (mercurio espejo, oro) se hicieron con él. Cambiarlo es una línea en `Escena3D`.
- **Flúor**: se muestra como gas amarillo pálido en matraz, no en tubo de descarga: no hay un color de
  emisión citado para el flúor y no se inventa.
- **`presentacion`** está en un bloque propio (`presentaciones`) dentro de `apariencia.json`, no dentro de
  cada entrada de `elementos`: ese bloque solo tiene los 34 elementos con color curado.
- Pa, Np, Pu y Am también figuran «sin muestra» (radiactivos que no se exhiben).
- Los tubos de descarga no llevan pedestal (se muestran suspendidos).

## M3 — qué quedó hecho y notas

Hecho: `src/data/obtencion.json` con 41 elementos (fuente natural, proceso, 36 ecuaciones, productos y nota «En
el Perú» para Cu, Au, Zn, Ag, Pb, Sn, Mo, Fe y P); pestaña «Del mineral al producto» con tres escenas 3D y
flechas; botón «Abrir en el balanceador»; seis objetos nuevos (calamina, saco, viga, olla, panel solar,
tubería); selector «Mineral / Puro / Producto» en la vitrina; pruebas de balanceo y de fórmulas.

Notas:

- Las posiciones del Perú provienen del Anuario Minero 2024 del MINEM (2.º en zinc y molibdeno, 3.º en cobre
  y plata, 4.º en estaño y plomo, 2.º de Sudamérica en oro), consultadas por medios secundarios; no se pudo
  leer el PDF del USGS. Todo queda «pendiente de revisión».
- Fórmulas no estequiométricas o con trazas (bauxita, pentlandita, monacita, Ga e In): se muestra
  `formulaTexto` y la prueba valida solo las que tienen `formula`.
- Los elementos sin ficha muestran un texto breve (artificiales, tierras raras) o «aún no hay una ficha».
- En modo «Producto» la vitrina dibuja un objeto por casillero sin instancias (cada objeto tiene varias
  mallas y algunos llevan luz propia): es el modo más costoso; falta medir sus FPS en equipo real.
- Con un solo producto conocido (Ne, K, Ca, Ga, Kr, Mo, Cd, In, Xe, Nd, W, Pt, Pb) la escena 3 muestra uno,
  no 2–3: no se añadieron productos de relleno.

## Falta

- **Revisión de datos (autor)**: comparar `docs/revision_datos.md` (664 filas, 24 tablas) con el libro y anotar
  las diferencias; después se corrigen los valores y se retira la marca «pendiente de revisión».
- **Fases 9–12**: estereoquímica, mecanismos animados, espectroscopía, síntesis y biomoléculas.

## Decisiones tomadas

- Química propia en `src/chem/` (sin librerías que la resuelvan); RDKit solo para estructura molecular.
- Datos nunca inventados: lo dudoso lleva `pendienteRevision: true`; toda fuente en `src/data/fuentes.ts`.
- No se cambian valores de datos existentes sin confirmación del autor.
- Preguntas de estudio y examen originales, generadas con semilla reproducible.
- `AGENTS.md` pasó de estar prohibido a ser copia idéntica de `CLAUDE.md` (fase M0).
- Una fase a la vez; el autor confirma antes de subir a `main` y antes de pasar a la siguiente.
- Capturas de verificación fuera del repositorio (scratchpad).
- M1: el aviso «ya funciona sin conexión» se recuerda con la clave `qi-aviso-sin-conexion`; el aviso de
  «versión nueva» no se cierra solo (requiere una decisión del usuario).
- M1: el lienzo del constructor usa los tokens del tema; los símbolos conservan el color CPK ajustado hasta
  un contraste de 4,5 (`colorLegible` en `src/lib/colores.ts`). El dibujo 2D de RDKit (`Estructura2D`) sigue
  con fondo blanco: no estaba en el alcance.
- M1: `docs/revision_datos.md` se genera con `npm run revision` (solo lee los datos).

## Comandos para probar

```bash
npm run dev        # desarrollo
npm test           # Vitest; regenera docs/tabla_validacion.md
npm run build      # tsc -b + vite build
npm run preview    # sirve dist/ (PWA y modo sin conexión)
npm run pendientes # regenera docs/pendientes_revision.md
npm run revision   # regenera docs/revision_datos.md
```

- En PowerShell, si `npm` falla por la política de ejecución de scripts: usar `npm.cmd run dev`.
- En Windows, Vitest falla («no tests») si la ruta de trabajo tiene la unidad en minúscula (`c:\…`):
  ejecutar desde `C:\Users\…`.

## Problemas conocidos

- **GitHub Pages sin desplegar**: GitHub Actions no registra ninguna ejecución de
  `.github/workflows/deploy.yml` pese a los push; Pages está configurado con origen «GitHub Actions».
  Revisar la pestaña Actions del repositorio (puede requerir habilitar los workflows a mano).
- **FPS sin medir en equipo real**: las pruebas visuales usan Chrome sin interfaz (renderizado por software);
  falta comprobar los 60 FPS de la Vitrina 3D en una laptop con gráficos integrados.
- Datos marcados «pendiente de revisión»: lista en `docs/pendientes_revision.md`, valores en
  `docs/revision_datos.md`.
- En las pruebas automáticas (Chrome sin interfaz) el guardado sin conexión a veces tarda más de un minuto
  cuando el equipo está ocupado; con el equipo libre termina en unos 15 s.
