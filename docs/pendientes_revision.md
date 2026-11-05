# Datos pendientes de revisión

Generado con `npm run pendientes` (2026-11-05). Son valores transcritos de libros o
clasificados automáticamente que la aplicación muestra con la insignia «Pendiente de revisión». Al verificarlos contra
la fuente, cambia `pendienteRevision` a `false` (o quita la insignia) y vuelve a ejecutar las pruebas.

## Datos

| Archivo | Qué contiene | Fuente citada |
|---|---|---|
| `src/data/acidos-bases.json` | Datos transcritos | R. Chang, Química: tablas 15.3 (Ka de ácidos débiles), 15.4 (Kb de bases débiles), 15.5 (ácidos dipróticos y polipróticos) y 16.2 (Ksp), a 25 °C; Intervalos de viraje de indicadores: Chang, tabla 16.1 |
| `src/data/apariencia-compuestos.json` | Estado, forma y color se clasifican automáticamente a partir de la frase original (en inglés), que se conserva. | PubChem PUG View: «Physical Description» y «Color/Form» (CAMEO Chemicals, HSDB, ICSC…) |
| `src/data/apariencia.json` | Los colores son una aproximación visual (sRGB) de la descripción de cada fuente, no una medición colorimétrica. Los colores de emisión de los tubos de descarga son aproximados. Los elementos sin entrada usan el aspecto por defecto de su estado y familia (metal plateado, etc.). | CRC Handbook of Chemistry and Physics, sección 4: «The Elements» (descripción física de cada elemento); N. N. Greenwood y A. Earnshaw, Chemistry of the Elements, 2.ª ed. |
| `src/data/cristales.json` | Parámetros de red a y c en pm, redondeados a 0,1 pm. Solo se incluyen las estructuras que la aplicación puede dibujar; el resto se describe en texto. | CRC Handbook of Chemistry and Physics, sección 12: «Crystal Structures and Lattice Parameters of Allotropes of the Elements»; W. D. Callister, Ciencia e Ingeniería de Materiales, tabla 3.1 (metales comunes) |
| `src/data/dipolos.json` | Valores transcritos y redondeados a 2 cifras decimales. Las claves son los nombres del catálogo (src/data/moleculas.json). | CRC Handbook of Chemistry and Physics, sección 9: «Dipole Moments» |
| `src/data/ebullicion-complementaria.json` | Puntos de ebullición que no figuran en PubChem | CRC Handbook of Chemistry and Physics, sección 4: «Physical Constants of Inorganic Compounds» |
| `src/data/potenciales.json` | Semirreacciones escritas como reducción. «metal» indica que el propio metal puede ser el electrodo; si no, se usa un electrodo inerte (Pt). | R. Chang, Química, tabla 19.1 (potenciales estándar de reducción a 25 °C) |
| `src/data/solubilidad.json` | «poco soluble»: se disuelve en pequeña cantidad (p. ej. CaSO₄, Ca(OH)₂, PbCl₂). «reacciona»: el compuesto no existe en agua (se hidroliza o se descompone). Los textos discrepan en los sulfuros e hidróxidos de los alcalinotérreos: se sigue a Brown. | R. Chang, Química, tabla 4.2 (reglas de solubilidad de compuestos iónicos en agua a 25 °C); T. Brown et al., Química, la ciencia central, tabla 4.1 (reglas de solubilidad); Colores de precipitados: análisis cualitativo (Chang, cap. 16) |
| `src/data/termodinamica.json` | Valores transcritos. La prueba de coherencia comprueba ΔGf° ≈ ΔHf° − T·ΔSf° (ΔSf° calculado con las entropías de los elementos) para cada compuesto. | R. Chang, Química, apéndice 3 (datos termodinámicos a 1 atm y 25 °C) |
| `src/chem/cristales.ts:218` | Parámetro de red a 25 °C, pm (pendiente de revisión: CRC Handbook, sección 12). | (ver comentario) |
| `src/chem/cristales.ts:260` | Radios iónicos de Shannon (pm) para el tamaño de las esferas (pendiente de revisión). | (ver comentario) |
| `src/chem/gases.ts:72` | Constantes de Van der Waals: a en L²·atm/mol², b en L/mol (Chang, tabla 5.4; pendiente de revisión). | (ver comentario) |
| `src/chem/solutions.ts:35` | Constantes ebulloscópicas y crioscópicas (°C·kg/mol). Fuente: Chang, tabla 12.2 (pendiente de revisión). | (ver comentario) |
| `src/chem/solutions.ts:57` | Fuente: CRC Handbook, «Aqueous solubility of inorganic compounds at various temperatures» (pendiente de revisión). | (ver comentario) |
| `src/modules/equilibrio/Equilibrio.tsx:31` | Constantes de equilibrio de ejemplo (Chang, cap. 14; pendientes de revisión). | (ver comentario) |
| `src/modules/hidrocarburos/Hidrocarburos.tsx:104` | Valores de McMurry, Química orgánica, cap. 3 (pendientes de revisión); los coeficientes se ajustan a esos cuatro puntos. | (ver comentario) |

## Insignias en la interfaz

- `src/components/molecula/MuestraCompuesto3D.tsx`: 1
- `src/modules/acidos-bases/AcidosBases.tsx`: 3
- `src/modules/electroquimica/Electroquimica.tsx`: 1
- `src/modules/enlace-quimico/EnlaceIonico.tsx`: 1
- `src/modules/equilibrio/Equilibrio.tsx`: 2
- `src/modules/fuerzas-intermoleculares/GraficasEbullicion.tsx`: 1
- `src/modules/hidrocarburos/Hidrocarburos.tsx`: 1
- `src/modules/reacciones-quimicas/Solubilidad.tsx`: 1
- `src/modules/simulador-gases/SimuladorGases.tsx`: 1
- `src/modules/soluciones/Soluciones.tsx`: 2
- `src/modules/tabla-periodica/EstructuraCristalina.tsx`: 1
- `src/modules/tabla-periodica/Muestra3D.tsx`: 1
- `src/modules/termoquimica/Termoquimica.tsx`: 3
- `src/modules/titulacion/Titulacion.tsx`: 1
- `src/modules/visor-moleculas/VisorMoleculas.tsx`: 1
