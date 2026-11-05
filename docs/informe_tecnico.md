# Informe técnico — Química Interactiva

## 1. Objetivo y alcance

Aplicación web educativa de química (preuniversitaria a general universitaria, con orgánica básica), en español,
instalable y utilizable sin conexión. 24 módulos en 7 bloques, modo estudio (quiz, tarjetas SM-2, simulacros de
admisión, hojas de trabajo imprimibles) y validación automática de los cálculos contra fuentes de referencia.

## 2. Arquitectura

| Capa | Contenido | Regla |
|---|---|---|
| `src/chem/` | Toda la química: fórmulas, configuración, orbitales, VSEPR, Lewis, balanceo, nomenclatura, estequiometría, gases, soluciones, termoquímica, cinética, equilibrio, ácido-base, electroquímica, solubilidad, orgánica | Funciones puras, sin React, con pruebas |
| `src/study/` | Generadores de preguntas, SM-2, mazo, simulacros | Sin React, con pruebas |
| `src/components/`, `src/modules/`, `src/pages/` | Interfaz (React 18 + TypeScript strict) | Sin lógica química propia |
| `src/data/` | JSON con fuente citada (`fuentes.ts` alimenta Créditos) | No inventar valores |
| `scripts/` | Descarga y preparación de datos (PubChem PUG REST/View, NIST, CODATA) | Reproducible: `npm run datos` |

Stack: Vite 6, React 18, TypeScript (`strict`, `noUncheckedIndexedAccess`), Tailwind CSS v4, Zustand, React Router
(HashRouter, `base: './'`), Three.js con @react-three/fiber 8 y drei 9, RDKit.js (WASM, solo estructura molecular),
KaTeX + mhchem, Recharts, Fuse.js, Vitest y vite-plugin-pwa (Workbox).

## 3. Algoritmos principales

- **Fórmulas y masas molares:** analizador recursivo (paréntesis, corchetes, hidratos, iones, Unicode);
  M = Σ nᵢ·Aᵣ(i) con masas atómicas de PubChem/NIST.
- **Configuración electrónica:** regla de Möller con tabla de excepciones (Cr, Cu, Mo, Ag, Au…); iones retirando
  primero los electrones de mayor n.
- **Orbitales:** ψ hidrogenoides exactos (Laguerre y armónicos reales); isosuperficies por *marching cubes* en un
  Web Worker; umbral elegido por la probabilidad encerrada.
- **VSEPR y 3D:** dominios = vecinos + pares libres; geometría ideal para moléculas «estrella» e hipervalentes; para
  el resto, coordenadas 3D por restricciones de distancia; conformeros de PubChem cuando existen.
- **Balanceo:** matriz átomos × especies con fracciones exactas (`BigInt`), espacio nulo por RREF y enteros mínimos;
  redox por números de oxidación y método ion-electrón (medio ácido/básico).
- **Nomenclatura inorgánica:** catálogo generado por combinación de cationes, aniones y estados de oxidación, con los
  tres sistemas (tradicional, Stock, sistemática) y búsqueda inversa nombre → fórmula.
- **Nomenclatura orgánica:** nombrador propio sobre el grafo molecular (reglas IUPAC 1979/1993): grupo principal,
  cadena principal por criterios jerárquicos y numeración por localizadores más bajos; analizador inverso
  nombre → grafo → SMILES (dibujado por RDKit).
- **pH:** balance de carga exacto resuelto por bisección (monótono en pH), válido para ácidos y bases fuertes y
  débiles, polipróticos, buffers y titulaciones con dilución; las aproximaciones de los textos se muestran aparte.
- **Equilibrio:** tabla ICE resolviendo ln Q(x) = ln K por bisección (sin «x despreciable»); Le Chatelier por
  integración de la ley de acción de masas; Van ’t Hoff con ΔH° de las tablas.
- **Electroquímica:** igualación de electrones por mcm, E°celda, ΔG° = −nFE°, K y Nernst.
- **Solubilidad:** reglas con excepciones tabuladas; predicción de precipitados y ecuación iónica neta eliminando
  iones espectadores.
- **Modo estudio:** generadores con semilla (mulberry32) que construyen cada pregunta desde `chem/` (no hay bancos
  fijos); distractores con errores típicos; SM-2 de Woźniak.

## 4. Datos

