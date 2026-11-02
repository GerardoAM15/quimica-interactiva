# Datos: fuentes y decisiones

Todos los datos se regeneran con `npm run datos` (los scripts guardan una caché en `scripts/.cache`;
usar `--sin-cache` para forzar la descarga).

| Archivo | Fuente | Script |
|---|---|---|
| `src/data/elementos.json` | PubChem Periodic Table (dominio público) + nombres en español | `scripts/descargar-elementos.mjs` |
| `src/data/isotopos.json` | NIST, *Atomic Weights and Isotopic Compositions* | `scripts/descargar-isotopos.mjs` |
| `src/data/constantes.json` | CODATA 2022 (NIST) | `scripts/descargar-constantes.mjs` |
| `src/chem/__tests__/fixtures/masas-pubchem.json` | PubChem PUG REST (42 compuestos) | `scripts/descargar-masas-referencia.mjs` |
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
