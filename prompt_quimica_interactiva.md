# Química Interactiva — especificación del proyecto

Especificación original del autor, con las mejoras agregadas después (marcadas «Agregado» dentro de su fase).
Las reglas operativas resumidas están en `CLAUDE.md`.

Eres un desarrollador senior de software científico-educativo. Vamos a construir, por fases, un proyecto personal de estudio:

"QUÍMICA INTERACTIVA — Química general, inorgánica y orgánica en 2D/3D"

Una aplicación web para estudiar química desde nivel preuniversitario (exámenes de admisión en Perú: San Marcos, UNI, etc.) hasta química general universitaria, con un bloque de química orgánica que primero será básico y luego se ampliará a un curso completo. Interfaz, comentarios y documentación en ESPAÑOL. Nomenclatura con las convenciones usadas en Perú: tradicional, Stock e IUPAC sistemática.

## STACK (obligatorio)
- Vite + React 18 + TypeScript (strict)
- Three.js con @react-three/fiber y @react-three/drei (moléculas, orbitales, átomos, partículas)
- RDKit.js (WASM, licencia BSD) para leer SMILES/MOL, validar valencias, fórmulas, masa molar, dibujo 2D de estructuras y generación de coordenadas 3D. Cárgalo bajo demanda (solo en los módulos que lo usan).
- Canvas 2D para simulaciones (gases, titulación, cinética)
- Recharts para gráficas
- KaTeX para fórmulas y ecuaciones químicas (usar mhchem: \ce{...})
- Tailwind CSS, tema oscuro por defecto (con modo claro)
- Zustand para estado global
- React Router con HashRouter y `base: './'` en Vite (para GitHub Pages)
- Fuse.js para búsqueda difusa (cargado bajo demanda)
- Vitest para pruebas
- PWA instalable con vite-plugin-pwa (offline completo, botón "Instalar" y "Descargar todo para usar sin internet")
- Despliegue automático en GitHub Pages con GitHub Actions (tests + build + publicación en cada push a main)

## FUENTES DE DATOS (sin inventar datos)
- Elementos: datos de PubChem (dominio público) — masa atómica, configuración electrónica, electronegatividad, radios, energías de ionización, estados de oxidación, etc. Descárgalos con un script en /scripts y guárdalos como JSON en src/data.
- Moléculas: estructuras 3D (SDF) de PubChem PUG REST. Precarga con un script un catálogo curado de ~300 moléculas (comunes, de examen, grupos funcionales, biomoléculas simples) para uso offline. Búsqueda en vivo en PubChem cuando haya internet, con aviso si no hay conexión.
- Constantes físicas: CODATA (R, NA, F, h, kB...).
- Datos termodinámicos (ΔHf°, S°, ΔGf°) y potenciales estándar de reducción: tablas de referencia citadas en /docs (p. ej. CRC, NIST, apéndices de Chang/Brown). Si no tienes certeza de un valor, márcalo como "pendiente de revisión" en vez de inventarlo.
- Página "Créditos y fuentes" generada desde los datos.

## ARQUITECTURA
Separa estrictamente la QUÍMICA de la INTERFAZ:

