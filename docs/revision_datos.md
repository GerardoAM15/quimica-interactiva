# Revisión de datos

Generado con `npm run revision` (2026-11-13) a partir de los datos marcados «pendiente de
revisión» (lista en `docs/pendientes_revision.md`). Muestra **el valor que usa hoy la aplicación**, su unidad y la
fuente citada. El script solo lee: **no cambia ningún valor**.

Cómo usarlo: compara cada fila con tu libro y anota en la columna «En mi libro» el valor si difiere (o ✓ si
coincide). Con esa lista se corrigen los valores y se retira la marca «pendiente de revisión».

Total: 820 filas en 26 tablas. Los números se muestran tal como están guardados, con coma decimal.

## A. Datos citados de Chang (y Brown)

### Constantes de ionización de ácidos débiles (Ka, 25 °C)

- Origen: `src/data/acidos-bases.json → acidos`
- Fuente citada: Chang, tablas 15.3 y 15.5
- Unidad: adimensional

| Ácido | Fórmula | Ka₁ | Ka₂ | Ka₃ | En mi libro |
|---|---|---|---|---|---|
| ácido fluorhídrico | HF | 7,1 × 10⁻⁴ | — | — |  |
| ácido nitroso | HNO2 | 4,5 × 10⁻⁴ | — | — |  |
| ácido fórmico | HCOOH | 1,7 × 10⁻⁴ | — | — |  |
| ácido benzoico | C6H5COOH | 6,5 × 10⁻⁵ | — | — |  |
| ácido acético | CH3COOH | 1,8 × 10⁻⁵ | — | — |  |
| ácido cianhídrico | HCN | 4,9 × 10⁻¹⁰ | — | — |  |
| fenol | C6H5OH | 1,3 × 10⁻¹⁰ | — | — |  |
| ácido oxálico | H2C2O4 | 0,065 | 6,1 × 10⁻⁵ | — |  |
| ácido sulfuroso | H2SO3 | 0,013 | 6,3 × 10⁻⁸ | — |  |
| ácido fosfórico | H3PO4 | 0,0075 | 6,2 × 10⁻⁸ | 4,8 × 10⁻¹³ |  |
| ácido carbónico | H2CO3 | 4,2 × 10⁻⁷ | 4,8 × 10⁻¹¹ | — |  |
| ácido sulfhídrico | H2S | 9,5 × 10⁻⁸ | 1 × 10⁻¹⁹ | — |  |

### Constantes de ionización de bases débiles (Kb, 25 °C)

- Origen: `src/data/acidos-bases.json → bases`
- Fuente citada: Chang, tabla 15.4
- Unidad: adimensional

| Base | Fórmula | Kb | En mi libro |
|---|---|---|---|
| etilamina | C2H5NH2 | 5,6 × 10⁻⁴ |  |
| metilamina | CH3NH2 | 4,4 × 10⁻⁴ |  |
| amoníaco | NH3 | 1,8 × 10⁻⁵ |  |
| piridina | C5H5N | 1,7 × 10⁻⁹ |  |
| anilina | C6H5NH2 | 3,8 × 10⁻¹⁰ |  |

### Ácidos y bases fuertes

- Origen: `src/data/acidos-bases.json → fuertes`
- Fuente citada: Chang, cap. 15 (el archivo no cita una tabla concreta)
- Unidad: —

| Tipo | Especies consideradas fuertes | En mi libro |
|---|---|---|
| Ácidos | HCl, HBr, HI, HNO3, HClO4, H2SO4 (primera ionización) |  |
| Bases | LiOH, NaOH, KOH, RbOH, CsOH, Ca(OH)2, Sr(OH)2, Ba(OH)2 |  |

### Productos de solubilidad (Ksp, 25 °C)

- Origen: `src/data/acidos-bases.json → ksp`
- Fuente citada: Chang, tabla 16.2
- Unidad: adimensional

| Compuesto | Fórmula | Ksp | En mi libro |
|---|---|---|---|
| cloruro de plata | AgCl | 1,6 × 10⁻¹⁰ |  |
| bromuro de plata | AgBr | 7,7 × 10⁻¹³ |  |
| yoduro de plata | AgI | 8,3 × 10⁻¹⁷ |  |
| sulfato de bario | BaSO4 | 1,1 × 10⁻¹⁰ |  |
| carbonato de calcio | CaCO3 | 8,7 × 10⁻⁹ |  |
| fluoruro de calcio | CaF2 | 4 × 10⁻¹¹ |  |
| cloruro de plomo(II) | PbCl2 | 2,4 × 10⁻⁴ |  |
| yoduro de plomo(II) | PbI2 | 1,4 × 10⁻⁸ |  |
| cromato de plata | Ag2CrO4 | 1,1 × 10⁻¹² |  |
| hidróxido de magnesio | Mg(OH)2 | 1,2 × 10⁻¹¹ |  |
| hidróxido de hierro(III) | Fe(OH)3 | 1,1 × 10⁻³⁶ |  |
| fosfato de calcio | Ca3(PO4)2 | 1,2 × 10⁻²⁶ |  |

### Intervalos de viraje de indicadores

- Origen: `src/data/acidos-bases.json → indicadores`
- Fuente citada: Chang, tabla 16.1
- Unidad: pH

| Indicador | pH inicial | pH final | En mi libro |
|---|---|---|---|
| azul de timol | 1,2 | 2,8 |  |
| anaranjado de metilo | 3,1 | 4,4 |  |
| azul de bromofenol | 3 | 4,6 |  |
| rojo de metilo | 4,2 | 6,3 |  |
| azul de bromotimol | 6 | 7,6 |  |
| fenolftaleína | 8,3 | 10 |  |

### pH de sustancias comunes

- Origen: `src/data/acidos-bases.json → phComunes`
- Fuente citada: Chang, tabla 15.1
- Unidad: pH

| Sustancia | pH | En mi libro |
|---|---|---|
| jugo gástrico | 1,5 |  |
| jugo de limón | 2,4 |  |
| vinagre | 3 |  |
| jugo de naranja | 3,5 |  |
| leche | 6,5 |  |
| agua pura (25 °C) | 7 |  |
| sangre | 7,4 |  |
| leche de magnesia | 10,6 |  |
| amoníaco doméstico | 11,5 |  |

### Potenciales estándar de reducción (25 °C)

- Origen: `src/data/potenciales.json`
- Fuente citada: R. Chang, Química, tabla 19.1 (potenciales estándar de reducción a 25 °C)
- Unidad: V

| Semirreacción (reducción) | n (e⁻) | E° (V) | En mi libro |
|---|---|---|---|
| F2(g) + 2e- -> 2F-(ac) | 2 | 2,87 |  |
| O3(g) + 2H+(ac) + 2e- -> O2(g) + H2O(l) | 2 | 2,07 |  |
| Co3+(ac) + e- -> Co2+(ac) | 1 | 1,82 |  |
| H2O2(ac) + 2H+(ac) + 2e- -> 2H2O(l) | 2 | 1,77 |  |
| PbO2(s) + 4H+(ac) + SO4^2-(ac) + 2e- -> PbSO4(s) + 2H2O(l) | 2 | 1,7 |  |
| Ce4+(ac) + e- -> Ce3+(ac) | 1 | 1,61 |  |
| MnO4-(ac) + 8H+(ac) + 5e- -> Mn2+(ac) + 4H2O(l) | 5 | 1,51 |  |
| Au3+(ac) + 3e- -> Au(s) | 3 | 1,5 |  |
| Cl2(g) + 2e- -> 2Cl-(ac) | 2 | 1,36 |  |
| Cr2O7^2-(ac) + 14H+(ac) + 6e- -> 2Cr3+(ac) + 7H2O(l) | 6 | 1,33 |  |
| MnO2(s) + 4H+(ac) + 2e- -> Mn2+(ac) + 2H2O(l) | 2 | 1,23 |  |
| O2(g) + 4H+(ac) + 4e- -> 2H2O(l) | 4 | 1,23 |  |
| Br2(l) + 2e- -> 2Br-(ac) | 2 | 1,07 |  |
| NO3-(ac) + 4H+(ac) + 3e- -> NO(g) + 2H2O(l) | 3 | 0,96 |  |
| 2Hg2+(ac) + 2e- -> Hg2^2+(ac) | 2 | 0,92 |  |
| Hg2^2+(ac) + 2e- -> 2Hg(l) | 2 | 0,85 |  |
| Ag+(ac) + e- -> Ag(s) | 1 | 0,8 |  |
| Fe3+(ac) + e- -> Fe2+(ac) | 1 | 0,77 |  |
| O2(g) + 2H+(ac) + 2e- -> H2O2(ac) | 2 | 0,68 |  |
| MnO4-(ac) + 2H2O(l) + 3e- -> MnO2(s) + 4OH-(ac) | 3 | 0,59 |  |
| I2(s) + 2e- -> 2I-(ac) | 2 | 0,53 |  |
| O2(g) + 2H2O(l) + 4e- -> 4OH-(ac) | 4 | 0,4 |  |
| Cu2+(ac) + 2e- -> Cu(s) | 2 | 0,34 |  |
| AgCl(s) + e- -> Ag(s) + Cl-(ac) | 1 | 0,22 |  |
| SO4^2-(ac) + 4H+(ac) + 2e- -> SO2(g) + 2H2O(l) | 2 | 0,2 |  |
| Cu2+(ac) + e- -> Cu+(ac) | 1 | 0,15 |  |
| Sn4+(ac) + 2e- -> Sn2+(ac) | 2 | 0,13 |  |
| 2H+(ac) + 2e- -> H2(g) | 2 | 0 |  |
| Pb2+(ac) + 2e- -> Pb(s) | 2 | -0,13 |  |
| Sn2+(ac) + 2e- -> Sn(s) | 2 | -0,14 |  |
| Ni2+(ac) + 2e- -> Ni(s) | 2 | -0,25 |  |
| Co2+(ac) + 2e- -> Co(s) | 2 | -0,28 |  |
| PbSO4(s) + 2e- -> Pb(s) + SO4^2-(ac) | 2 | -0,31 |  |
| Cd2+(ac) + 2e- -> Cd(s) | 2 | -0,4 |  |
| Fe2+(ac) + 2e- -> Fe(s) | 2 | -0,44 |  |
| Cr3+(ac) + 3e- -> Cr(s) | 3 | -0,74 |  |
| Zn2+(ac) + 2e- -> Zn(s) | 2 | -0,76 |  |
| 2H2O(l) + 2e- -> H2(g) + 2OH-(ac) | 2 | -0,83 |  |
| Mn2+(ac) + 2e- -> Mn(s) | 2 | -1,18 |  |
| Al3+(ac) + 3e- -> Al(s) | 3 | -1,66 |  |
| Be2+(ac) + 2e- -> Be(s) | 2 | -1,85 |  |
| Mg2+(ac) + 2e- -> Mg(s) | 2 | -2,37 |  |
| Na+(ac) + e- -> Na(s) | 1 | -2,71 |  |
| Ca2+(ac) + 2e- -> Ca(s) | 2 | -2,87 |  |
| Sr2+(ac) + 2e- -> Sr(s) | 2 | -2,89 |  |
| Ba2+(ac) + 2e- -> Ba(s) | 2 | -2,9 |  |
| K+(ac) + e- -> K(s) | 1 | -2,93 |  |
| Li+(ac) + e- -> Li(s) | 1 | -3,05 |  |

### Datos termodinámicos (1 atm, 25 °C)

- Origen: `src/data/termodinamica.json → especies`
- Fuente citada: R. Chang, Química, apéndice 3 (datos termodinámicos a 1 atm y 25 °C)
- Unidad: ΔHf° en kJ/mol; S° en J/(mol·K); ΔGf° en kJ/mol

