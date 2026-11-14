# Química Interactiva — reglas del proyecto

Aplicación web para estudiar química desde nivel preuniversitario (admisión en Perú: San Marcos, UNI…) hasta
química general universitaria, con un bloque de química orgánica (básico → curso completo en fases extra).

**Todo en español**: interfaz, comentarios, documentación, mensajes de commit.
Nomenclatura con las convenciones usadas en Perú: **tradicional, Stock e IUPAC sistemática**.

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm test           # Vitest (una pasada)
npm run build      # tsc -b + vite build (debe pasar sin errores)
npm run preview    # sirve dist/ (para probar la PWA)
npm run datos      # descarga/regenera los datos (PubChem, NIST, CODATA); ver docs/datos.md
npm run iconos     # regenera los íconos PNG de la PWA
npm run pendientes # regenera docs/pendientes_revision.md (datos por verificar)
npm run revision   # regenera docs/revision_datos.md (valor actual, unidad y fuente de cada dato por verificar)
```

`npm test` también regenera `docs/tabla_validacion.md`: cada prueba de validación llama a
`registrarValidacion()` (`src/chem/__tests__/validacion.ts`) y `setup-global.ts` une las secciones.

## Stack (obligatorio, no cambiar sin consultar)

- Vite 6 + React **18** + TypeScript strict (`noUncheckedIndexedAccess` activo).
- Three.js con `@react-three/fiber@8` y `@react-three/drei@9` (las versiones compatibles con React 18).
- RDKit.js (WASM, BSD) — **solo** para estructura molecular (SMILES/MOL, valencias, 2D, coordenadas 3D).
- Canvas 2D para simulaciones (gases, titulación, cinética). Recharts para gráficas.
- KaTeX + mhchem (`\ce{...}`) para fórmulas y ecuaciones químicas.
- Tailwind CSS v4; tema oscuro por defecto (clase `.dark` en `<html>`), modo claro disponible.
- Zustand para estado global. React Router con **HashRouter**; `base: './'` en Vite (GitHub Pages).
- Fuse.js para búsqueda difusa. Vitest para pruebas. vite-plugin-pwa (instalable y offline).

## Arquitectura

Separación estricta **química ↔ interfaz**:

```
src/
  chem/          funciones puras, SIN React, 100 % testeadas (__tests__/)
  modules/       un componente por módulo (registro.ts = metadatos; componentes.ts = carga diferida)
  components/    UI reutilizable (layout/, EcuacionQuimica, Molecula3D, Estructura2D, Slider, PanelResultados, PasoAPaso…)
  study/         quizzes, repetición espaciada (SM-2), modo examen, progreso
  store/         stores de Zustand
  pages/         páginas de ruta
  lib/           utilidades no químicas (almacenamiento seguro, PWA)
  data/          JSON/TS de datos con fuente (fuentes.ts alimenta la página de Créditos)
scripts/         descarga y preparación de datos (PubChem, constantes)
docs/            documentación, referencias de tablas, tabla_validacion.md
```

- `src/chem/` nunca importa React ni nada de `components/`, `modules/`, `pages/`.
- Toda la química (balanceo, pH, nomenclatura, gases, termo…) se implementa en `src/chem/`.
  **No usar librerías que resuelvan la química**, salvo RDKit para estructura molecular.
- Código tipado y **comentado en español explicando la química, con la fórmula** (p. ej. `// PV = nRT`).

### Componentes compartidos

- `Formula` / `Ce` (KaTeX + mhchem, cargado bajo demanda), `Teoria`, `PasoAPaso`, `Pestanas`, `Slider`,
  `SelectorElemento`, `InsigniaRevision` (marca «pendiente de revisión»).
- `escena3d/Escena3D` (Canvas R3F con controles, luces, entorno local sin HDR externo y botón FPS) y
  `escena3d/Cristal3D` (redes cristalinas a partir de `chem/cristales`).
- `escena3d/Presentaciones` (geometría procedural por presentación: lingote, alambre, ampolla, tubo de
  descarga…; `geometriaMiniatura` para LOD) y `escena3d/ObjetosCotidianos` (pestaña «En la vida diaria»).
  `Escena3D entorno="estudio"` usa el HDRI local `public/hdri/estudio_1k.hdr` (Poly Haven, CC0; en el precache).
- Módulo 1: `Muestra3D` (exporta `Encuadre`, que centra la cámara según la caja envolvente), `VidaDiaria3D` y
  `Vitrina3D` (118 casilleros, InstancedMesh por presentación + LOD). Los datos están en el bloque
  `presentaciones` de `src/data/apariencia.json` y en `src/data/vidas-medias.json` (OIEA); los elementos
  «sin muestra» llevan placa de aviso y vida media: **nunca se inventa su aspecto**.