src/
  chem/                ← funciones puras, sin React, 100% testeadas
    constants.ts
    elements.ts        (acceso a datos, configuración electrónica con excepciones Cr, Cu, etc., números cuánticos)
    fraction.ts        (aritmética racional exacta para balanceo)
    formula.ts         (parser de fórmulas: Ca(OH)2, CuSO4·5H2O, iones; masa molar, composición %)
    balance.ts         (balanceo por álgebra matricial — espacio nulo con fracciones exactas; método redox ion-electrón paso a paso en medio ácido y básico)
    stoichiometry.ts   (moles, reactivo limitante, rendimiento, pureza)
    nomenclature/
      inorganic.ts     (óxidos, peróxidos, hidruros, hidróxidos, ácidos oxácidos e hidrácidos, sales neutras/ácidas/básicas/dobles, iones; nombre ↔ fórmula en tradicional, Stock y sistemática)
      organic.ts       (IUPAC: cadena principal, numeración, prioridad de grupos funcionales, sustituyentes, insaturaciones; nombre ↔ estructura para el alcance de la fase)
    vsepr.ts           (geometría electrónica y molecular, ángulos ideales, hibridación, polaridad)
    gases.ts           (ideal, Van der Waals, mezclas/Dalton, Graham, Maxwell-Boltzmann)
    solutions.ts       (M, m, N, %, fracción molar, diluciones, propiedades coligativas)
    thermo.ts          (Hess, ΔH, ΔS, ΔG, entalpías de formación, calorimetría)
    kinetics.ts        (leyes de velocidad, órdenes 0/1/2 integradas, vida media, Arrhenius)
    equilibrium.ts     (Kc, Kp, tabla ICE, cociente Q, Le Chatelier)
    acidbase.ts        (pH exacto resolviendo balance de carga, ácidos/bases fuertes y débiles, polipróticos, buffers, curvas de titulación, Ksp)
    electrochem.ts     (celdas galvánicas, E° celda, Nernst, electrólisis y leyes de Faraday)
    orbitals.ts        (funciones de onda hidrogenoides ψ(n,l,m) reales, densidad de probabilidad, isosuperficies con marching cubes; híbridos sp, sp2, sp3)
    __tests__/
  modules/             ← un componente por módulo
  components/          ← UI reutilizable (EcuacionQuimica, Molecula3D, Estructura2D, Slider, PanelResultados, PasoAPaso)
  study/               ← quizzes, repetición espaciada (SM-2), modo examen de admisión, progreso
  store/
  pages/

## MÓDULOS

### Bloque A — Átomo y tabla periódica
1. Tabla periódica interactiva: colores por familia/bloque/estado, clic → ficha completa del elemento; modelo de Bohr animado y diagrama de orbitales (cajitas con flechas, Hund y Pauli); tendencias periódicas como mapa de calor y gráfica vs Z.
   - Ficha de cada elemento con "Muestra 3D": representación realista con materiales PBR (color, brillo metálico, rugosidad, transparencia) según su estado a 25 °C: metales como trozo sólido, líquidos (Hg, Br) en frasco, gases como tubo de descarga con su color de emisión real, no metales sólidos con su aspecto (S amarillo, I violeta, alótropos del C). Datos de color y estado en JSON con fuente.
   - Estructura cristalina 3D de cada elemento sólido (bcc, fcc, hcp, diamante, etc.) con la celda unitaria resaltada.
   - Foto real opcional desde Wikimedia Commons solo con licencia CC BY / CC BY-SA / dominio público, con atribución en la ficha y en Créditos.
   - Vista 3D opcional de la tabla: casillas elevadas según la propiedad elegida (radio, EN, energía de ionización, densidad).
   - Para compuestos del catálogo: además de la molécula 3D, red cristalina (NaCl, CsCl, CaF2, ZnS...) y "muestra 3D" con su color y aspecto (polvo, cristal, líquido, gas).
2. Estructura atómica: modelos históricos (Dalton, Thomson, Rutherford con simulación de dispersión, Bohr, mecano-cuántico), números cuánticos, configuración electrónica (Kernel/gas noble, regla de Moeller), isótopos, iones; espectro de emisión del hidrógeno (Rydberg) con series de Lyman/Balmer/Paschen.
3. Orbitales 3D: s, p, d, f con isosuperficies y fases (colores), cortes de densidad, número de nodos; orbitales híbridos.

### Bloque B — Enlace y moléculas
4. Enlace químico: iónico (transferencia animada, red cristalina NaCl en 3D), covalente (polar/apolar, ΔEN), metálico; estructuras de Lewis paso a paso con carga formal y resonancia.
5. Visor de moléculas 3D: búsqueda (nombre en español/inglés, fórmula, SMILES) → bolas y barras / espacio lleno / alambre, medición de distancias y ángulos, momento dipolar, geometría VSEPR y hibridación por átomo.
6. Constructor de moléculas: agregar átomos y enlaces en 2D, validación de valencia con RDKit, ver en 3D, fórmula, masa molar y nombre si está en el catálogo.
7. Fuerzas intermoleculares: dipolo-dipolo, puentes de hidrógeno, London; relación con punto de ebullición (gráfica comparativa).