| Especie | Nombre | ΔHf° | S° | ΔGf° | En mi libro |
|---|---|---|---|---|---|
| H2(g) | hidrógeno | 0 | 131 | 0 |  |
| O2(g) | oxígeno | 0 | 205 | 0 |  |
| N2(g) | nitrógeno | 0 | 191,5 | 0 |  |
| C(grafito) | carbono (grafito) | 0 | 5,69 | 0 |  |
| C(diamante) | carbono (diamante) | 1,9 | 2,4 | 2,87 |  |
| Cl2(g) | cloro | 0 | 223 | 0 |  |
| S(rombico) | azufre (rómbico) | 0 | 31,88 | 0 |  |
| Fe(s) | hierro | 0 | 27,2 | 0 |  |
| Ca(s) | calcio | 0 | 41,6 | 0 |  |
| Na(s) | sodio | 0 | 51,05 | 0 |  |
| Al(s) | aluminio | 0 | 28,3 | 0 |  |
| Mg(s) | magnesio | 0 | 32,5 | 0 |  |
| O3(g) | ozono | 142,2 | 237,6 | 163,4 |  |
| H2O(l) | agua líquida | -285,8 | 69,9 | -237,2 |  |
| H2O(g) | vapor de agua | -241,8 | 188,7 | -228,6 |  |
| H2O2(l) | peróxido de hidrógeno | -187,6 | 109,6 | -118,1 |  |
| CO(g) | monóxido de carbono | -110,5 | 197,9 | -137,3 |  |
| CO2(g) | dióxido de carbono | -393,5 | 213,6 | -394,4 |  |
| CH4(g) | metano | -74,85 | 186,2 | -50,8 |  |
| C2H6(g) | etano | -84,7 | 229,5 | -32,89 |  |
| C3H8(g) | propano | -103,8 | 269,9 | -23,5 |  |
| C2H4(g) | eteno | 52,3 | 219,5 | 68,1 |  |
| C2H2(g) | etino | 226,6 | 200,8 | 209,2 |  |
| C6H6(l) | benceno | 49,04 | 172,8 | 124,5 |  |
| CH3OH(l) | metanol | -238,7 | 126,8 | -166,3 |  |
| C2H5OH(l) | etanol | -276,98 | 161 | -174,18 |  |
| C6H12O6(s) | glucosa | -1274,5 | 212,1 | -910,56 |  |
| NH3(g) | amoníaco | -46,3 | 193 | -16,6 |  |
| NO(g) | monóxido de nitrógeno | 90,4 | 210,6 | 86,7 |  |
| NO2(g) | dióxido de nitrógeno | 33,85 | 240,46 | 51,8 |  |
| N2O4(g) | tetróxido de dinitrógeno | 9,66 | 304,3 | 98,29 |  |
| N2O(g) | óxido nitroso | 81,56 | 219,99 | 103,6 |  |
| SO2(g) | dióxido de azufre | -296,1 | 248,5 | -300,4 |  |
| SO3(g) | trióxido de azufre | -395,2 | 256,2 | -370,4 |  |
| H2S(g) | sulfuro de hidrógeno | -20,15 | 205,64 | -33 |  |
| HCl(g) | cloruro de hidrógeno | -92,3 | 187 | -95,27 |  |
| NaCl(s) | cloruro de sodio | -410,9 | 72,38 | -384 |  |
| NaOH(s) | hidróxido de sodio | -426,8 | 64,18 | -380,7 |  |
| CaCO3(s) | carbonato de calcio | -1206,9 | 92,9 | -1128,8 |  |
| CaO(s) | óxido de calcio | -635,6 | 39,8 | -604,2 |  |
| Ca(OH)2(s) | hidróxido de calcio | -986,6 | 76,2 | -896,8 |  |
| Fe2O3(s) | óxido de hierro(III) | -822,2 | 90 | -741 |  |
| Al2O3(s) | óxido de aluminio | -1669,8 | 50,99 | -1576,4 |  |
| MgO(s) | óxido de magnesio | -601,8 | 26,78 | -569,6 |  |

### Calores específicos

- Origen: `src/data/termodinamica.json → caloresEspecificos`
- Fuente citada: Chang, tabla 6.2
- Unidad: J/(g·°C)

| Sustancia | c | En mi libro |
|---|---|---|
| agua líquida | 4,184 |  |
| aluminio | 0,9 |  |
| oro | 0,129 |  |
| grafito | 0,72 |  |
| diamante | 0,502 |  |
| cobre | 0,385 |  |
| hierro | 0,444 |  |
| mercurio | 0,139 |  |
| etanol | 2,46 |  |

### Constantes de Van der Waals

- Origen: `src/chem/gases.ts → VAN_DER_WAALS`
- Fuente citada: Chang, tabla 5.4
- Unidad: a en L²·atm/mol²; b en L/mol

| Gas | Nombre | a | b | En mi libro |
|---|---|---|---|---|
| He | helio | 0,034 | 0,0237 |  |
| Ne | neón | 0,211 | 0,0171 |  |
| Ar | argón | 1,34 | 0,0322 |  |
| Kr | kriptón | 2,32 | 0,0398 |  |
| Xe | xenón | 4,19 | 0,0511 |  |
| H2 | hidrógeno | 0,244 | 0,0266 |  |
| N2 | nitrógeno | 1,39 | 0,0391 |  |
| O2 | oxígeno | 1,36 | 0,0318 |  |
| Cl2 | cloro | 6,49 | 0,0562 |  |
| CO2 | dióxido de carbono | 3,59 | 0,0427 |  |
| CH4 | metano | 2,25 | 0,0428 |  |
| CCl4 | tetracloruro de carbono | 20,4 | 0,138 |  |
| NH3 | amoníaco | 4,17 | 0,0371 |  |
| H2O | agua | 5,46 | 0,0305 |  |

### Constantes ebulloscópicas y crioscópicas

- Origen: `src/chem/solutions.ts → CONSTANTES_COLIGATIVAS`
- Fuente citada: Chang, tabla 12.2
- Unidad: puntos normales en °C; Ke y Kc en °C·kg/mol (°C/m)

| Disolvente | P. ebullición | P. congelación | Ke | Kc | En mi libro |
|---|---|---|---|---|---|
| agua | 100 | 0 | 0,52 | 1,86 |  |
| benceno | 80,1 | 5,5 | 2,53 | 5,12 |  |
| etanol | 78,4 | -117,3 | 1,22 | 1,99 |  |
| ácido acético | 117,9 | 16,6 | 2,93 | 3,9 |  |
| ciclohexano | 80,7 | 6,6 | 2,79 | 20 |  |

### Constantes de equilibrio de ejemplo

- Origen: `src/modules/equilibrio/Equilibrio.tsx → PRESETS`
- Fuente citada: Chang, cap. 14
- Unidad: Kc adimensional; T en K

| Reacción | Kc | T (K) | Nota de fuente | En mi libro |
|---|---|---|---|---|
| H₂ + I₂ ⇌ 2HI (430 °C) | 54,3 | 703,15 | Chang, cap. 14 |  |
| N₂O₄ ⇌ 2NO₂ (25 °C) | 0,00463 | 298,15 | Chang, cap. 14 |  |
| CaCO₃(s) ⇌ CaO(s) + CO₂(g) (Kc = [CO₂]) | 0,00268 | 1073,15 | Chang, cap. 14 (P_CO₂ = 0,236 atm a 800 °C) |  |

### Reglas de solubilidad en agua (25 °C)

- Origen: `src/data/solubilidad.json → reglas`
- Fuente citada: R. Chang, Química, tabla 4.2 (reglas de solubilidad de compuestos iónicos en agua a 25 °C); T. Brown et al., Química, la ciencia central, tabla 4.1 (reglas de solubilidad)
- Unidad: —

| # | Regla | Resultado | En mi libro |
|---|---|---|---|
| 1 | Los compuestos de los metales alcalinos (Li⁺, Na⁺, K⁺…) y del amonio (NH₄⁺) son solubles. | soluble |  |
| 2 | Los nitratos y los acetatos son solubles. | soluble |  |
| 3 | Los cloruros, bromuros y yoduros son solubles, excepto los de Ag⁺, Pb²⁺ (y Hg₂²⁺). | soluble |  |
| 4 | Los sulfatos son solubles, excepto los de Ba²⁺, Sr²⁺, Pb²⁺ (insolubles) y los de Ca²⁺ y Ag⁺ (poco solubles). | soluble |  |
| 5 | Los carbonatos, fosfatos y cromatos son insolubles, excepto los de alcalinos y amonio. | insoluble |  |
| 6 | Los hidróxidos son insolubles, excepto los de alcalinos y Ba²⁺ (solubles) y los de Ca²⁺ y Sr²⁺ (poco solubles). | insoluble |  |
| 7 | Los sulfuros son insolubles, excepto los de alcalinos, amonio y Ca²⁺, Sr²⁺ y Ba²⁺. | insoluble |  |

### Excepciones a las reglas de solubilidad

- Origen: `src/data/solubilidad.json → excepciones`
- Fuente citada: R. Chang, Química, tabla 4.2 (reglas de solubilidad de compuestos iónicos en agua a 25 °C); T. Brown et al., Química, la ciencia central, tabla 4.1 (reglas de solubilidad)
- Unidad: —

| Catión | Anión | Resultado | Nota | En mi libro |
|---|---|---|---|---|
| Ca2+ | SO4^2- | poco | El yeso (CaSO₄·2H₂O) se disuelve poco. |  |
| Ag+ | SO4^2- | poco | — |  |
| Pb2+ | Cl- | poco | Poco soluble en frío; más soluble en agua caliente. |  |
| Pb2+ | Br- | poco | — |  |
| Ca2+ | OH- | poco | Lechada de cal: el Ca(OH)₂ se disuelve poco. |  |
| Sr2+ | OH- | poco | — |  |
| Ba2+ | OH- | soluble | — |  |
| Ca2+ | S^2- | soluble | Se hidroliza parcialmente (Brown la considera soluble). |  |
| Sr2+ | S^2- | soluble | Se hidroliza parcialmente. |  |
| Ba2+ | S^2- | soluble | Se hidroliza parcialmente. |  |
| Mg2+ | S^2- | reacciona | El MgS se hidroliza en agua: Mg(OH)₂ + H₂S. |  |
| Al3+ | S^2- | reacciona | El Al₂S₃ se hidroliza: precipita Al(OH)₃ y se libera H₂S. |  |
| Fe3+ | S^2- | reacciona | El Fe³⁺ oxida al S²⁻; se forman FeS y S. |  |
| Al3+ | CO3^2- | reacciona | No existe en agua: precipita Al(OH)₃ y se libera CO₂. |  |
| Fe3+ | CO3^2- | reacciona | No existe en agua: precipita Fe(OH)₃ y se libera CO₂. |  |
| NH4+ | OH- | reacciona | NH₄⁺ + OH⁻ → NH₃ + H₂O (no hay «hidróxido de amonio» como sólido). |  |
| Ag+ | OH- | insoluble | Precipita óxido de plata, Ag₂O (pardo). |  |

### Colores de precipitados

- Origen: `src/data/solubilidad.json → colores`
- Fuente citada: Colores de precipitados: análisis cualitativo (Chang, cap. 16)
- Unidad: —

| Compuesto | Color | En mi libro |
|---|---|---|
| AgCl | blanco |  |
| AgBr | amarillo pálido |  |
| AgI | amarillo |  |
| PbCl2 | blanco |  |
| PbBr2 | blanco |  |
| PbI2 | amarillo intenso |  |
| BaSO4 | blanco |  |
| SrSO4 | blanco |  |
| PbSO4 | blanco |  |
| CaSO4 | blanco |  |
| Ag2SO4 | blanco |  |
| CaCO3 | blanco |  |
| BaCO3 | blanco |  |
| SrCO3 | blanco |  |
| MgCO3 | blanco |  |
| ZnCO3 | blanco |  |
| PbCO3 | blanco |  |
| Ag2CO3 | amarillo pálido |  |
| Ag3PO4 | amarillo |  |
| Ag2CrO4 | rojo ladrillo |  |
| PbCrO4 | amarillo |  |
| BaCrO4 | amarillo |  |
| Mg(OH)2 | blanco |  |
| Ca(OH)2 | blanco |  |
| Al(OH)3 | blanco gelatinoso |  |
| Fe(OH)2 | verde pálido |  |
| Fe(OH)3 | pardo rojizo |  |
| Ni(OH)2 | verde |  |
| Cu(OH)2 | azul pálido |  |
| Zn(OH)2 | blanco |  |
| Pb(OH)2 | blanco |  |
| AgOH | pardo (Ag₂O) |  |
| FeS | negro |  |
| NiS | negro |  |
| CuS | negro |  |
| ZnS | blanco |  |
| Ag2S | negro |  |
| PbS | negro |  |

## B. Datos de otras fuentes (CRC Handbook, Callister, McMurry)

### Solubilidad en agua frente a la temperatura

- Origen: `src/chem/solutions.ts → SOLUBILIDAD`
- Fuente citada: CRC Handbook, «Aqueous solubility of inorganic compounds at various temperatures»
- Unidad: g de soluto / 100 g de agua

| Sal | Fórmula | 0 °C | 20 °C | 40 °C | 60 °C | 80 °C | 100 °C | En mi libro |
|---|---|---|---|---|---|---|---|---|
| nitrato de potasio | KNO3 | 13,3 | 31,6 | 63,9 | 110 | 169 | 246 |  |
| cloruro de sodio | NaCl | 35,7 | 35,9 | 36,4 | 37,1 | 38 | 39,2 |  |
| cloruro de potasio | KCl | 28 | 34,2 | 40,1 | 45,8 | 51,3 | 56,3 |  |
| nitrato de sodio | NaNO3 | 73 | 88 | 104 | 124 | 148 | 180 |  |
| sulfato de cerio(III) | Ce2(SO4)3 | 20,8 | 9,84 | 5,7 | 3,87 | — | — |  |

