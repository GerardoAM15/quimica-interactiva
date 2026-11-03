# Datos: fuentes y decisiones

Todos los datos se regeneran con `npm run datos` (los scripts guardan una caché en `scripts/.cache`;
usar `--sin-cache` para forzar la descarga).

| Archivo | Fuente | Script |
|---|---|---|
| `src/data/elementos.json` | PubChem Periodic Table (dominio público) + nombres en español | `scripts/descargar-elementos.mjs` |
| `src/data/isotopos.json` | NIST, *Atomic Weights and Isotopic Compositions* | `scripts/descargar-isotopos.mjs` |
| `src/data/constantes.json` | CODATA 2022 (NIST) | `scripts/descargar-constantes.mjs` |
| `src/chem/__tests__/fixtures/masas-pubchem.json` | PubChem PUG REST (42 compuestos) | `scripts/descargar-masas-referencia.mjs` |
| `src/data/moleculas.json` + `public/moleculas/*.sdf` | PubChem: propiedades, conformeros 3D (294 moléculas) y puntos de ebullición (PUG View) | `scripts/descargar-moleculas.mjs` |
| `src/data/dipolos.json` | Transcrito: CRC Handbook §9 (momentos dipolares) | manual — **pendiente de revisión** |
| `src/data/ebullicion-complementaria.json` | Transcrito: CRC Handbook §4 (H₂Te, SnH₄) | manual — **pendiente de revisión** |
| `src/data/apariencia.json` | Transcrito: CRC Handbook §4, Greenwood-Earnshaw | manual — **pendiente de revisión** |
| `src/data/cristales.json` | Transcrito: CRC Handbook §12 | manual — **pendiente de revisión** |

## Masa atómica

La tabla periódica de PubChem trunca algunos valores (Pb «207», Li «7», Br «79.9», Fe «55.84»), aunque
sus masas molares de compuestos usan los valores completos. La masa atómica de la aplicación se toma así:

1. Peso atómico estándar IUPAC (vía NIST) si es un valor único: Fe 55,845, Pb 207,2.
2. Si IUPAC da un intervalo [a, b] (H, C, N, O, S, Cl…): el valor de PubChem si está dentro del
   intervalo (es el que usa PubChem en sus compuestos, p. ej. S = 32,07); si no, el valor convencional
   IUPAC (Li 6,94; Br 79,904).
3. Elementos sin peso estándar (radiactivos): valor de PubChem (masa del isótopo más estable).

El valor original de PubChem se conserva en `masaAtomicaPubChem`.

## Diferencias documentadas

| Caso | Detalle |
|---|---|
| Configuración del Lr | Se usa [Rn] 5f¹⁴ 7s² 7p¹ (Sato et al., *Nature* 520, 209, 2015). PubChem lista 7s² 6d¹. |
| Masa promedio del Se | La composición isotópica representativa (NIST) da 78,959 u; el peso estándar vigente es 78,971 u (revisión IUPAC 2013). |
| Masa promedio del Pb | Composición isotópica muy variable en la naturaleza (plomo radiogénico); IUPAC 2020 usa un intervalo. |
| Densidad del K | La densidad calculada con la red bcc (0,859 g/cm³) coincide con el CRC (0,862); PubChem lista 0,89. |

## Correcciones detectadas por las pruebas

La prueba «densidad teórica vs PubChem» (`cristales.test.ts`) detectó dos parámetros de red mal transcritos,
ya corregidos: **Rb** (558,5 → 570,5 pm; el valor anterior era a baja temperatura) y **Cr** (291,0 → 288,5 pm).

## Pendiente de revisión por el autor

- `apariencia.json`: colores aproximados (sRGB) de la descripción de cada elemento y colores de emisión de
  los tubos de descarga.
- `cristales.json`: parámetros de red. Todos reproducen la densidad de PubChem con error < 3 %.
- Parámetros de red de NaCl, CsCl, CaF₂ y ZnS (`src/chem/cristales.ts`): reproducen la densidad del CRC
  con error < 1,5 %.

## Catálogo de moléculas

- Cada entrada se busca por nombre en PubChem y se comprueba contra la fórmula esperada (así se detectó, por
  ejemplo, que «monosodium glutamate» devuelve el monohidrato).
- **Conformeros hipervalentes:** el conformero de PubChem del SF₄ es tetraédrico (los campos de fuerzas no modelan
  bien los pares libres). Para especies con 5 o 6 dominios la aplicación usa la geometría VSEPR ideal.
- **Puntos de ebullición:** se prefiere el valor del CRC Handbook; se descartan disoluciones, descomposición,
  desigualdades y presiones distintas de 1 atm; las sublimaciones se marcan como tales. Para las moléculas
  diatómicas de elementos se contrasta con la tabla periódica de PubChem: el registro del H₂ en PUG View trae el
  punto de fusión (−259,16 °C) en lugar del de ebullición (−252,87 °C), y se corrigió.
- PubChem **trunca** las masas molares al último decimal que muestra (C₁₈H₃₂O₂: 280,452 → «280,4»).
- Radios iónicos de Shannon (redes iónicas) y radios covalentes de Cordero (geometría aproximada) están en el código
  con su cita; los iónicos están pendientes de revisión.