### Bloque C — Química inorgánica y reacciones
8. Nomenclatura inorgánica: generador y quiz nombre ↔ fórmula en las 3 nomenclaturas, con estados de oxidación explicados paso a paso; tabla de funciones químicas (óxido básico → hidróxido, etc.) como diagrama interactivo.
9. Reacciones químicas: tipos (síntesis, descomposición, desplazamiento, doble desplazamiento, combustión, neutralización, redox), con animación esquemática.
10. Balanceador: tanteo explicado, algebraico y redox (ion-electrón en medio ácido/básico) con cada paso mostrado; detecta ecuaciones imposibles.
11. Estequiometría: calculadora paso a paso (mol, masa, volumen a CN, partículas), reactivo limitante animado, rendimiento y pureza; unidades químicas de masa y composición centesimal, fórmula empírica y molecular.

### Bloque D — Estados de la materia y soluciones
12. Simulador de gases: partículas en una caja con pistón, sliders de P, V, T, n; leyes de Boyle, Charles, Gay-Lussac y combinada; histograma de velocidades vs Maxwell-Boltzmann; gas real (Van der Waals); efusión (Graham).
13. Soluciones: preparar una solución (vaso animado), unidades de concentración, diluciones y mezclas, solubilidad vs temperatura, propiedades coligativas.

### Bloque E — Termoquímica, cinética y equilibrio
14. Termoquímica: diagramas de entalpía, ley de Hess interactiva (arrastrar ecuaciones), calorimetría, espontaneidad ΔG = ΔH − TΔS con gráfica.
15. Cinética: concentración vs tiempo para órdenes 0/1/2, determinación del orden con datos, Arrhenius y energía de activación con diagrama de energía y catalizador; simulación de colisiones.
16. Equilibrio químico: tabla ICE paso a paso, Kc/Kp, Q vs K; simulador de Le Chatelier (agregar reactivo, cambiar P o T) con gráfica de concentraciones en el tiempo.

### Bloque F — Ácidos, bases y electroquímica
17. Ácidos y bases: teorías (Arrhenius, Brønsted-Lowry, Lewis), escala de pH con sustancias cotidianas, cálculo de pH paso a paso, buffers (Henderson-Hasselbalch), hidrólisis de sales, Ksp y precipitación.
18. Laboratorio de titulación: bureta y matraz animados, indicador que cambia de color, curva de pH en tiempo real, punto de equivalencia; fuerte-fuerte, débil-fuerte, polipróticos.
19. Electroquímica: celda galvánica animada (electrones, puente salino, iones), tabla de potenciales, Nernst, electrólisis y Faraday, corrosión.

### Bloque G — Química orgánica básica
20. El carbono: hibridación sp/sp2/sp3 en 3D, tipos de carbono (primario a cuaternario), tipos de fórmulas (desarrollada, semidesarrollada, condensada, esqueletal).
21. Hidrocarburos: alcanos, alquenos, alquinos, cíclicos y aromáticos; nomenclatura IUPAC paso a paso (cadena principal resaltada, numeración, sustituyentes); conformaciones del etano y ciclohexano en 3D.
22. Grupos funcionales: oxigenados (alcoholes, éteres, aldehídos, cetonas, ácidos carboxílicos, ésteres) y nitrogenados (aminas, amidas, nitrilos); prioridad de grupos; nombre ↔ estructura.
23. Isomería básica: estructural (cadena, posición, función) y geométrica cis/trans, con comparación lado a lado en 3D.
24. Reacciones orgánicas básicas: combustión, halogenación, hidrogenación, esterificación, saponificación (sin mecanismo detallado aún).

## MODO ESTUDIO
- Quizzes por módulo generados desde los datos (elementos, nomenclatura, balanceo, estequiometría, grupos funcionales, VSEPR).
- Flashcards con repetición espaciada (SM-2).
- MODO EXAMEN DE ADMISIÓN: simulacros cronometrados con preguntas de opción múltiple (5 alternativas, A–E) al estilo de los exámenes de admisión peruanos, por tema y dificultad, con solución explicada paso a paso. Las preguntas deben ser ORIGINALES (no copiar preguntas reales de exámenes).
- Panel de progreso por bloque y temas débiles; progreso guardado en localStorage (envuelto en try/catch).

