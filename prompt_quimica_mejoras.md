Vamos a mejorar el proyecto "Química interactiva" (ya publicado, fases 0–8 terminadas). Sigue las reglas de CLAUDE.md y de prompt_quimica_interactiva.md. Trabaja UNA fase a la vez y espera mi confirmación antes de subir a main y antes de pasar a la siguiente.

REGLAS GENERALES
- Al terminar cada fase: npm test y npm run build sin errores; resumen corto de qué hiciste y cómo probarlo; capturas (escritorio 1366x768 y móvil 412 px) guardadas en el scratchpad con sus rutas.
- No subas a main hasta que yo apruebe la fase.
- Precisión ante todo: si no estás seguro de un dato, márcalo "pendiente de revisión" con su fuente en vez de inventarlo. No cambies valores existentes sin mi confirmación.
- Todo funciona offline (PWA): los recursos nuevos deben quedar en el precache.
- Rendimiento: 60 FPS con gráficos integrados; carga diferida de lo nuevo.
- No incluyas fotos de personas reales. No incluyas archivos temporales.

────────────────────────────────────────
FASE M0 — Preparación (para poder continuar con otra IA)
1. Crea AGENTS.md con el mismo contenido que CLAUDE.md (y mantenlos iguales de aquí en adelante).
2. Crea docs/ESTADO.md: fase actual, qué está terminado, qué falta, decisiones tomadas, comandos para probar, problemas conocidos. Actualízalo al final de cada fase.
3. Guarda este archivo (prompt_quimica_mejoras.md) en el repositorio.

────────────────────────────────────────
FASE M1 — Pulir lo pendiente
1. El aviso "Listo: la aplicación ya funciona sin conexión" debe cerrarse solo a los 5 s y mostrarse una sola vez (recordarlo en localStorage con try/catch).
2. El lienzo del constructor de moléculas debe seguir el tema activo (oscuro/claro), no fondo blanco fijo.
3. Genera docs/revision_datos.md: tabla con cada dato de docs/pendientes_revision.md, su valor actual, unidad y fuente citada, para que yo lo compare con mi libro (Chang). No cambies valores.

────────────────────────────────────────
FASE M2 — Muestras 3D realistas y Vitrina 3D (módulo 1)

A. Muestras
- En src/data/apariencia.json agrega "presentacion" por elemento, según su forma típica de laboratorio o colección:
  lingote, barra, alambre enrollado, lámina, gránulos, polvo, pepita, cristal (cúbico, octaédrico, escalonado tipo Bi), oblea (Si), en aceite (Li, Na, K), ampolla sellada (Rb, Cs, Br), gota (Hg), tubo de descarga (H, He, N, O, F, Ne, Cl, Ar, Kr, Xe), "sin muestra" (los de noObservables + radiactivos escasos como Tc, Pm, Po, At, Rn, Fr, Ra, Ac y Z > 95).
  Cita la fuente y marca "pendiente de revisión".
- Geometría procedural distinta por presentación (no una roca para todos), sobre un pedestal oscuro.
- Iluminación: RoomEnvironment + PMREMGenerator (funciona offline) y tone mapping ACES.
- Acabado por elemento: color, metalness, roughness; efectos: iridiscencia (Bi), pátina opcional (Cu), opaco (Pb), vidrio con transmisión para frascos y ampollas.
- Gases: núcleo con MeshBasicMaterial toneMapped:false en su color de emisión real + halo translúcido + carcasa de vidrio y electrodos.
- "Sin muestra": placa amarilla con trébol radiactivo, texto "solo se han producido unos pocos átomos" (o "muy radiactivo y escaso") y su vida media.

B. Pestaña "En la vida diaria"
- Un objeto 3D simple por elemento común (bombilla W, lata Al, cable Cu, letrero Ne, batería Li, termómetro Hg, chip Si, joya Au...) con una frase de su uso.