### Estructura cristalina y parámetros de red de los elementos

- Origen: `src/data/cristales.json`
- Fuente citada: CRC Handbook of Chemistry and Physics, sección 12: «Crystal Structures and Lattice Parameters of Allotropes of the Elements»; W. D. Callister, Ciencia e Ingeniería de Materiales, tabla 3.1 (metales comunes)
- Unidad: a y c en pm

| Elemento | Red | a | c | Nota | En mi libro |
|---|---|---|---|---|---|
| Li | bcc | 351 | — |  |  |
| Na | bcc | 429,1 | — |  |  |
| K | bcc | 532,8 | — |  |  |
| Rb | bcc | 570,5 | — |  |  |
| Cs | bcc | 614,1 | — |  |  |
| Ba | bcc | 502,8 | — |  |  |
| V | bcc | 302,4 | — |  |  |
| Cr | bcc | 288,5 | — |  |  |
| Fe | bcc | 286,7 | — | Hierro α (ferrita); por encima de 912 °C pasa a fcc (hierro γ). |  |
| Nb | bcc | 330 | — |  |  |
| Mo | bcc | 314,7 | — |  |  |
| Ta | bcc | 330,3 | — |  |  |
| W | bcc | 316,5 | — |  |  |
| Eu | bcc | 458,1 | — |  |  |
| Al | fcc | 404,9 | — |  |  |
| Ca | fcc | 558,8 | — |  |  |
| Sr | fcc | 608,5 | — |  |  |
| Ni | fcc | 352,4 | — |  |  |
| Cu | fcc | 361,5 | — |  |  |
| Rh | fcc | 380,3 | — |  |  |
| Pd | fcc | 389,1 | — |  |  |
| Ag | fcc | 408,6 | — |  |  |
| Ir | fcc | 383,9 | — |  |  |
| Pt | fcc | 392,4 | — |  |  |
| Au | fcc | 407,8 | — |  |  |
| Pb | fcc | 495,1 | — |  |  |
| Ce | fcc | 516,1 | — |  |  |
| Yb | fcc | 548,5 | — |  |  |
| Th | fcc | 508,4 | — |  |  |
| Be | hcp | 228,6 | 358,4 |  |  |
| Mg | hcp | 320,9 | 521,1 |  |  |
| Sc | hcp | 330,9 | 527,3 |  |  |
| Ti | hcp | 295,1 | 468,6 |  |  |
| Co | hcp | 250,7 | 406,9 |  |  |
| Zn | hcp | 266,5 | 494,7 |  |  |
| Y | hcp | 364,7 | 573,1 |  |  |
| Zr | hcp | 323,2 | 514,7 |  |  |
| Tc | hcp | 273,5 | 438,8 |  |  |
| Ru | hcp | 270,6 | 428,2 |  |  |
| Cd | hcp | 297,9 | 561,9 |  |  |
| Hf | hcp | 319,6 | 505,1 |  |  |
| Re | hcp | 276,1 | 445,6 |  |  |
| Os | hcp | 273,4 | 431,7 |  |  |
| Tl | hcp | 345,7 | 552,5 |  |  |
| Gd | hcp | 363,4 | 578,1 |  |  |
| Tb | hcp | 360,6 | 569,7 |  |  |
| Dy | hcp | 359,2 | 565 |  |  |
| Ho | hcp | 357,8 | 561,8 |  |  |
| Er | hcp | 355,9 | 558,5 |  |  |
| Tm | hcp | 353,8 | 555,4 |  |  |
| Lu | hcp | 350,5 | 554,9 |  |  |
| C | grafito | 246,4 | 671,1 | Grafito (forma estable a 25 °C). El diamante es otro alótropo con red tipo diamante, a = 356,7 pm. |  |
| Si | diamante | 543,1 | — |  |  |
| Ge | diamante | 565,8 | — |  |  |
| Po | sc | 335,2 | — | Polonio α: el único elemento con red cúbica simple a temperatura ambiente. |  |

### Estructuras cristalinas descritas solo en texto

- Origen: `src/data/cristales.json (red «otra»)`
- Fuente citada: CRC Handbook of Chemistry and Physics, sección 12: «Crystal Structures and Lattice Parameters of Allotropes of the Elements»
- Unidad: —

| Elemento | Descripción | En mi libro |
|---|---|---|
| Mn | Cúbica compleja (manganeso α, 58 átomos por celda). |  |
| Ga | Ortorrómbica. |  |
| In | Tetragonal centrada en el cuerpo. |  |
| Sn | Estaño β (blanco), tetragonal. Por debajo de 13 °C es estable el estaño α (gris), con red tipo diamante. |  |
| Hg | Líquido a 25 °C; sólido (por debajo de −38,8 °C) es romboédrico. |  |
| B | Romboédrica, formada por icosaedros B₁₂. |  |
| S | Ortorrómbica (azufre α), formada por moléculas S₈. |  |
| P | Fósforo blanco: sólido molecular de moléculas P₄. |  |
| I | Ortorrómbica, formada por moléculas I₂. |  |
| Se | Selenio gris: hexagonal, formada por cadenas helicoidales. |  |
| Te | Hexagonal, formada por cadenas helicoidales. |  |
| As | Arsénico gris: romboédrica, en capas. |  |
| Sb | Romboédrica, en capas. |  |
| Bi | Romboédrica, en capas. |  |
| U | Uranio α: ortorrómbica. |  |

### Redes iónicas: parámetro de red y radios iónicos

- Origen: `src/chem/cristales.ts → REDES_IONICAS, RADIOS_IONICOS`
- Fuente citada: CRC Handbook, sección 12 (parámetro de red); radios iónicos de Shannon
- Unidad: pm

| Red | Nombre | a | Coordinación | Radio del catión | Radio del anión | En mi libro |
|---|---|---|---|---|---|---|
| NaCl | Cloruro de sodio (sal gema) | 564 | 6 : 6 | Na: 102 | Cl: 181 |  |
| CsCl | Cloruro de cesio | 412,3 | 8 : 8 | Cs: 174 | Cl: 181 |  |
| CaF2 | Fluoruro de calcio (fluorita) | 546,3 | 8 : 4 | Ca: 112 | F: 131 |  |
| ZnS | Sulfuro de zinc (blenda) | 541 | 4 : 4 | Zn: 60 | S: 184 |  |

### Momentos dipolares (fase gaseosa)

- Origen: `src/data/dipolos.json`
- Fuente citada: CRC Handbook of Chemistry and Physics, sección 9: «Dipole Moments»
- Unidad: D (debye)

| Molécula | μ (D) | En mi libro |
|---|---|---|
| agua | 1,85 |  |
| amoníaco | 1,47 |  |
| fluoruro de hidrógeno | 1,83 |  |
| cloruro de hidrógeno | 1,11 |  |
| bromuro de hidrógeno | 0,83 |  |
| yoduro de hidrógeno | 0,45 |  |
| sulfuro de hidrógeno | 0,97 |  |
| fosfina | 0,57 |  |
| trifluoruro de nitrógeno | 0,24 |  |
| dióxido de azufre | 1,63 |  |
| ozono | 0,53 |  |
| monóxido de carbono | 0,11 |  |
| óxido nitroso | 0,16 |  |
| cianuro de hidrógeno | 2,98 |  |
| dióxido de carbono | 0 |  |
| metano | 0 |  |
| tetraclorometano | 0 |  |
| trifluoruro de boro | 0 |  |
| hexafluoruro de azufre | 0 |  |
| benceno | 0 |  |
| clorometano | 1,89 |  |
| diclorometano | 1,6 |  |
| triclorometano (cloroformo) | 1,04 |  |
| metanal (formaldehído) | 2,33 |  |
| propanona (acetona) | 2,88 |  |
| metanol | 1,7 |  |
| etanol | 1,69 |  |
| metoximetano (éter dimetílico) | 1,3 |  |
| etoxietano (éter dietílico) | 1,15 |  |
| etanonitrilo (acetonitrilo) | 3,92 |  |
| tolueno (metilbenceno) | 0,38 |  |
| fenol | 1,22 |  |
| anilina (fenilamina) | 1,13 |  |
| piridina | 2,22 |  |
| nitrometano | 3,46 |  |
| clorobenceno | 1,69 |  |

### Puntos de ebullición complementarios

- Origen: `src/data/ebullicion-complementaria.json`
- Fuente citada: CRC Handbook of Chemistry and Physics, sección 4: «Physical Constants of Inorganic Compounds»
- Unidad: °C

| Compuesto | P. ebullición (°C) | En mi libro |
|---|---|---|
| telururo de hidrógeno | -2,2 |  |
| estannano | -51,8 |  |

### Energías torsionales (análisis conformacional)

- Origen: `src/modules/hidrocarburos/Hidrocarburos.tsx`
- Fuente citada: McMurry, Química orgánica, cap. 3
- Unidad: kJ/mol

| Molécula | Conformación | Energía relativa | En mi libro |
|---|---|---|---|
| etano | eclipsada (barrera de rotación) | 12 |  |
| butano (C2–C3) | totalmente eclipsada (0°) | 19 |  |
| butano (C2–C3) | gauche (60°) | 3,8 |  |
| butano (C2–C3) | eclipsada (120°) | 16 |  |
| butano (C2–C3) | anti (180°) | 0 |  |

## C. Aspecto visual (no comparable con Chang)

Colores y clasificaciones aproximados que alimentan las muestras 3D; se incluyen para tener la lista completa.

### Aspecto de los elementos

- Origen: `src/data/apariencia.json → elementos`
- Fuente citada: CRC Handbook of Chemistry and Physics, sección 4: «The Elements» (descripción física de cada elemento); N. N. Greenwood y A. Earnshaw, Chemistry of the Elements, 2.ª ed.
- Unidad: color sRGB aproximado

| Elemento | Tipo | Color | Descripción |
|---|---|---|---|
| H | gas | #e48ad6 | Gas incoloro. En un tubo de descarga emite luz rosada-violácea (línea roja Hα de la serie de Balmer). |
| He | gas | #ffb08e | Gas incoloro. En un tubo de descarga brilla con un tono rosado-anaranjado. |
| N | gas | #c89cff | Gas incoloro. En un tubo de descarga emite una luz violeta-rosada. |
| O | gas | #c8b8ff | Gas incoloro (O₂). En un tubo de descarga emite una luz violeta pálida. |
| F | gas-coloreado | #efe9a2 | Gas amarillo pálido (F₂), extremadamente reactivo y tóxico. |
| Ne | gas | #ff5a1f | Gas incoloro. En un tubo de descarga brilla con el característico rojo-anaranjado de los letreros de neón. |
| Cl | gas-coloreado | #c6dd56 | Gas amarillo verdoso (Cl₂), tóxico, de olor irritante. |
| Ar | gas | #b48cff | Gas incoloro. En un tubo de descarga emite luz lila-violeta. |
| Kr | gas | #ece6ff | Gas incoloro. En un tubo de descarga emite luz blanca ligeramente lila. |
| Xe | gas | #8eb0ff | Gas incoloro. En un tubo de descarga brilla con un tono azul-lavanda. |
| Rn | gas | — | Gas incoloro y radiactivo. No se usa en tubos de descarga; color de emisión no representado. |
| Br | liquido | #7a1a08 | Líquido rojo pardo oscuro que desprende vapores anaranjados (Br₂). |
| Hg | liquido | #d4d7de | Metal líquido plateado y brillante a temperatura ambiente. |
| C | no-metal | #2c2c2e | Forma estable a 25 °C: grafito, gris negruzco con brillo metálico. Otro alótropo: diamante, transparente. |
| P | no-metal | #f1ecd8 | Fósforo blanco: sólido céreo blanco-amarillento. Otros alótropos: fósforo rojo y fósforo negro. |
| S | no-metal | #f2d02c | Sólido amarillo (azufre rómbico, moléculas S₈). |
| Se | no-metal | #5d5e63 | Selenio gris: sólido con brillo metálico (también existe una forma roja). |
| I | no-metal | #3a2747 | Cristales negro violáceos con brillo metálico; sublima en vapor violeta. |
| B | no-metal | #3b3632 | Metaloide: sólido negro pardusco, muy duro. |
| Si | metal | #6e7684 | Metaloide: sólido gris azulado con brillo metálico, quebradizo. |
| Ge | metal | #9aa0a9 | Metaloide: sólido blanco grisáceo con brillo metálico, quebradizo. |
| As | metal | #7b7d82 | Metaloide: arsénico gris, sólido con brillo metálico y quebradizo. |
| Sb | metal | #b6babf | Metaloide: sólido blanco plateado, brillante y quebradizo. |
| Te | metal | #b8bbbf | Metaloide: sólido blanco plateado, brillante y quebradizo. |
| Cu | metal | #d67a52 | Metal de color rojizo (cobrizo) y brillante. |
| Au | metal | #eeb23c | Metal amarillo brillante, muy maleable. |
| Cs | metal | #e5d29c | Metal alcalino blando de color dorado pálido; funde a 28,5 °C. |
| Os | metal | #b2bfd2 | Metal muy denso, gris azulado brillante. |
| Bi | metal | #c8b9c2 | Metal quebradizo blanco plateado con tinte rosado. |
| Pb | metal | #8e939b | Metal gris azulado, blando y opaco al oxidarse en la superficie. |
| Zn | metal | #b8c1cb | Metal blanco azulado. |
| Ga | metal | #c9ccd1 | Metal plateado blando; funde a 29,8 °C (se derrite en la mano). |
| Na | metal | #cfd2d6 | Metal alcalino blando y plateado; se oxida rápidamente al aire (se guarda en aceite). |
| K | metal | #cdd0d5 | Metal alcalino blando y plateado; reacciona violentamente con el agua. |

