# Estado del proyecto

Documento de relevo: permite retomar el trabajo (con cualquier asistente) sin leer el historial.
**Se actualiza al final de cada fase.** Última actualización: 2026-11-12.

- Reglas del proyecto: `CLAUDE.md` (= `AGENTS.md`, copia idéntica).
- Especificación original (fases 0–12): `prompt_quimica_interactiva.md`.
- Plan de mejoras (fases M0–M3 y 9–12): `prompt_quimica_mejoras.md`.
- Repositorio: https://github.com/GerardoAM15/quimica-interactiva (rama `main`).

## Fase actual

**M0 — Preparación: terminada, en espera de la aprobación del autor.**
Siguiente: **M1 — Pulir lo pendiente** (no empezar sin confirmación).

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
| M0 | `AGENTS.md`, `docs/ESTADO.md`, `prompt_quimica_mejoras.md` | (commit local, sin subir) |

Todo lo anterior a M0 está en `origin/main`. Validación: 26 archivos de prueba, 1283 pruebas en verde.

## En curso (sin commit)

**M2 — Muestras 3D realistas y Vitrina 3D**: se adelantó antes de recibir el plan de mejoras y está en el
árbol de trabajo **sin commit**, a la espera de la aprobación del autor.

Archivos: `src/components/escena3d/{Presentaciones,ObjetosCotidianos,Escena3D}.tsx`,
`src/modules/tabla-periodica/{Muestra3D,VidaDiaria3D,Vitrina3D,FichaElemento,TablaPeriodica}.tsx`,
`src/modules/tabla-periodica/presentacion.ts`, `src/data/{presentaciones,vidas-medias,apariencia}.json`,
`scripts/descargar-{hdri,vidas-medias}.mjs`, `public/hdri/estudio_1k.hdr`, `vite.config.ts`.

Hecho: presentación por elemento, geometría procedural por presentación, encuadre automático, efectos
(iridiscencia Bi, pátina opcional Cu, opaco Pb, diamante), «sin muestra» con vida media, pestaña «En la vida
diaria» (25 objetos), Vitrina 3D con LOD e instancias.

Diferencias con la especificación M2 de `prompt_quimica_mejoras.md`, por resolver al retomar la fase:

- `presentacion` está en `src/data/presentaciones.json`, no dentro de `apariencia.json`.
- Iluminación con HDRI local de Poly Haven (CC0, en el precache), no `RoomEnvironment` + `PMREMGenerator`.
- «Sin muestra»: símbolo ☢ y texto; falta la placa amarilla con trébol en la muestra grande.
- Vitrina: etiquetas de color por familia (se piden negras), fondo de casillero oscuro (se pide claro),
  falta el botón «Volver a la vitrina».
- Pendiente antes del commit: fuentes nuevas en `src/data/fuentes.ts` (Poly Haven, OIEA LiveChart, T. Gray),
  scripts nuevos en `npm run datos`, `npm run pendientes`, capturas a 1366×768 y 412 px.

## Falta

- **M1**: aviso «sin conexión» (cierre a los 5 s, una sola vez); lienzo del constructor de moléculas según el
  tema; `docs/revision_datos.md`.
- **M2**: cerrar las diferencias anteriores, capturas obligatorias, aprobación y commit.
- **M3**: «Del mineral al producto» (`src/data/obtencion.json`, ~40 elementos, pruebas de balanceo y fórmulas).
- **Fases 9–12**: estereoquímica, mecanismos animados, espectroscopía, síntesis y biomoléculas.

## Decisiones tomadas

- Química propia en `src/chem/` (sin librerías que la resuelvan); RDKit solo para estructura molecular.
- Datos nunca inventados: lo dudoso lleva `pendienteRevision: true`; toda fuente en `src/data/fuentes.ts`.
- No se cambian valores de datos existentes sin confirmación del autor.
- Preguntas de estudio y examen originales, generadas con semilla reproducible.
- `AGENTS.md` pasó de estar prohibido a ser copia idéntica de `CLAUDE.md` (fase M0).
- Una fase a la vez; el autor confirma antes de subir a `main` y antes de pasar a la siguiente.
- Capturas de verificación fuera del repositorio (scratchpad).

## Comandos para probar

```bash
npm run dev        # desarrollo
npm test           # Vitest; regenera docs/tabla_validacion.md
npm run build      # tsc -b + vite build
npm run preview    # sirve dist/ (PWA y modo sin conexión)
npm run pendientes # regenera docs/pendientes_revision.md
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
- Datos marcados «pendiente de revisión»: lista en `docs/pendientes_revision.md`.