## VALIDACIÓN (obligatorio, Vitest)
- Parser de fórmulas y masas molares vs PubChem (≥ 30 compuestos, error < 0.01 g/mol).
- Balanceo: ≥ 40 ecuaciones conocidas (incluidas redox en medio ácido y básico), coeficientes mínimos enteros.
- Nomenclatura inorgánica: ≥ 100 pares nombre ↔ fórmula en las 3 nomenclaturas.
- Nomenclatura orgánica: ≥ 80 pares nombre IUPAC ↔ SMILES verificados contra PubChem.
- VSEPR: geometría y ángulos de ≥ 25 moléculas de libro.
- pH: ácidos/bases fuertes y débiles, buffers, puntos de la curva de titulación vs valores analíticos (error < 0.01 unidades de pH).
- Gases, termoquímica, cinética, equilibrio y Nernst contra ejercicios resueltos de libro (Chang, Brown).
- Orbitales: normalización de ψ y número de nodos radiales/angulares.
- Integridad de datos: todos los elementos y moléculas del catálogo cargan y tienen sus campos obligatorios.
- Genera docs/tabla_validacion.md con analítico vs calculado y % de error.

## RENDIMIENTO Y UX (lecciones de proyectos anteriores)
- Carga diferida por módulo; RDKit, Fuse.js y Three.js solo cuando se usan. Portada < 100 kB comprimidos.
- 60 FPS en laptop con gráficos integrados; botón FPS en las escenas 3D.
- Responsive (360 px a escritorio, probar 1366x768), accesible (contraste WCAG AA, foco visible, teclado).
- Nada de etiquetas de desarrollo ("Fase X") en la interfaz.
- Cada módulo con botón "Teoría" (fórmulas en KaTeX) y resultados con "Ver paso a paso".

## FASES (una a la vez; espera mi confirmación)
- Fase 0: Proyecto, dependencias, estructura, layout, router, portada, CLAUDE.md con estas reglas, git init, workflow de GitHub Actions y PWA básica.
- Fase 1: Scripts de datos (PubChem, constantes) + chem/elements, formula, orbitals + tests. Módulos 1, 2 y 3.
- Fase 2: RDKit, vsepr + tests. Módulos 4, 5, 6 y 7.
- Fase 3: nomenclatura inorgánica, balanceo (fracciones exactas, redox), estequiometría + tests. Módulos 8, 9, 10 y 11.
  - Agregado: tabla de solubilidad interactiva (cationes × aniones, reglas a 25 °C; soluble / poco soluble /
    insoluble y color del precipitado). Clic en una celda → compuesto, fórmula, Ksp si existe y su muestra.
    Integrada con el módulo de reacciones: en doble desplazamiento predice el precipitado y muestra la ecuación
    iónica neta. Datos en JSON con fuente citada; tests con ≥ 30 casos (AgCl insoluble, NaNO3 soluble, BaSO4 insoluble…).
- Fase 4: gases, soluciones, termoquímica + tests. Módulos 12, 13 y 14.
- Fase 5: cinética, equilibrio, ácidos-bases, electroquímica + tests. Módulos 15 a 19.
- Fase 6: Orgánica básica (nomenclatura IUPAC + tests). Módulos 20 a 24.
- Fase 7: Modo estudio y modo examen de admisión.
  - Agregado: generador de hojas de trabajo imprimibles. Elegir tema (balanceo, nomenclatura inorgánica/orgánica,
    estequiometría, tipos de reacción, configuración electrónica, pH, gases), subtemas, número de preguntas (5–50)
    y dificultad. Ejercicios aleatorios generados desde chem/ (no plantillas fijas) con hoja de respuestas al final.
    Vista previa e impresión / PDF (CSS @media print, A4) con encabezado opcional (nombre, curso, fecha).
    Botón «Nueva versión» que regenera con otra semilla; la semilla aparece en la hoja para poder repetirla.