- «Del mineral al producto» (módulo 1): `MineralProducto` (tres escenas: fuente natural → elemento puro →
  productos, con el proceso industrial y sus ecuaciones) y `escena3d/Minerales` (`FuenteNatural3D`). Datos en
  `src/data/obtencion.json` (41 elementos, nota «En el Perú»); `src/modules/__tests__/obtencion.test.ts`
  comprueba cada ecuación con `chem/balance` y cada fórmula con `chem/formula`. `escena3d/Ajustado` escala un
  objeto a un cubo dado. La vitrina tiene selector «Mineral / Puro / Producto». El balanceador acepta
  `?ecuacion=…`.
- `atomo/DiagramaOrbitales` y `atomo/ModeloBohr`.
- Cálculos pesados (p. ej. isosuperficies de orbitales) en un Web Worker (`modules/orbitales-3d/orbitales.worker.ts`).
- `molecula/`: `Molecula3D` (bolas y barras / espacio lleno / alambre), `Estructura2D` (dibujo de RDKit),
  `LewisSVG`, `BuscadorMoleculas` (Fuse sobre el catálogo) y `cargarMolecula` (catálogo offline, PubChem en vivo
  y elección de geometría: conformero de PubChem salvo hipervalentes → VSEPR; sin 3D → `chem/coordenadas3d`).
- `molecula/VistaOrganica` (2D de RDKit con resaltado y numeración, 3D a pedido) y `organica/NombreEstructura`
  (estructura ↔ nombre y práctica), usados por los módulos 20–24. `lib/colores.ts` lee los tokens para Canvas.
- RDKit solo a través de `src/lib/rdkit.ts` (carga diferida del WASM; traduce los errores de valencia).
- Estereoquímica (módulo 25, bloque H): `src/chem/estereo.ts` calcula con código propio las prioridades CIP
  (regla 1), R/S, E/Z, Fischer, Newman, la geometría 3D que respeta la configuración y la actividad óptica.
  Entrada: `Molecula` con H explícitos y cuñas (`EnlaceMol.estereo`, leído del molfile de RDKit). RDKit solo
  dibuja y da la estructura canónica (comparar con la imagen especular). Validado contra RDKit
  (`get_stereo_tags`) en `chem/__tests__/estereo.test.ts`. Ejemplos en `src/data/estereo.ts`.

### Modo estudio

- `src/study/` (sin React, con pruebas): `azar` (semilla reproducible), `generadores` (preguntas originales A–E
  creadas desde `chem/`, con respuesta y solución), `sm2` (repetición espaciada), `tarjetas` (mazo desde los datos)
  y `examen` (simulacros y nota vigesimal). Nunca copiar preguntas reales de exámenes de admisión.
- Páginas en `src/pages/estudio/` (quiz, tarjetas, simulacro, hojas de trabajo); progreso en `store/progreso`.
- Impresión: los controles llevan `.no-imprimir`; estilos `@media print` (A4) en `src/styles/index.css`.

### Agregar un módulo

1. Metadatos ya están en `src/modules/registro.ts` (número, slug, bloque, temas).
2. Crear `src/modules/<slug>/<Componente>.tsx` (export default).
3. Registrar en `src/modules/componentes.ts`: `'<slug>': lazy(() => import('./<slug>/<Componente>'))`.
4. Cada módulo tiene botón **«Teoría»** (fórmulas en KaTeX) y resultados con **«Ver paso a paso»**.

## Datos — no inventar

- Elementos: PubChem (dominio público), descargados por script en `/scripts` → JSON en `src/data`.
- Moléculas: SDF 3D de PubChem PUG REST; catálogo curado (~300) precargado para uso offline. Búsqueda
  en vivo en PubChem con aviso si no hay conexión.
- Constantes físicas: CODATA (NIST).
- Termodinámica (ΔHf°, S°, ΔGf°) y potenciales estándar: tablas citadas en `/docs` (CRC, NIST, apéndices
  de Chang/Brown).
- **Si no hay certeza de un valor, nombre o mecanismo: marcarlo `pendienteRevision: true` /
  «pendiente de revisión»; nunca inventarlo.**
- Toda fuente nueva se registra en `src/data/fuentes.ts` (la página de Créditos se genera desde ahí).
- Fotos de Wikimedia Commons solo con licencia CC BY, CC BY-SA o dominio público, con atribución.
- Mecanismos orgánicos (fase 10): JSON curado con referencia (Wade, McMurry, Clayden), marcados
  «pendiente de revisión» hasta validación del autor.
- Espectros (fase 11): reales solo con licencia que lo permita; si no, simulados y rotulados como tales.
- Preguntas de examen: **originales** (no copiar preguntas reales de exámenes de admisión).

## Validación (Vitest)