C. Vista "Vitrina 3D" de la tabla periódica
- Pared de madera con 118 casilleros iluminados (fondo claro), etiqueta negra con símbolo y Z.
- Cada casillero muestra la MISMA presentación que su muestra grande (no formas genéricas), en miniatura.
- Gases brillando en su tubo; radiactivos con placa de aviso.
- Clic en casillero → la cámara se acerca suavemente y abre la ficha; botón "Volver a la vitrina".
- Para elementos sintéticos usa ícono o ilustración, nunca fotos de personas.
- Rendimiento: LOD (versión simplificada lejos, detallada al acercarse), materiales y geometrías compartidos, botón FPS.

Capturas obligatorias: Au, Cu, Bi, Na, Hg, Ne, S, Pm (muestra grande) y la vitrina (vista general y acercamiento).

────────────────────────────────────────
FASE M3 — "Del mineral al producto"

1. Pestaña nueva en la ficha del elemento con tres escenas 3D en fila y flechas:
   (1) En la naturaleza: mineral o mena principal con nombre y fórmula
       (ej. Fe: hematita Fe2O3; Cu: calcopirita CuFeS2; Al: bauxita Al2O3·xH2O; Au: pepita nativa en cuarzo; Ag: argentita Ag2S; Zn: esfalerita ZnS; Pb: galena PbS; Sn: casiterita SnO2; Na: halita NaCl; Si: cuarzo SiO2; N, O, Ar, Ne: el aire).
   (2) Elemento puro: la misma "Muestra 3D" de la Fase M2.
   (3) Productos: 2–3 objetos 3D simples de uso diario (acero/clavo, cable, lata, chip, letrero, calamina galvanizada...).
2. Entre (1) y (2): nombre del proceso industrial (alto horno, electrólisis Hall-Héroult, tostación + refinación electrolítica, celda de Downs, destilación fraccionada del aire, reducción con carbono...) con su ecuación química balanceada y botón "Abrir en el balanceador".
3. Nota "En el Perú" para los elementos que produce el país (Cu, Au, Zn, Ag, Pb, Sn, Mo y otros): posición como productor y región o mina principal, con fuente citada (USGS Mineral Commodity Summaries, MINEM) y marca "pendiente de revisión".
4. Alcance: unos 40 elementos con uso industrial importante, en src/data/obtencion.json con fuentes. Los demás muestran un texto breve de obtención o "no tiene uso industrial relevante".
5. En la Vitrina 3D: selector "Mineral / Puro / Producto" que cambia todas las muestras a la vez.
6. Tests: cada ecuación de obtencion.json debe estar balanceada (chem/balance.ts) y cada fórmula de mineral debe ser válida (chem/formula.ts).

Capturas obligatorias: Fe, Cu, Al, Au, Si, el aire (N/O) y la vitrina en modo "Mineral".

────────────────────────────────────────
FASES 9 a 12 — Química orgánica completa
Sigue exactamente lo definido en prompt_quimica_interactiva.md para cada fase:
- Fase 9: Estereoquímica (quiralidad con RDKit, R/S con Cahn-Ingold-Prelog paso a paso, E/Z, enantiómeros, diastereómeros, meso, Fischer y Newman, actividad óptica).
- Fase 10: Mecanismos de reacción animados (SN1, SN2, E1, E2, adición electrofílica, sustitución electrofílica aromática, adición nucleofílica a carbonilo, sustitución nucleofílica de acilo) con flechas curvas, intermediarios, diagrama de energía y el simulador "¿SN1, SN2, E1 o E2?". Cada mecanismo en un JSON curado con referencia (Wade, McMurry, Clayden) y marcado "pendiente de revisión" hasta que yo lo valide.
- Fase 11: Espectroscopía (IR, RMN 1H y 13C, masas) con ejercicios "deduce la estructura"; espectros simulados y rotulados como tales si no hay fuente con licencia.
- Fase 12: Síntesis y biomoléculas (rutas de síntesis, polímeros, carbohidratos en Haworth 3D, lípidos, aminoácidos y proteínas, ácidos nucleicos).
Una fase a la vez, con capturas y mi confirmación antes de continuar.

────────────────────────────────────────
Empieza por la Fase M0.