Fuentes registradas en `src/data/fuentes.ts` (página Créditos): PubChem (elementos, 297 moléculas con SDF 3D,
nombres IUPAC, descripción física), CODATA 2022, NIST (isótopos, espectro), CRC Handbook, Chang, Brown, McMurry,
Cordero, Shannon y Wikimedia Commons (solo CC BY, CC BY-SA, CC0 o dominio público). Lo transcrito de libros o
clasificado automáticamente se marca «pendiente de revisión»; la lista completa se genera con `npm run pendientes`
en [pendientes_revision.md](pendientes_revision.md). Decisiones y correcciones en [datos.md](datos.md) y
[nomenclatura.md](nomenclatura.md).

## 5. Validación

`npm test` ejecuta ~1300 pruebas y regenera [tabla_validacion.md](tabla_validacion.md) (referencia vs calculado y
error). Requisitos mínimos de la especificación:

| Requisito | Resultado |
|---|---|
| Masas molares vs PubChem, ≥ 30 compuestos, error < 0,01 g/mol | 42 compuestos |
| Balanceo, ≥ 40 ecuaciones (incluye redox ácido/básico) | 48 ecuaciones |
| Nomenclatura inorgánica, ≥ 100 pares en las 3 nomenclaturas | 308 pares |
| Nomenclatura orgánica, ≥ 80 pares IUPAC ↔ SMILES vs PubChem | 126 pares (estructura → nombre, nombre → estructura y nombre inglés = IUPACName de PubChem) |
| VSEPR, ≥ 25 moléculas | 43 casos |
| pH (fuertes, débiles, buffers, titulación) vs analítico, error < 0,01 | Cumple |
| Gases, termoquímica, cinética, equilibrio, Nernst vs ejercicios de Chang | Cumple |
| Orbitales: normalización de ψ y nodos | Cumple |
| Integridad de datos (elementos y catálogo) | Cumple |
| Solubilidad, ≥ 30 casos | 38 casos + pruebas de predicción de precipitados y ecuación iónica neta |

## 6. Rendimiento y accesibilidad

- Carga diferida por página y por módulo; RDKit (WASM), Three.js, KaTeX, Recharts y Fuse.js solo en los fragmentos
  que los usan. Portada: ≈ 72 kB JS + 8 kB CSS comprimidos (límite: 100 kB).
- Escenas 3D con `frameloop="demand"` salvo animaciones, botón FPS y entorno de iluminación local (sin HDR externo).
- Cálculo de orbitales en Web Worker.
- Accesibilidad: auditoría automática con axe-core (WCAG 2.1 A/AA) en los 24 módulos, la portada, el modo estudio y
  Créditos, en tema oscuro y claro, sin infracciones; foco visible, navegación con teclado (pestañas WAI-ARIA),
  textos alternativos en escenas 3D y gráficas, `prefers-reduced-motion`.
- Diseño adaptable de 360 px a escritorio (comprobado a 360 × 800 y 1366 × 900).

## 7. PWA y uso sin conexión

Workbox precachea toda la compilación (≈ 424 recursos, ≈ 11 MB, incluidos el WASM de RDKit y los SDF del catálogo).
La página «Usar sin conexión» compara el manifiesto de precaché de `sw.js` con la caché, descarga lo que falte con
la misma clave que usa Workbox y solicita almacenamiento persistente. Comprobado: con la red desactivada se recargan
módulos con RDKit y 3D. Requieren red solo la búsqueda en PubChem y las fotos de Wikimedia.

## 8. Limitaciones conocidas

- Nombrador orgánico: no cubre policíclicos, heterociclos, estereodescriptores (R/S, E/Z) ni ramas insaturadas o con
  heteroátomos (lo indica al usuario). Previsto en las fases extra 9–12.
- Las geometrías 3D generadas (moléculas fuera del catálogo) son aproximadas y se rotulan como tales.
- Los datos marcados «pendiente de revisión» deben contrastarse con la fuente impresa.
- El aspecto de los compuestos se clasifica automáticamente desde la descripción de PubChem (se conserva la frase
  original); hay correcciones manuales documentadas en el script.

## 9. Construcción y despliegue

```bash
npm ci && npm test && npm run build   # dist/ listo para publicar
npm run preview                        # prueba local de la PWA
```

`.github/workflows/deploy.yml` ejecuta pruebas y compilación en cada push y publica `dist/` en GitHub Pages al hacer
push a `main` (Settings → Pages → Source: GitHub Actions).