- Fase 8: Pulido (incluye revisar los datos marcados «pendiente de revisión»), rendimiento, accesibilidad, PWA offline completa, página de créditos, docs (manual de usuario, informe técnico, tabla de validación), README y deploy en GitHub Pages.

### FASES EXTRA — QUÍMICA ORGÁNICA COMPLETA (solo cuando yo lo indique)
- Fase 9: Estereoquímica: quiralidad y centros estereogénicos detectados con RDKit, configuración R/S con reglas de Cahn-Ingold-Prelog paso a paso, E/Z, enantiómeros, diastereómeros y compuestos meso en 3D (rotar y superponer imágenes especulares), proyecciones de Fischer y Newman, actividad óptica.
- Fase 10: Mecanismos de reacción animados: SN1, SN2, E1, E2, adición electrofílica a alquenos (Markovnikov), sustitución electrofílica aromática, adición nucleofílica a carbonilo, sustitución nucleofílica de acilo. Flechas curvas de electrones animadas paso a paso, intermediarios y estados de transición, diagrama de energía sincronizado, y simulador "¿SN1, SN2, E1 o E2?" según sustrato, nucleófilo/base, solvente y temperatura.
  REGLA: cada mecanismo se define en un JSON curado (pasos, átomos, flechas, cargas) con referencia bibliográfica (Wade, McMurry, Clayden); márcalos como "pendiente de revisión" hasta que yo los valide. No inventes pasos.
- Fase 11: Espectroscopía: IR (bandas características por grupo funcional), RMN de 1H y 13C (desplazamientos, integración, multiplicidad n+1) y espectrometría de masas, con ejercicios "deduce la estructura". Si usas espectros reales, solo de fuentes con licencia que permita su uso; si no, espectros simulados y rotulados como tales.
- Fase 12: Síntesis y biomoléculas: rutas de síntesis de varios pasos (quiz "¿qué reactivo falta?"), polímeros, carbohidratos (Haworth en 3D), lípidos, aminoácidos y proteínas, ácidos nucleicos.

## REGLAS
- Al terminar cada fase: `npm run build` y `npm test` sin errores; resumen corto de qué hiciste y cómo probarlo. No subas a main hasta que yo lo confirme.
- Precisión química ante todo: si no estás seguro de un dato, nombre o mecanismo, márcalo para revisión en vez de inventarlo.
- No uses librerías que resuelvan la química por ti salvo RDKit para estructura molecular: balanceo, pH, nomenclatura, gases, etc. se implementan en chem/.
- Código tipado y con comentarios en español explicando la química (con la fórmula).
- Commits descriptivos al final de cada fase. No incluyas AGENTS.md.

Empieza por la Fase 0.

## Estado de las mejoras solicitadas

| Mejora | Fase | Estado |
|---|---|---|
| Muestra 3D de cada elemento (PBR según estado a 25 °C; gases en tubo de descarga; Hg y Br en frasco) | 1 | Hecho (`tabla-periodica/Muestra3D.tsx`, `src/data/apariencia.json`) |
| Estructura cristalina 3D de los elementos sólidos con celda unitaria resaltada | 1 | Hecho (`EstructuraCristalina.tsx`, `src/data/cristales.json`) |
| Foto opcional de Wikimedia Commons (CC BY, CC BY-SA o dominio público, con atribución) | 1 | Hecho (`FotoWikimedia.tsx`) |
| Vista 3D de la tabla con casillas elevadas según la propiedad | 1 | Hecho (`Tabla3D.tsx`) |
| Compuestos del catálogo: red cristalina (NaCl, CsCl, CaF₂, ZnS) y muestra 3D (polvo, cristal, líquido, gas) | 2 | Hecho (visor de moléculas; `src/data/apariencia-compuestos.json`) |
| Tabla de solubilidad interactiva + precipitados y ecuación iónica neta | 3 | Hecho (módulo 9; `src/chem/solubilidad.ts`, `src/data/solubilidad.json`) |
| Generador de hojas de trabajo imprimibles | 7 | Hecho (Modo estudio → Hojas de trabajo; `src/study/generadores.ts`) |