### Aspecto de los compuestos del catálogo (clasificación automática)

- Origen: `src/data/apariencia-compuestos.json`
- Fuente citada: PubChem PUG View: «Physical Description» y «Color/Form» (CAMEO Chemicals, HSDB, ICSC…)
- Unidad: —

| Compuesto | Estado | Forma | Color | Frase original (PubChem) | Fuente de la frase |
|---|---|---|---|---|---|
| 1-bromobutano | líquido | — | incoloro | Colorless to pale straw-colored liquid; [HSDB] Colorless liquid; [MSDSonline] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| 1,2-dicloroetano | líquido | — | incoloro | COLOURLESS VISCOUS LIQUID WITH CHARACTERISTIC ODOUR. TURNS DARK ON EXPOSURE TO AIR, MOISTURE AND LIGHT. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| 2-bromo-2-metilpropano | líquido | — | incoloro | Colorless liquid; [Merck Index] Colorless to yellow-brown liquid; [MSDSonline] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| 2-cloropropano | líquido | — | incoloro | 2-chloropropane appears as a colorless liquid with a chloroform-like odor. Vapors heavier than air. Less dense than water. May irritate skin and eyes, and be narcotic in high concentrations. A fire and explosion risk. Us | CAMEO Chemicals |
| 2-metilpentano | líquido | — | incoloro | Watery liquid with a gasoline-like odor, Floats on water. Produces an irritating vapor. (USCG, 1999) | CAMEO Chemicals |
| 2-metilpropan-1-ol (isobutanol) | líquido | — | incoloro | Isobutanol appears as a clear colorless liquid with a sweet odor. Flash point 85 - 100 °F. Less dense than water. Vapors heavier than air. | CAMEO Chemicals |
| 2-metilpropan-2-ol (terc-butanol) | líquido | — | incoloro | Tert-butyl alcohol is a colorless oily liquid with a sharp alcohol odor. Floats and mixes with water. Produces irritating vapor. Freezing point is 78 °F. (USCG, 1999) | CAMEO Chemicals |
| 2-metilpropeno | gas | — | incoloro | Isobutylene is a colorless gas with a faint petroleum-like odor. For transportation it may be stenched. It is shipped as a liquefied gas under its own vapor pressure. Contact with the liquid can cause frostbite. It is ea | CAMEO Chemicals |
| 2,2-dimetilbutano | líquido | — | incoloro | Colorless liquid with mild gasoline-like odor; [ACGIH] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| 2,3-dimetilbutano | líquido | — | incoloro | Colorless liquid with an odor of petroleum; [CAMEO] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| 2,4,6-trinitrotolueno (TNT) | sólido | cristal | amarillo | Tnt, wetted with not less than 30% water appears as a slurry of a yellow water-insoluble crystalline solid. Can burn, although difficult to ignite. When water has been driven off or evaporated the residue is easily ignit | CAMEO Chemicals |
| 3-metilpentano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| acetato de isoamilo (aroma de plátano) | líquido | — | incoloro | Iso-amyl acetate is an oily liquid; colorless; banana odor. Floats and mixes with water. Flammable, irritating vapor is produced. (USCG, 1999) | CAMEO Chemicals |
| acetofenona | líquido | — | incoloro | COLOURLESS LIQUID OR WHITE CRYSTALS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido acetilsalicílico (aspirina) | sólido | polvo | blanco | Acetylsalicylic acid appears as odorless white crystals or crystalline powder with a slightly bitter taste. (NTP, 1992) | CAMEO Chemicals |
| ácido acrílico | líquido | — | incoloro | Acrylic acid is a colorless liquid with a distinctive acrid odor. Flash point 130 °F. Boiling point 286 °F. Freezing point 53 °F. Corrosive to metals and tissue. Prolonged exposure to fire or heat can cause polymerizatio | CAMEO Chemicals |
| ácido ascórbico (vitamina C) | sólido | polvo | blanco | L-ascorbic acid is a white to very pale yellow crystalline powder with a pleasant sharp acidic taste. Almost odorless. (NTP, 1992) | CAMEO Chemicals |
| ácido aspártico | sólido | cristal | incoloro | COLOURLESS CRYSTALS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido benzoico | sólido | polvo | blanco | WHITE CRYSTALS OR POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido butanoico | líquido | — | incoloro | Butyric acid appears as a colorless liquid with a penetrating and unpleasant odor. Flash point 170 °F. Corrosive to metals and tissue. Density 8.0 lb /gal. | CAMEO Chemicals |
| ácido carbónico | — | — | — | Solo existe en disolución acuosa: no se puede aislar como sustancia pura. | Chang, Química |
| ácido cítrico | sólido | cristal | incoloro | Citric acid appears as colorless, odorless crystals with an acid taste. Denser than water. (USCG, 1999) | CAMEO Chemicals |
| ácido esteárico | sólido | sólido | blanco | Stearic acid is a white solid with a mild odor. Floats on water. (USCG, 1999) | CAMEO Chemicals |
| ácido etanoico (acético) | líquido | — | incoloro | Acetic acid, glacial appears as a clear colorless liquid with a strong odor of vinegar. Flash point 104 °F. Density 8.8 lb / gal. Corrosive to metals and tissue. Used to make other chemicals, as a food additive, and in p | CAMEO Chemicals |
| ácido fosfórico | sólido | cristal | incoloro | HYGROSCOPIC COLOURLESS CRYSTALS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido glutámico | sólido | polvo | blanco | White crystals or crystalline powder | EU Food Improvement Agents |
| ácido hipocloroso | — | — | — | Solo existe en disolución acuosa: no se puede aislar como sustancia pura. | Chang, Química |
| ácido láctico | líquido | — | incoloro | VISCOUS COLOURLESS-TO-YELLOW LIQUID OR COLOURLESS-TO-YELLOW CRYSTALS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido linoleico | líquido | — | incoloro | Linoleic acid is a colorless to straw colored liquid. A polyunsaturated fatty acid essential to human diet. | CAMEO Chemicals |
| ácido metanoico (fórmico) | líquido | — | incoloro | Formic acid appears as a colorless liquid with a pungent odor. Flash point 156 °F. Density 10.2 lb / gal. Corrosive to metals and tissue. | CAMEO Chemicals |
| ácido nítrico | líquido | — | incoloro | Nitric acid, other than red fuming appears as a pale yellow to reddish brown liquid with reddish brown vapors and a suffocating odor. Very toxic by inhalation. Corrosive to metals or tissue. Accelerates the burning of co | CAMEO Chemicals (corrección: El HNO₃ puro es incoloro; el rojo/amarillo se debe al NO₂ disuelto (ácido fumante o envejecido).) |
| ácido nitroso | — | — | — | Solo existe en disolución acuosa: no se puede aislar como sustancia pura. | Chang, Química |
| ácido oleico | líquido | — | incoloro | Oleic acid is a colorless to pale yellow liquid with a mild odor. Floats on water. (USCG, 1999) | CAMEO Chemicals |
| ácido oxálico | sólido | sólido | blanco | Oxalic acid is an odorless white solid. Sinks and mixes with water. (USCG, 1999) | CAMEO Chemicals |
| ácido palmítico | sólido | cristal | incoloro | COLOURLESS OR WHITE CRYSTALS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido perclórico | líquido | — | incoloro | COLOURLESS LIQUID WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ácido pirúvico | líquido | — | incoloro | Liquid with an odor like acetic acid; mp = 11.8 deg C; [Merck Index] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| ácido propanoico | líquido | — | incoloro | Propionic acid is a colorless liquid with a sharp rancid odor. Produces irritating vapor. (USCG, 1999) | CAMEO Chemicals |
| ácido salicílico | sólido | sólido | blanco | Salicylic acid is an odorless white to light tan solid. Sinks and mixes slowly with water. (USCG, 1999) | CAMEO Chemicals |
| ácido sórbico | sólido | polvo | blanco | Sorbic acid appears as white powder or crystals. Melting point 134.5 °C. Slightly acidic and astringent taste with a faint odor. | CAMEO Chemicals |
| ácido sulfúrico | líquido | — | incoloro | Sulfuric acid, spent appears as a black oily liquid. Corrosive to metals and tissue. Density 15 lb /gal. | CAMEO Chemicals (corrección: El H₂SO₄ puro es un líquido aceitoso incoloro; el color oscuro corresponde al producto técnico.) |
| acrilonitrilo | líquido | — | incoloro | Acrylonitrile, stabilized appears as a clear colorless liquid with a strong pungent odor. Flash point 32 °F. Prolonged exposure to the vapors or skin contact harmful. Density 6.7 lb / gal. Vapors heavier than air. Combus | CAMEO Chemicals |
| adenina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| adenosina | sólido | sólido | blanco | Solid | Human Metabolome Database (HMDB) |
| adrenalina | sólido | polvo | blanco | Solid | Human Metabolome Database (HMDB) (corrección: La adrenalina pura es blanca; se oscurece al oxidarse con el aire y la luz.) |
| agua | líquido | — | incoloro | Clear colorless odorless liquid; [NTP] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| alanina | sólido | cristal | blanco | Solid; [Merck Index] White odorless solid; [HSDB] White crystalline solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| alcanfor | sólido | polvo | blanco | Camphor appears as a colorless or white colored crystalline powder with a strong mothball-like odor. About the same density as water. Emits flammable vapors above 150 °F. Used to make moth proofings, pharmaceuticals, and | CAMEO Chemicals |
| alcohol bencílico | líquido | — | incoloro | Benzyl alcohol appears as a clear colorless liquid with a pleasant odor. Slightly denser than water. Flash point 194 °F. Boiling point 401 °F. Contact may irritate skin, eyes, and mucous membranes. May be slightly toxic  | CAMEO Chemicals |
| amoníaco | gas | — | incoloro | Ammonia, anhydrous appears as a clear colorless gas with a strong odor. Shipped as a liquid under its own vapor pressure. Density (liquid) 6 lb / gal. Contact with the unconfined liquid can cause frostbite. Gas generally | CAMEO Chemicals |
| anhídrido acético | líquido | — | incoloro | Acetic anhydride appears as a clear colorless liquid with a strong odor of vinegar. Flash point 129 °F. Corrosive to metals and tissue. Density 9.0 lb /gal. Used to make fibers, plastics, pharmaceuticals, dyes, and explo | CAMEO Chemicals |
| anilina (fenilamina) | líquido | — | incoloro | COLOURLESS OILY LIQUID WITH CHARACTERISTIC ODOUR. TURNS BROWN ON EXPOSURE TO AIR OR LIGHT. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| anisol (metoxibenceno) | líquido | — | incoloro | COLOURLESS-TO-YELLOW LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| antraceno | sólido | cristal | blanco | WHITE CRYSTALS OR FLAKES. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| arginina | sólido | polvo | blanco | Solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| arsina | gas | — | incoloro | Arsine appears as a chemical warfare blood agent. It is a colorless gas with a disagreeable garlic odor. Flammable. Heavier than air. Flame easily flashes back to the source of leak. Extremely toxic by inhalation. Confir | CAMEO Chemicals |
| asparagina | sólido | polvo | blanco | Solid; [Merck Index] White hygroscopic powder; [Alfa Aesar MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| aspartamo | sólido | polvo | blanco | White, odourless, crystalline powder having a sweet taste. Approximately 200 times as sweet as sucrose | EU Food Improvement Agents |
| benceno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| benzaldehído | líquido | — | incoloro | COLOURLESS-TO-YELLOW LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| benzamida | sólido | polvo | blanco | Benzamide is a white powder. (NTP, 1992) | CAMEO Chemicals |
| benzoato de sodio | sólido | polvo | blanco | WHITE HYGROSCOPIC CRYSTALLINE POWDER OR GRANULES | ILO-WHO International Chemical Safety Cards (ICSCs) |
| benzocaína | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| benzonitrilo | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| bicarbonato de sodio | sólido | polvo | blanco | FINE WHITE CRYSTALLINE POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| bromo (Br2) | líquido | — | rojo | FUMING RED-TO-BROWN LIQUID WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| bromobenceno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| bromoetano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| bromometano | gas | — | incoloro | Methyl bromide appears as colorless highly toxic volatile liquid or a gas. Boiling point 3.56 °C (38.41 °F). Usually odorless, but has a sweetish chloroform-like odor at high concentrations. Used as an insecticide, a rod | CAMEO Chemicals |
| bromuro de hidrógeno | gas | — | incoloro | Hydrogen bromide, anhydrous appears as a colorless gas with a pungent irritating odor. Corrosive. Heavier than air. Prolonged exposure to fire or intense heat may result in the violent rupture and rocketing of the contai | CAMEO Chemicals |
| but-1-eno | gas | — | incoloro | 1-butene is a colorless gas. (NTP, 1992) | CAMEO Chemicals |
| but-2-ino | líquido | — | incoloro | Clear colorless liquid with an odor of petroleum; [CAMEO] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| buta-1,3-dieno | gas | — | incoloro | Butadiene is a colorless gas with an aromatic odor. It is shipped as a liquefied gas under its vapor pressure. Contact with the liquid can cause frostbite. It is easily ignited. Its vapors are heavier than air and a flam | CAMEO Chemicals |
| butan-1-ol | líquido | — | incoloro | N-butyl alcohol is a colorless liquid. Used in organic chemical synthesis, plasticizers, detergents, etc. | CAMEO Chemicals |
| butan-2-ol | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| butanal | líquido | — | incoloro | COLOURLESS LIQUID WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| butano | gas | — | incoloro | Butane is a colorless gas with a faint petroleum-like odor. For transportation it may be stenched. It is shipped as a liquefied gas under its vapor pressure. Contact with the liquid can cause frostbite. It is easily igni | CAMEO Chemicals |
| butanoato de etilo (aroma de piña) | líquido | — | incoloro | Colorless liquid with an odor of pineapple; [Merck Index] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| butanona | líquido | — | incoloro | Methyl ethyl ketone appears as colorless fairly volatile liquid with a pleasant pungent odor. Flash point 20 °F. Vapors heavier than air. Does not react with water or many common materials. Stable in normal transportatio | CAMEO Chemicals |
| cafeína | sólido | polvo | blanco | ODOURLESS WHITE CRYSTALS OR CRYSTALLINE POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| capsaicina (ají) | sólido | polvo | blanco | Dark red solid with a volatile pungent odor; [HSDB] Formulated as dry powder, liquid, and liquid spray; [Reference #1] White crystalline solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases (corrección: La capsaicina pura es un sólido cristalino blanco (el rojo es del ají).) |
| carbonato de calcio | sólido | polvo | blanco | WHITE POWDER OR PELLETS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| cianuro de hidrógeno | líquido | — | incoloro | COLOURLESS GAS OR LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ciclohexano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ciclohexanol | líquido | — | incoloro | Cyclohexanol appears as a colorless liquid with a camphor-like odor. Soluble in most organic liquids. Flash point 154 °F. May be toxic by inhalation or skin exposure. Vapors are narcotic in high concentrations. Irritates | CAMEO Chemicals |
| ciclohexanona | líquido | — | incoloro | Cyclohexanone appears as a colorless to pale yellow liquid with a pleasant odor. Less dense than water. Flash point 111 °F. Vapors heavier than air. Used to make nylon, as a chemical reaction medium, and as a solvent. | CAMEO Chemicals |
| ciclohexeno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ciclopentano | líquido | — | incoloro | COLOURLESS LIQUID WITH MILD ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| ciclopropano | gas | — | incoloro | Cyclopropane is a colorless gas with a petroleum-like odor. It is shipped as a liquid at 4-6 atms. It is easily ignited. The vapors are heavier than air. Contact with the liquid may cause frostbite. It can asphyxiate by  | CAMEO Chemicals |
| cinamaldehído (canela) | líquido | — | amarillo | Yellowish oily liquid; [HSDB] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| cis-but-2-eno | gas | — | incoloro | 2-butene appears as a colorless liquefied petroleum gas. Asphyxiate gas. Flammability limits in air 1.8-9.7% by volume. | CAMEO Chemicals |
| cisteína | sólido | cristal | incoloro | Colorless or white solid; [HSDB] Colorless crystalline solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| citosina | sólido | polvo | blanco | Monohydrate: Lustrous solid; [Merck Index] White powder; [Alfa Aesar MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| cloro (Cl2) | gas | — | amarillo verdoso | GREENISH-YELLOW COMPRESSED LIQUEFIED GAS WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| clorobenceno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| cloroetano | gas | — | incoloro | COLOURLESS COMPRESSED LIQUEFIED GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| cloroeteno (cloruro de vinilo) | gas | — | incoloro | Vinyl chloride appears as a colorless gas with a sweet odor. Easily ignited. Shipped as a liquefied gas under own vapor pressure. Contact with the unconfined liquid may cause frostbite by evaporative cooling. Leaks may b | CAMEO Chemicals |
| clorometano | gas | — | incoloro | Methyl chloride appears as a colorless gas with a faint sweet odor. Shipped as a liquid under its vapor pressure. A leak may either be liquid or vapor. Contact with the liquid may cause frostbite by evaporative cooling.  | CAMEO Chemicals |
| cloruro de acetilo | líquido | — | incoloro | Acetyl chloride appears as a colorless, fuming liquid with a pungent odor. Density 9.2 lb / gal. Flash point 40 °F. Vapor, which is heavier than air, irritates the eyes and mucous membranes. Corrosive to metals and tissu | CAMEO Chemicals |
| cloruro de benzoílo | líquido | — | incoloro | Benzoyl chloride appears as a colorless fuming liquid with a pungent odor. Flash point 162 °F. Lachrymator, irritating to skin and eyes. Corrosive to metals and tissue. Density 10.2 lb / gal. Used in medicine and in the  | CAMEO Chemicals |
| cloruro de berilio | sólido | sólido | blanco | Beryllium chloride is a white to green solid with a sharp odor. (USCG, 1999) | CAMEO Chemicals |
| cloruro de cesio | sólido | cristal | incoloro | Colorless crystals. [HSDB] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| cloruro de hidrógeno | gas | — | incoloro | Hydrogen chloride, anhydrous appears as a colorless gas with a sharp, pungent odor. Fumes strongly in moist air. Nonflammable. Corrosive to metals and tissues and irritating to the eyes and respiratory system. Heavier th | CAMEO Chemicals |
| cloruro de sodio | sólido | cristal | blanco | Water soluble, white crystals; [CAMEO] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| colesterol | sólido | sólido | blanco | White or faintly yellow solid; Nearly odorless; [HSDB] Beige solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| colina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| cumeno (isopropilbenceno) | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| decano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| DEET (repelente) | líquido | — | incoloro | N,n-diethyl-m-toluamide appears as clear colorless or faintly yellow slightly viscous liquid. Faint pleasant odor. (NTP, 1992) | CAMEO Chemicals |
| diclorodifluorometano (freón-12) | gas | — | incoloro | Dichlorodifluoromethane appears as a colorless gas having a faint ethereal odor. Shipped as a liquid confined under its own vapor pressure. Contact with the unconfined liquid can cause frostbite. Both components are nonc | CAMEO Chemicals |
| diclorometano | líquido | — | incoloro | Dichloromethane appears as a colorless liquid with a sweet, penetrating, ether-like odor. Noncombustible by if exposed to high temperatures may emit toxic chloride fumes. Vapors are narcotic in high concentrations. Used  | CAMEO Chemicals |
| difluoruro de xenón | sólido | polvo | blanco | Colorless solid; [Merck Index] Colorless crystalline powder; [MSDSonline] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| dimetilamina | gas | — | incoloro | COLOURLESS COMPRESSED LIQUEFIED GAS WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| dióxido de azufre | gas | — | incoloro | Sulfur dioxide appears as a colorless gas with a choking or suffocating odor. Boiling point -10 °C. Heavier than air. Very toxic by inhalation and may irritate the eyes and mucous membranes. Under prolonged exposure to f | CAMEO Chemicals |
| dióxido de carbono | gas | — | incoloro | Carbon dioxide, refrigerated liquid appears as a colorless liquid. Relatively heavier than air and can asphyxiate by the displacement of air. Under prolonged exposure to heat or fire the container may rupture violently a | CAMEO Chemicals |
| dióxido de nitrógeno | gas | — | pardo rojizo | Nitrogen dioxide appears as a reddish brown gas or yellowish-brown liquid when cooled or compressed. Shipped as a liquefied gas under own vapor pressure. Vapors are heavier than air. Toxic by inhalation (vapor) and skin  | CAMEO Chemicals |
| dopamina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| estibina | gas | — | incoloro | Stibine appears as a colorless gas with a disagreeable odor. A moderate fire hazard that may yield toxic fumes when heated above 392 °F. Irritating to skin, eyes, and mucous membranes. Heavier than air. If exposed to pro | CAMEO Chemicals |
| estireno (vinilbenceno) | líquido | — | incoloro | COLOURLESS-TO-YELLOW OILY LIQUID. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| estradiol | sólido | sólido | blanco | Solid | Human Metabolome Database (HMDB) |
| etanal (acetaldehído) | gas | — | incoloro | Acetaldehyde appears as a clear colorless liquid with a pungent choking odor. Flash point -36 °F. Boiling point 69 °F. Density 6.5 lb / gal. Vapors are heaver than air and irritate the mucous membranes and especially the | CAMEO Chemicals |
| etanamida (acetamida) | sólido | cristal | incoloro | Acetamide appears as colorless crystals with a mousy odor (NTP, 1999). Low toxicity. | CAMEO Chemicals |
| etano | gas | — | incoloro | Ethane appears as a colorless odorless gas. It is easily ignited. The vapors are heavier than air. It can asphyxiate by the displacement of air. Under prolonged exposure to fire or intense heat the containers may rupture | CAMEO Chemicals |
| etano-1,2-diol (etilenglicol) | líquido | — | incoloro | ODOURLESS COLOURLESS VISCOUS HYGROSCOPIC LIQUID. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| etanoato de butilo | líquido | — | incoloro | Butyl acetate appears as a clear colorless liquid with a fruity odor. Flash point 72 - 88 °F. Density 7.4 lb / gal (less than water). Hence floats on water. Vapors heavier than air. | CAMEO Chemicals |
| etanoato de etilo (acetato de etilo) | líquido | — | incoloro | Ethyl acetate appears as a clear colorless liquid with a fruity odor. Flash point 24 °F. Less dense than water. Vapors heavier than air. | CAMEO Chemicals |
| etanoato de metilo | líquido | — | incoloro | Methyl acetate appears as a clear colorless liquid with a fragrant odor. Moderately toxic. Flash point 14 °F. Vapors heavier than air. | CAMEO Chemicals |
| etanol | líquido | — | incoloro | Ethanol appears as a clear colorless liquid with a characteristic vinous odor and pungent taste. Flash point 55 °F. Density 6.5 lb / gal. Vapors are heavier than air. | CAMEO Chemicals |
| etanolamina | líquido | — | incoloro | Ethanolamine appears as a clear colorless liquid with an odor resembling that of ammonia. Flash point 185 °F. May attack copper, brass, and rubber. Corrosive to tissue. Moderately toxic. Produces toxic oxides of nitrogen | CAMEO Chemicals |
| etanonitrilo (acetonitrilo) | líquido | — | incoloro | Acetonitrile appears as a colorless limpid liquid with an aromatic odor. Flash point 42 °F. Density 0.783 g / cm3. Toxic by skin absorption. Less dense than water. Vapors are denser than air. | CAMEO Chemicals |
| eteno (etileno) | gas | — | incoloro | Ethylene appears as a colorless gas with a sweet odor and taste. It is lighter than air. It is easily ignited and a flame can easily flash back to the source of the leak. Under prolonged exposure to fire or heat the cont | CAMEO Chemicals |
| etilamina | gas | — | incoloro | Ethylamine appears as a colorless liquid or a gas (boiling point 62 °F) with an odor of ammonia. Flash point less than 0 °F. Density of liquid 5.7 lb / gal. Corrosive to the skin and eyes. Vapors are heavier than air. Pr | CAMEO Chemicals |
| etilbenceno | líquido | — | incoloro | COLOURLESS LIQUID WITH AROMATIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| etino (acetileno) | gas | — | incoloro | Acetylene appears as a colorless gas with a faint garlic-like odor. Easily ignited and burns with a sooty flame. Gas is lighter than air. Flame may flash back to the source of a leak very easily. Under prolonged exposure | CAMEO Chemicals |
| etoxietano (éter dietílico) | líquido | — | incoloro | VERY VOLATILE COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| eugenol (clavo de olor) | líquido | — | incoloro | Eugenol appears as clear colorless pale yellow or amber-colored liquid. Odor of cloves. Spicy pungent taste. (NTP, 1992) | CAMEO Chemicals |
| fenantreno | sólido | cristal | incoloro | Monoclinic plates from alcohol | Hazardous Substances Data Bank (HSDB) |
| fenilalanina | sólido | polvo | blanco | Solid; [Merck Index] White odorless solid; [CAMEO] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| fenol | sólido | cristal | incoloro | Phenol, liquid appears as a colorless liquid when pure, otherwise pink or red. Combustible. Flash point 175 °F. Must be heated before ignition may occur easily. Vapors are heavier than air. Corrosive to skin but because  | CAMEO Chemicals (corrección: El fenol funde a 41 °C: a 25 °C es sólido (cristales incoloros a blancos).) |
| flúor (F2) | gas | — | amarillo pálido | Fluorine is a pale yellow gas with a pungent odor. It is commonly shipped as a cryogenic liquid. It is toxic by inhalation and skin absorption. Contact with skin in lower than lethal concentrations causes chemical burns. | CAMEO Chemicals |
| fluoruro de calcio | sólido | polvo | blanco | COLOURLESS CRYSTALS OR WHITE HYGROSCOPIC POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| fluoruro de hidrógeno | gas | — | incoloro | Hydrogen fluoride, anhydrous appears as a colorless fuming liquid boiling at 67 °F. Shipped as a liquid confined under its own vapor pressure. Corrosive to metals and tissue. Very short contact with fumes or small quanti | CAMEO Chemicals |
| fosfina | gas | — | incoloro | Phosphine appears as a colorless gas with a disagreeable odor of fish or garlic. Boiling point -126 °F; freezing point -209 °F. Very toxic by inhalation at extremely low concentrations. Prolonged heating may cause contai | CAMEO Chemicals |
| fosgeno | gas | — | incoloro | Phosgene appears as a chemical warfare choking agent. Extremely toxic. A colorless gas or very low-boiling, volatile liquid with an odor of new-mown hay or green corn. Warning properties of the gas inhaled are slight, de | CAMEO Chemicals |
| fructosa | sólido | polvo | blanco | WHITE CRYSTALS OR POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| furano | líquido | — | incoloro | CLEAR COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. TURNS BROWN ON STANDING. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| galactosa | sólido | polvo | blanco | White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| geraniol | líquido | — | incoloro | Geraniol is a colorless to pale yellow oily liquid with a sweet rose odor. (NTP, 1992) | CAMEO Chemicals |
| germano | gas | — | incoloro | Germane is a colorless gas with a pungent odor. It is flammable. The gas is heavier than air and a flame can flash back to the source of leak very easily. It is toxic by inhalation. Prolonged exposure of the containers t | CAMEO Chemicals |
| glicina | sólido | cristal | blanco | Glycine appears as white crystals. (NTP, 1992) | CAMEO Chemicals |
| glucosa | sólido | polvo | blanco | WHITE POWDER. SWEET TASTE. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| glutamato monosódico (monohidrato) | sólido | polvo | blanco | White, practically odourless crystals or crystalline powder | EU Food Improvement Agents |
| glutamina | sólido | polvo | blanco | Opaque solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| guanina | sólido | cristal | blanco | Solid; [Merck Index] White crystals; [Acros Organics MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| heptano | líquido | — | incoloro | VOLATILE COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| hexafluoruro de azufre | gas | — | incoloro | Sulfur hexafluoride appears as a colorless odorless gas. Noncombustible. Shipped as a liquefied gas under own vapor pressure. Contact may cause frostbite. Under prolonged exposure to fire or heat the containers may ruptu | CAMEO Chemicals |
| hexano | líquido | — | incoloro | VOLATILE COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| hidrazina | líquido | — | incoloro | Hydrazine, anhydrous appears as a colorless, fuming oily liquid with an ammonia-like odor. Flash point 99 °F. Explodes during distillation if traces of air are present. Toxic by inhalation and by skin absorption. Corrosi | CAMEO Chemicals |
| hidrógeno (H2) | gas | — | incoloro | Hydrogen is a colorless, odorless gas. It is easily ignited. Once ignited it burns with a pale blue, almost invisible flame. The vapors are lighter than air. It is flammable over a wide range of vapor/air concentrations. | CAMEO Chemicals |
| hidróxido de sodio | sólido | sólido | blanco | Sodium hydroxide, solid appears as a white solid. Corrosive to metals and tissue. Used in chemical manufacturing, petroleum refining, cleaning compounds, drain cleaners. | CAMEO Chemicals |
| histamina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| histidina | sólido | polvo | blanco | Solid; [Merck Index] Powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| ibuprofeno | sólido | sólido | incoloro | Solid | Human Metabolome Database (HMDB) |
| imidazol | sólido | cristal | incoloro | COLOURLESS-TO-YELLOW CRYSTALS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| isobutano (2-metilpropano) | gas | — | incoloro | Isobutane is a colorless gas with a faint petroleum-like odor. It is shipped as a liquefied gas under its vapor pressure. Contact with the liquid can cause frostbite. It is easily ignited. The vapors are heavier than air | CAMEO Chemicals |
| isoleucina | sólido | sólido | blanco | Waxy shiny solid; [Merck Index] White solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| isooctano (2,2,4-trimetilpentano) | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| isopentano (2-metilbutano) | líquido | — | incoloro | Watery colorless liquid with a gasoline-like odor. Floats on water. Flammable, irritating vapor is produced. Boiling point is 82 °F. (USCG, 1999) | CAMEO Chemicals |
| isopreno (2-metilbuta-1,3-dieno) | líquido | — | incoloro | VERY VOLATILE COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| lactosa | sólido | sólido | — | Solid; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| leucina | sólido | polvo | blanco | White solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| lidocaína | sólido | sólido | amarillo | Solid | Human Metabolome Database (HMDB) |
| limoneno | gas | — | incoloro | Colorless liquid with a citrus-like odor; [ChemIDplus] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| lisina | sólido | sólido | blanco | Solid; [Merck Index] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| m-xileno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| maltosa | sólido | cristal | blanco | White odorless crystals; [Mallinckrodt Baker MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| mentol | sólido | cristal | blanco | D,l-menthol is a white crystalline solid with a peppermint odor and taste. (NTP, 1992) | CAMEO Chemicals |
| metanal (formaldehído) | gas | — | incoloro | Solids containing varying amounts of formaldehyde, probably as paraformaldehyde (polymers of formula HO(CH2O)xH where x averages about 30). A hazard to the environment. Immediate steps should be taken to limit spread to  | CAMEO Chemicals |
| metanamida (formamida) | líquido | — | incoloro | Formamide appears as a colorless liquid with a faint odor of ammonia. Denser than water. Freezing point 36 °F. (USCG, 1999) | CAMEO Chemicals |
| metano | gas | — | incoloro | Methane is a colorless odorless gas. It is also known as marsh gas or methyl hydride. It is easily ignited. The vapors are lighter than air. Under prolonged exposure to fire or intense heat the containers may rupture vio | CAMEO Chemicals |
| metanoato de etilo | líquido | — | incoloro | Ethyl formate appears as a clear colorless liquid with a pleasant odor. Flash point -4 °F. Less dense than water. Vapors heavier than air. | CAMEO Chemicals |
| metanoato de metilo | líquido | — | incoloro | Methyl formate appears as a clear colorless liquid with an agreeable odor. Flash point -27 °F. Less dense than water Vapors heavier than air. | CAMEO Chemicals |
| metanol | líquido | — | incoloro | Methanol appears as a colorless fairly volatile liquid with a faintly sweet pungent odor like that of ethyl alcohol. Completely mixes with water. The vapors are slightly heavier than air and may travel some distance to a | CAMEO Chemicals |
| metil terc-butil éter | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| metilamina | gas | — | incoloro | Methylamine, anhydrous appears as a colorless gas or a liquid. Pungent fishy odor resembling odor of ammonia. The liquid boils at cold temperatures, hence it vaporizes rapidly when unconfined. Vapors are heavier than air | CAMEO Chemicals |
| metilciclohexano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| metionina | sólido | cristal | blanco | Minute hexagonal plates from dilute alcohol. (NTP, 1992) | CAMEO Chemicals |
| metoxietano | gas | — | incoloro | Ethyl methyl ether appears as a clear colorless gas with a medicine-like odor. Less dense than water. Vapors are heavier than air. Under prolonged exposure to fire or heat the containers may rupture violently and rocket. | CAMEO Chemicals |
| metoximetano (éter dimetílico) | gas | — | incoloro | Dimethyl ether is a colorless gas with a faint ethereal odor. It is shipped as a liquefied gas under its vapor pressure. Contact with the liquid can cause frostbite. It is easily ignited. Its vapors are heavier than air. | CAMEO Chemicals |
| monóxido de carbono | gas | — | incoloro | Carbon monoxide is a colorless, odorless gas. Prolonged exposure to carbon monoxide rich atmospheres may be fatal. It is easily ignited. It is just lighter than air and a flame can flash back to the source of leak very e | CAMEO Chemicals |
| monóxido de nitrógeno | gas | — | incoloro | Nitric oxide appears as a colorless gas. Noncombustible but accelerates the burning of combustible material. Vapors heavier than air. Very toxic by inhalation and skin absorption. Heating the containers may cause them to | CAMEO Chemicals |
| N,N-dimetilformamida | líquido | — | incoloro | N,n-dimethylformamide appears as a water-white liquid with a faint fishy odor. Flash point 136 °F. Slightly less dense than water. Vapors heavier than air. Toxic by inhalation or skin absorption. May irritate eyes. | CAMEO Chemicals (corrección: La N,N-dimetilformamida es un líquido incoloro.) |
| naftaleno | sólido | sólido | blanco | WHITE SOLID IN VARIOUS FORMS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| neopentano (2,2-dimetilpropano) | gas | — | incoloro | COLOURLESS COMPRESSED GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| nicotina | líquido | — | incoloro | Nicotine appears as a colorless to light yellow or brown liquid. Combustible. Toxic by inhalation and by skin absorption. Produces toxic oxides of nitrogen during combustion. | CAMEO Chemicals |
| nicotinamida | sólido | polvo | blanco | Nicotinamide is a white powder. (NTP, 1992) | CAMEO Chemicals |
| nitrobenceno | líquido | — | amarillo pálido | PALE YELLOW OILY LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| nitrógeno (N2) | gas | — | incoloro | Nitrogen appears as a colorless odorless gas. Noncombustible and nontoxic. Makes up the major portion of the atmosphere, but will not support life by itself. Used in food processing, in purging air conditioning and refri | CAMEO Chemicals |
| nitroglicerina | líquido | — | incoloro | COLOURLESS-TO-YELLOW VISCOUS LIQUID OR PALE YELLOW CRYSTALS. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| nitrometano | líquido | — | incoloro | COLOURLESS VISCOUS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| nonano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| o-xileno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| octano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| oxicloruro de fósforo | líquido | — | incoloro | Phosphorus oxychloride appears as a colorless fuming liquid with a pungent odor. Density 14.0 lb / gal. Very toxic by inhalation and corrosive to metals and tissue. Used in gasoline additives and hydraulic fluids. | CAMEO Chemicals |
| óxido de etileno (oxirano) | gas | — | incoloro | Ethylene oxide appears as a clear colorless gas with an ethereal odor with a flash point below 0 °F. Liquid less dense than water. Vapors heavier than air.  May polymerize exothermically if heated or contaminated. If the | CAMEO Chemicals |
| óxido nitroso | gas | — | incoloro | Nitrous oxide, refrigerated liquid appears as a colorless liquid. Density 1.22 g / cm3 at its boiling point of -89 °C. Boils to give a colorless gas that is sweet-smelling and moderately toxic. The gas has narcotic effec | CAMEO Chemicals |
| oxígeno (O2) | gas | — | incoloro | Oxygen is a colorless, odorless and tasteless gas. It will support life. It is noncombustible, but will actively support the burning of combustible materials. Some materials that will not burn in air will burn in oxygen. | CAMEO Chemicals |
| ozono | gas | — | incoloro | Ozone appears as a colorless to bluish gas that condenses to a dark blue liquid, or blue-black crystals. Has a characteristic odor in concentrations less than 2 ppm. Used as a disinfectant for air and water; used for ble | CAMEO Chemicals |
| p-xileno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| paracetamol | sólido | polvo | blanco | COLOURLESS CRYSTALS OR CRYSTALLINE POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| pentacloruro de fósforo | sólido | cristal | amarillo verdoso | Phosphorus pentachloride is a greenish-yellow crystalline solid with an irritating odor. It is decomposed by water to form hydrochloric and phosphoric acid and heat. This heat may be sufficient to ignite surrounding comb | CAMEO Chemicals |
| pentafluoruro de bromo | líquido | — | incoloro | Bromine pentafluoride appears as a colorless, fuming liquid with a pungent odor. Used to make other chemicals and in rockets. Very toxic by inhalation. Corrosive to metals and tissue. Will accelerate the burning of combu | CAMEO Chemicals |
| pentafluoruro de yodo | líquido | — | incoloro | Iodine pentafluoride appears as a toxic colorless fuming liquid (m.p. 9 °C). Decomposed by water to iodine and hydrofluoric acid. Contact with organic materials may cause their ignition. Corrosive to metals and tissue. P | CAMEO Chemicals |
| pentan-1-ol | líquido | — | incoloro | N-pentanol appears as a colorless liquid with a mild to moderately strong odor. Less dense than water. Flash point 91 °F. Boiling point 280 °F. Vapors heavier than air. Moderately toxic by ingestion. Vapors may irritate  | CAMEO Chemicals |
| pentan-2-ona | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| pentan-3-ona | líquido | — | incoloro | Diethyl ketone appears as a clear colorless liquid with an acetone-like odor. Flash point 55 °F. Less dense than water. Vapors heavier than air. | CAMEO Chemicals |
| pentano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| peróxido de hidrógeno | líquido | — | incoloro | COLOURLESS LIQUID. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| piperidina | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| piridina | líquido | — | incoloro | Pyridine appears as a clear colorless to light yellow liquid with a penetrating nauseating odor. Vapors are heavier than air. Toxic by ingestion and inhalation. Combustion produces toxic oxides of nitrogen. | CAMEO Chemicals |
| pirimidina | líquido | — | incoloro | Liquid or solid with a penetrating odor; mp = 20-22 deg C; [Merck Index] Clear, slightly brownish-yellow liquid; Hygroscopic; mp = 19 deg C; [Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| pirrol | líquido | — | incoloro | Colorless liquid with an agreeable odor like chloroform; Darkens on standing if oxygen not completely removed; [Merck Index] Yellowish or brown liquid; Turns brown when polymerized by light; [Hawley] Hygroscopic; [HSDB]  | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| prolina | sólido | polvo | blanco | Colorless solid; [HSDB] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| propan-1-amina | líquido | — | incoloro | COLOURLESS HYGROSCOPIC LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| propan-1-ol | líquido | — | incoloro | CLEAR COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| propan-2-ol (isopropanol) | líquido | — | incoloro | COLOURLESS LIQUID. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| propanal | líquido | — | incoloro | Propionaldehyde appears as a clear colorless liquid with an overpowering fruity-like odor. Less dense than water. Flash point 15 °F. Vapors are heavier than air. | CAMEO Chemicals |
| propano | gas | — | incoloro | Propane appears as a colorless gas with a faint petroleum-like odor. It is shipped as a liquefied gas under its vapor pressure. For transportation it may be stenched. Contact with the unconfined liquid can cause frostbit | CAMEO Chemicals |
| propano-1,2,3-triol (glicerol) | líquido | — | incoloro | Glycerine appears as a colorless to brown colored liquid. Combustible but may require some effort to ignite. | CAMEO Chemicals |
| propanona (acetona) | líquido | — | incoloro | Acetone appears as a clear colorless liquid with a sweetish odor. Flash point 0 °F. Less dense than water. Vapors are heavier than air. Used as a solvent in paint and nail polish removers. | CAMEO Chemicals |
| propanonitrilo | líquido | — | incoloro | Propionitrile appears as a colorless liquid with an ether-like odor. Density 0.683 g / cm3. Flash point 61 °F. Toxic by inhalation, skin absorption, and ingestion. Vapors are heavier than air. Used as a solvent, and to m | CAMEO Chemicals |
| propeno | gas | — | incoloro | Propylene is a colorless gas with a faint petroleum like odor. It is shipped as a liquefied gas under its own vapor pressure. For transportation it may be stenched. Contact with the liquid can cause frostbite. It is easi | CAMEO Chemicals |
| propilenglicol | líquido | — | incoloro | Thick odorless colorless liquid. Mixes with water. (USCG, 1999) | CAMEO Chemicals |
| propino | gas | — | incoloro | COLOURLESS COMPRESSED GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| purina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| retinol (vitamina A) | sólido | cristal | amarillo | Vitamin a appears as yellow crystals or orange solid. Practically water insoluble. (NTP, 1992) | CAMEO Chemicals |
| ribosa | sólido | polvo | blanco | Solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| sacarina | sólido | cristal | blanco | Saccharin (manufacturing) appears as white crystals. Odorless or faintly aromatic odor. Sweet taste. (NTP, 1992) | CAMEO Chemicals |
| sacarosa | sólido | polvo | blanco | Sucrose appears as white odorless crystalline or powdery solid. Denser than water. | CAMEO Chemicals |
| salicilato de metilo | líquido | — | incoloro | Methyl salicylate appears as colorless yellowish or reddish liquid with odor of wintergreen. (USCG, 1999) | CAMEO Chemicals |
| seleniuro de hidrógeno | gas | — | incoloro | Hydrogen selenide is a colorless gas with an offensive odor. It is highly flammable and toxic. It may be irritating to eyes and mucous membranes. It is heavier than air. Long term exposure to low concentrations or short  | CAMEO Chemicals |
| serina | sólido | polvo | blanco | Solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| serotonina | sólido | sólido | — | Solid | Human Metabolome Database (HMDB) |
| silano | gas | — | incoloro | Silane is a colorless, flammable and poisonous gas, with a strong repulsive odor. It is easily ignited in air, reacts with oxidizing agents, is very toxic by inhalation, and is a strong irritant to skin, eyes and mucous  | CAMEO Chemicals |
| sulfuro de hidrógeno | gas | — | incoloro | Hydrogen sulfide appears as a colorless gas having a strong odor of rotten eggs. Boiling point -60.2 °C. Shipped as a liquid confined under its own vapor pressure. Density (liquid) 8.3 lb / gal. Contact with the unconfin | CAMEO Chemicals |
| sulfuro de zinc | sólido | polvo | blanco | WHITE-TO-YELLOW CRYSTALS OR POWDER. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| teobromina (cacao) | sólido | sólido | blanco | Solid | Human Metabolome Database (HMDB) |
| testosterona | sólido | sólido | blanco | Solid | Human Metabolome Database (HMDB) |
| tetraclorometano | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| tetracloruro de silicio | líquido | — | incoloro | Silicon tetrachloride is a colorless, fuming liquid with a pungent odor. It is decomposed by water to hydrochloric acid with evolution of heat. It is corrosive to metals and tissue in the presence of moisture. It is used | CAMEO Chemicals |
| tetrafluoroeteno | gas | — | incoloro | Tetrafluoroethylene, stabilized appears as a colorless odorless gas. Easily ignited. Vapors are heavier than air. May asphyxiate by the displacement of air. May violently polymerize under prolonged exposure to fire or he | CAMEO Chemicals |
| tetrafluoruro de azufre | gas | — | incoloro | COLOURLESS GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| tetrafluoruro de xenón | sólido | sólido | incoloro | Colorless solid; [Merck Index] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| tetrahidrofurano | líquido | — | incoloro | Tetrahydrofuran appears as a clear colorless liquid with an ethereal odor. Less dense than water. Flash point 6 °F. Vapors are heavier than air. | CAMEO Chemicals |
| tetróxido de dinitrógeno | gas | — | incoloro | Colorless gas; [HSDB] Red-brown liquid with a sharp unpleasant odor (kept liquid by compression); bp = 21.15 deg C; [CAMEO] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| timina | sólido | polvo | blanco | Solid; [Merck Index] White crystalline powder; [Alfa Aesar MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| tirosina | sólido | cristal | blanco | Solid; [Merck Index] White fine crystals and fragments; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| tolueno (metilbenceno) | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| trans-but-2-eno | gas | — | incoloro | 2-butene appears as a colorless liquefied petroleum gas. Asphyxiate gas. Flammability limits in air 1.8-9.7% by volume. | CAMEO Chemicals |
| treonina | sólido | sólido | blanco | Solid; [Merck Index] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| tricloroeteno | líquido | — | incoloro | COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| triclorometano (cloroformo) | líquido | — | incoloro | VOLATILE COLOURLESS LIQUID WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| tricloruro de boro | gas | — | incoloro | Boron trichloride appears as a colorless gas with a pungent odor. Fumes irritate the eyes and mucous membranes. Corrosive to metals and tissue and is toxic. Under prolonged exposure to fire or intense heat, the container | CAMEO Chemicals |
| tricloruro de fósforo | líquido | — | incoloro | Phosphorus trichloride appears as a colorless or slightly yellow fuming liquid with a pungent and irritating odor resembling that of hydrochloric acid. Causes severe burns to skin, eyes and mucous membranes. Very toxic b | CAMEO Chemicals |
| trifluoruro de boro | gas | — | incoloro | COLOURLESS COMPRESSED GAS WITH PUNGENT ODOUR. FORMS WHITE FUMES IN MOIST AIR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| trifluoruro de cloro | gas | — | incoloro | Chlorine trifluoride appears as a colorless gas or green liquid with a pungent odor. Boils at 53 °F. It reacts with water to form chlorine and hydrofluoric acid with release of heat. Contact with organic materials may re | CAMEO Chemicals |
| trifluoruro de nitrógeno | gas | — | incoloro | COLOURLESS GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| trimetilamina | gas | — | incoloro | COLOURLESS COMPRESSED LIQUEFIED GAS WITH CHARACTERISTIC ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| trióxido de azufre | sólido | cristal | incoloro | Sulfur trioxide, is a colorless to white crystalline solid which will fume in air. Often shipped with inhibitor to prevent polymerization. It reacts violently with water to form sulfuric acid with the release of heat. It | CAMEO Chemicals |
| triptófano | sólido | polvo | blanco | L-tryptophan is a white powder with a flat taste. An essential amino acid; occurs in isomeric forms. (NTP, 1992) | CAMEO Chemicals |
| uracilo | sólido | polvo | blanco | Solid; [Merck Index] White powder; [Alfa Aesar MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| urea | sólido | cristal | blanco | Urea appears as solid odorless white crystals or pellets. Density 1.335 g /cc. Noncombustible. | CAMEO Chemicals |
| vainillina | sólido | cristal | blanco | Vanillin appears as white or very slightly yellow needles. | CAMEO Chemicals |
| valina | sólido | polvo | blanco | Solid; [Merck Index] White powder; [Sigma-Aldrich MSDS] | Haz-Map, Information on Hazardous Chemicals and Occupational Diseases |
| yodo (I2) | sólido | cristal | negro violáceo | BLUISH BLACK OR DARK PURPLE CRYSTALS WITH PUNGENT ODOUR. | ILO-WHO International Chemical Safety Cards (ICSCs) |
| yodometano | líquido | — | incoloro | Methyl iodide appears as a colorless liquid that turns brown on exposure to light. Denser than water. Contact may irritate skin, eyes and mucous membranes. Very toxic by ingestion, inhalation and skin absorption. | CAMEO Chemicals |
| yoduro de hidrógeno | gas | — | incoloro | Hydrogen iodide, anhydrous appears as a colorless to yellow/brown gas with an acrid odor. Nonflammable. Toxic by inhalation. Strongly irritates skin, eyes and mucous membranes. Long-term inhalation of low concentrations  | CAMEO Chemicals |

### Presentación de la muestra y uso cotidiano de cada elemento

- Origen: `src/data/apariencia.json → presentaciones`
- Fuente citada: T. Gray, The Elements: A Visual Exploration (2009); CRC Handbook of Chemistry and Physics, sección 4 (usos y presentación comercial); R. Chang, Química, cap. 8 y 21
- Unidad: —

| Elemento | Presentación | Efecto | Objeto 3D | Uso cotidiano |
|---|---|---|---|---|
| H | tubo | — | botella | Forma parte del agua; el H₂ se usa como combustible en celdas de hidrógeno. |
| He | tubo | — | globo | Llena globos y dirigibles: es más ligero que el aire y no arde. |
| Li | aceite | — | bateria | Baterías de ion litio de celulares y laptops. |
| Be | lamina | — | — | Ventanas de tubos de rayos X y aleaciones cobre-berilio para resortes. |
| B | cristales | — | — | Vidrio borosilicatado (de laboratorio y refractario) y ácido bórico. |
| C | cristal-octaedrico | diamante | lapiz | La mina del lápiz es grafito mezclado con arcilla; el diamante se usa en joyería y herramientas de corte. |
| N | tubo | — | — | El N₂ (78 % del aire) se usa en fertilizantes y para conservar alimentos envasados. |
| O | tubo | — | tanque | Tanques de oxígeno medicinal; es el 21 % del aire que respiramos. |
| F | frasco-gas | — | tubo-pasta | Los fluoruros de la pasta dental protegen el esmalte de los dientes. |
| Ne | tubo | — | letrero | Letreros luminosos de color rojo anaranjado. |
| Na | aceite | — | salero | Forma parte de la sal de mesa (NaCl) y de las lámparas de vapor de sodio del alumbrado público. |
| Mg | cinta | — | — | Aleaciones ligeras (llantas, carcasas) y bengalas de luz blanca intensa. |
| Al | lamina | — | lata | Latas de bebidas, papel de aluminio y marcos de ventanas. |
| Si | oblea | — | chip | Los chips y los paneles solares se fabrican sobre obleas de silicio. |
| P | cristales | — | cerilla | La superficie de raspado de las cajas de fósforos contiene fósforo rojo; fertilizantes. |
| S | cristales | — | — | Ácido sulfúrico, vulcanización del caucho y fósforos. |
| Cl | tubo | — | botella | La lejía (hipoclorito) y la potabilización del agua usan cloro. |
| Ar | tubo | — | bombilla | Gas de relleno de bombillas incandescentes y de la soldadura. |
| K | aceite | — | — | Fertilizantes (potasa); es esencial en la dieta (plátano, papa). |
| Ca | granulos | — | tableta | Huesos y dientes; suplementos de calcio, cal, yeso y cemento. |
| Sc | pepita | — | — | Aleaciones de aluminio para cuadros de bicicleta y bates. |
| Ti | barra | iridiscente | — | Implantes y prótesis; el TiO₂ es el pigmento blanco de pinturas y protectores solares. |
| V | barra | — | — | Aceros resistentes para herramientas (llaves y brocas). |
| Cr | trozo | — | cuchara | El acero inoxidable de los cubiertos contiene cromo; cromado de grifos. |
| Mn | trozo | — | pila | Las pilas alcalinas contienen dióxido de manganeso; aceros. |
| Fe | lingote | — | clavo | Acero de clavos, vigas y autos; la hemoglobina de la sangre contiene hierro. |
| Co | granulos | — | — | Pigmento azul cobalto y cátodos de baterías de ion litio. |
| Ni | granulos | — | moneda | Monedas y acero inoxidable. |
| Cu | alambre | patina (opcional) | cable | Cables eléctricos y tuberías; con el tiempo se cubre de pátina verde. |
| Zn | granulos | — | pila | Galvanizado del acero y pilas alcalinas. |
| Ga | lingote | — | led | LEDs y chips de alta frecuencia (nitruro y arseniuro de galio). |
| Ge | cristales | — | — | Fibra óptica y lentes para cámaras infrarrojas. |
| As | cristales | — | — | Semiconductores (arseniuro de galio); históricamente, venenos. |
| Se | granulos | — | — | Celdas fotoeléctricas y fotocopiadoras; nutriente esencial en trazas. |
| Br | ampolla | — | — | Retardantes de llama; antes, películas fotográficas (bromuro de plata). |
| Kr | tubo | — | bombilla | Lámparas fluorescentes y de flash. |
| Rb | ampolla | — | — | Relojes atómicos y fotocélulas. |
| Sr | aceite | — | cohete | Da el color rojo a los fuegos artificiales y a las bengalas. |
| Y | lingote | — | led | Fósforos de LED blancos y pantallas; láseres YAG. |
| Zr | barra | — | — | Revestimiento del combustible nuclear; la circonia se usa en coronas dentales. |
| Nb | barra | iridiscente | — | Imanes superconductores de resonancia magnética y aceros de gasoductos. |
| Mo | alambre | — | — | Aceros de alta resistencia y lubricantes (MoS₂). |
| Tc | sin-muestra | — | — | Su isótopo tecnecio-99m se usa en medicina nuclear (gammagrafías). |
| Ru | pepita | — | — | Contactos eléctricos resistentes al desgaste y catalizadores. |
| Rh | polvo | — | — | Convertidores catalíticos de los autos. |
| Pd | lamina | — | — | Convertidores catalíticos y joyería (oro blanco). |
| Ag | moneda | — | espejo | Los espejos tradicionales tienen una capa de plata; joyería y monedas. |
| Cd | barra | — | pila | Baterías recargables de níquel-cadmio y pigmentos amarillos. |
| In | lingote | — | — | Pantallas táctiles: el óxido de indio y estaño (ITO) es conductor y transparente. |
| Sn | lingote | — | lata | Las latas de conserva son de acero recubierto de estaño; soldadura. |
| Sb | cristales | — | — | Retardantes de llama y aleaciones de las baterías de plomo. |
| Te | cristales | — | — | Paneles solares de telururo de cadmio. |
| I | cristales | — | — | Tintura de yodo (antiséptico) y sal yodada. |
| Xe | tubo | — | bombilla | Faros de xenón de los autos y lámparas de flash. |
| Cs | ampolla | — | — | Relojes atómicos de cesio, que definen el segundo. |
| Ba | aceite | — | cohete | Color verde de los fuegos artificiales; el sulfato de bario se usa como contraste en radiografías. |
| La | trozo | — | — | Lentes de cámaras y baterías de níquel-hidruro metálico. |
| Ce | lingote | — | — | Piedras de encendedor (ferrocerio) y pulido de vidrio. |
| Pr | barra | — | — | Imanes potentes y vidrio de gafas de soldador. |
| Nd | trozo | — | iman | Imanes de neodimio de audífonos, motores y discos duros. |
| Pm | sin-muestra | — | — | Se ha usado en pinturas luminosas y baterías nucleares; es muy escaso. |
| Sm | lamina | — | iman | Imanes de samario-cobalto, resistentes al calor. |
| Eu | ampolla | — | led | Fósforo rojo de pantallas y tinta fluorescente de los billetes de euro. |
| Gd | barra | — | — | Agente de contraste en resonancia magnética. |
| Tb | trozo | — | led | Fósforo verde de pantallas y lámparas. |
| Dy | granulos | — | iman | Aditivo de los imanes de neodimio de autos eléctricos. |
| Ho | lamina | — | — | Láseres médicos. |
| Er | lingote | — | — | Amplificadores de fibra óptica y láseres dermatológicos. |
| Tm | trozo | — | — | Equipos portátiles de rayos X. |
| Yb | granulos | — | — | Relojes atómicos experimentales y láseres. |
| Lu | barra | — | — | Catalizadores y detectores de tomografía PET. |
| Hf | barra | — | — | Barras de control de reactores nucleares y transistores de chips. |
| Ta | lamina | — | — | Condensadores de celulares y computadoras. |
| W | barra | — | bombilla | Filamento de las bombillas incandescentes; brocas de carburo de tungsteno. |
| Re | barra | — | — | Aleaciones para turbinas de avión. |
| Os | pepita | — | — | Aleaciones muy duras para puntas de plumas fuente y contactos. |
| Ir | pepita | — | — | Bujías de larga duración y contactos eléctricos. |
| Pt | pepita | — | — | Joyería y convertidores catalíticos. |
| Au | lingote | — | anillo | Joyería, contactos de circuitos electrónicos y reserva de valor. |
| Hg | gota | — | termometro | Termómetros y barómetros antiguos; hoy se reemplaza por ser tóxico. |
| Tl | barra | opaco | — | Muy tóxico; se usó en raticidas, hoy prohibidos. |
| Pb | lingote | opaco | bateria | Baterías de los autos (plomo-ácido) y blindaje contra rayos X. |
| Bi | cristal-escalonado | iridiscente | tableta | Medicamentos para el estómago (subsalicilato de bismuto). |
| Po | sin-muestra | — | — | Eliminadores de electricidad estática en la industria; muy radiactivo. |
| At | sin-muestra | — | — | Solo investigación (se estudia para radioterapia). |
| Rn | sin-muestra | — | — | Gas radiactivo natural que puede acumularse en sótanos; se mide por su riesgo para la salud. |
| Fr | sin-muestra | — | — | Solo investigación científica. |
| Ra | sin-muestra | — | — | Antes se usó en pinturas luminosas de relojes; hoy se evita por su radiactividad. |
| Ac | sin-muestra | — | — | Investigación y fuentes de neutrones. |
| Th | lamina | — | — | Camisas de lámparas de gas antiguas y aleaciones de magnesio. |
| Pa | sin-muestra | — | — | Solo investigación científica. |
| U | barra | — | — | Combustible de las centrales nucleares. |
| Np | sin-muestra | — | — | Investigación; precursor del plutonio-238. |
| Pu | sin-muestra | — | — | Generadores eléctricos de sondas espaciales (plutonio-238). |
| Am | sin-muestra | — | detector | Los detectores de humo iónicos contienen una cantidad diminuta de americio-241. |
| Cm | sin-muestra | — | — | Fuente de partículas alfa en espectrómetros de los robots exploradores de Marte. |
| Bk | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Cf | sin-muestra | — | — | El californio-252 es fuente de neutrones para arrancar reactores y analizar materiales. |
| Es | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Fm | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Md | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| No | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Lr | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Rf | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Db | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Sg | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Bh | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Hs | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Mt | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Ds | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Rg | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Cn | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Nh | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Fl | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Mc | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Lv | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Ts | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |
| Og | sin-muestra | — | — | Solo se ha producido en laboratorio, para investigación científica. |

### Vida media del isótopo más estable (elementos sin isótopos estables)

- Origen: `src/data/vidas-medias.json`
- Fuente citada: OIEA, LiveChart of Nuclides (ENSDF/NUBASE); descarga automática
- Unidad: la indicada (Y = años, d = días, h = horas, m = minutos, s = segundos, ms = milisegundos)

| Z | Isótopo | Vida media | Unidad |
|---|---|---|---|
| 43 | Tc-97 | 4,21 × 10⁶ | Y |
| 61 | Pm-145 | 17,7 | Y |
| 83 | Bi-209 | 2,01 × 10¹⁹ | Y |
| 84 | Po-209 | 124 | Y |
| 85 | At-210 | 8,1 | h |
| 86 | Rn-222 | 3,8235 | d |
| 87 | Fr-223 | 22 | m |
| 88 | Ra-226 | 1600 | Y |
| 89 | Ac-227 | 21,772 | Y |
| 90 | Th-232 | 1,4 × 10¹⁰ | Y |
| 91 | Pa-231 | 32570 | Y |
| 92 | U-238 | 4,468 × 10⁹ | Y |
| 93 | Np-237 | 2,144 × 10⁶ | Y |
| 94 | Pu-244 | 8,13 × 10⁷ | Y |
| 95 | Am-243 | 7364 | Y |
| 96 | Cm-247 | 1,56 × 10⁷ | Y |
| 97 | Bk-247 | 1380 | Y |
| 98 | Cf-251 | 898 | Y |
| 99 | Es-252 | 471,7 | d |
| 100 | Fm-257 | 100,5 | d |
| 101 | Md-258 | 51,5 | d |
| 102 | No-259 | 58 | m |
| 103 | Lr-266 | 11 | h |
| 104 | Rf-267 | 1,3 | h |
| 105 | Db-268 | 28 | h |
| 106 | Sg-269 | 130 | s |
| 107 | Bh-278 | 19 | m |
| 108 | Hs-278 | 19 | m |
| 109 | Mt-282 | 1,1 | m |
| 110 | Ds-282 | 1,1 | m |
| 111 | Rg-286 | 11 | m |
| 112 | Cn-286 | 11 | m |
| 113 | Nh-286 | 9,5 | s |
| 114 | Fl-290 | 19 | s |
| 115 | Mc-290 | 0,65 | s |
| 116 | Lv-293 | 95 | ms |
| 117 | Ts-294 | 51 | ms |
| 118 | Og-294 | 0,58 | ms |