Mínimos exigidos en `src/chem/__tests__/`:
- Fórmulas/masas molares vs PubChem: ≥ 30 compuestos, error < 0.01 g/mol.
- Balanceo: ≥ 40 ecuaciones (incluidas redox en medio ácido y básico), coeficientes enteros mínimos.
- Nomenclatura inorgánica: ≥ 100 pares nombre ↔ fórmula en las 3 nomenclaturas.
- Nomenclatura orgánica: ≥ 80 pares IUPAC ↔ SMILES verificados contra PubChem.
- Estereoquímica: ≥ 30 moléculas con R/S y ≥ 10 alquenos con E/Z, propio vs RDKit y vs descriptores de libro.
- VSEPR: ≥ 25 moléculas de libro (geometría y ángulos).
- pH: fuertes/débiles, buffers, puntos de titulación vs analítico (error < 0.01 unidades).
- Gases, termo, cinética, equilibrio, Nernst vs ejercicios resueltos (Chang, Brown).
- Orbitales: normalización de ψ y número de nodos radiales/angulares.
- Integridad de datos: todos los elementos/moléculas del catálogo cargan con sus campos obligatorios.
- Generar `docs/tabla_validacion.md` (analítico vs calculado, % de error).

## Rendimiento y UX

- Carga diferida por módulo; RDKit, Fuse.js, Three.js, KaTeX y Recharts **solo** en los chunks que los usan.
  **Portada < 100 kB comprimidos** (revisar la salida de `npm run build`).
- 60 FPS en laptop con gráficos integrados; botón FPS en las escenas 3D (`usePreferencias().mostrarFPS`).
- Responsive de 360 px a escritorio (probar 1366×768). Accesible: contraste WCAG AA, foco visible, teclado.
- Colores siempre con los tokens de `src/styles/index.css` (`bg-superficie`, `text-texto-suave`…).
- localStorage **siempre** vía `src/lib/almacenamiento.ts` (envuelto en try/catch).
- **Nada de etiquetas de desarrollo en la interfaz** («Fase X», «TODO», lorem…). Un módulo sin implementar
  muestra «Módulo en preparación».

## Flujo de trabajo por fases

- Una fase a la vez; esperar confirmación del autor antes de pasar a la siguiente.
- Al terminar cada fase: `npm run build` y `npm test` sin errores, resumen corto de qué se hizo y cómo probarlo.
- Commit descriptivo al final de cada fase. **No hacer push a `main` hasta que el autor lo confirme.**
- `AGENTS.md` es una copia **idéntica** de este archivo (para continuar con otra IA): todo cambio en uno se
  replica en el otro (`cp CLAUDE.md AGENTS.md`).
- `docs/ESTADO.md` resume la fase actual, lo terminado, lo pendiente, las decisiones y los problemas conocidos;
  **se actualiza al final de cada fase**.
- No incluir archivos temporales ni fotos de personas reales. No cambiar valores de datos existentes sin
  confirmación del autor.
- Capturas de cada fase (escritorio 1366×768 y móvil 412 px) en el scratchpad, nunca en el repositorio.

### Fases

0. Proyecto, dependencias, estructura, layout, router, portada, CLAUDE.md, git, GitHub Actions, PWA básica.
1. Scripts de datos (PubChem, constantes) + chem/elements, formula, orbitals + tests. Módulos 1–3.
2. RDKit, vsepr + tests. Módulos 4–7.
3. Nomenclatura inorgánica, balanceo (fracciones exactas, redox), estequiometría + tests. Módulos 8–11.
   Incluye la tabla de solubilidad (cationes × aniones, precipitados, ecuación iónica neta; ≥ 30 casos de prueba).
4. Gases, soluciones, termoquímica + tests. Módulos 12–14.
5. Cinética, equilibrio, ácidos-bases, electroquímica + tests. Módulos 15–19.
6. Orgánica básica (nomenclatura IUPAC + tests). Módulos 20–24.
7. Modo estudio (quizzes, flashcards SM-2) y modo examen de admisión (A–E, cronometrado, solución paso a paso).
   Incluye el generador de hojas de trabajo imprimibles (temas, 5–50 preguntas, dificultad, semilla visible,
   «Nueva versión», hoja de respuestas, @media print A4, encabezado opcional).
8. Pulido, rendimiento, accesibilidad, PWA offline completa («Descargar todo»), créditos, docs, README, deploy;
   revisión de los datos «pendiente de revisión».

La especificación completa y el estado de cada mejora están en `prompt_quimica_interactiva.md`.

### Mejoras (después de la Fase 8)

Especificación en `prompt_quimica_mejoras.md`; avance en `docs/ESTADO.md`. Una fase a la vez, con confirmación
del autor antes de subir a `main` y antes de pasar a la siguiente.

- M0. Preparación: `AGENTS.md`, `docs/ESTADO.md`, prompt de mejoras en el repositorio.
- M1. Pulido pendiente: aviso «sin conexión» (5 s, una sola vez), lienzo del constructor según el tema,
  `docs/revision_datos.md`.
- M2. Muestras 3D realistas (presentación por elemento), pestaña «En la vida diaria» y «Vitrina 3D» (módulo 1).
- M3. «Del mineral al producto»: mineral → proceso industrial (ecuación balanceada) → productos; nota «En el Perú».
- 9. Estereoquímica (módulo 25, bloque H «Química orgánica avanzada»).
- 10 mecanismos animados · 11 espectroscopía · 12 síntesis y biomoléculas.
