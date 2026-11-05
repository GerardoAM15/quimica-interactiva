# Convenciones de nomenclatura inorgánica

La aplicación sigue las convenciones de los textos preuniversitarios peruanos. Como varían entre autores,
se documentan aquí las elegidas (implementadas en `src/chem/nomenclatura/inorganica.ts`).

| Tema | Convención usada | Ejemplo |
|---|---|---|
| Stock | Romano pegado al nombre; se acepta con espacio al escribir | óxido de hierro(III) |
| Sistemática de óxidos | Prefijo siempre en el O (también «mono»); en el otro elemento solo si es > 1 | monóxido de disodio, trióxido de dihierro |
| Elisión con «óxido» | monóxido, tetróxido, pentóxido, hexóxido, heptóxido | pentóxido de dinitrógeno |
| Anhídridos | La tradicional usa «anhídrido» para los óxidos de no metales | anhídrido sulfúrico |
| N₂O, NO, NO₂ | Óxidos neutros: óxido nitroso, óxido nítrico, dióxido de nitrógeno (alias de N₂O: anhídrido hiponitroso) | |
| Oxácidos (Stock) | ácido + prefijo-oxo + adjetivo + (EO) | ácido tetraoxosulfúrico(VI) |
| Oxácidos (sistemática) | prefijo-oxo + raíz-ato(EO) de hidrógeno (sin prefijo para el H) | tetraoxosulfato(VI) de hidrógeno |
| Un solo O | «monoxo» | monoxoclorato(I) de hidrógeno (HClO) |
| P, As, Sb, B | La forma usual es orto (anhídrido + 3 H₂O); también meta y piro (P) | H₃PO₄ ácido fosfórico (ortofosfórico) |
| Si | metasilícico H₂SiO₃ y ortosilícico H₄SiO₄ | |
| Oxisales (sistemática) | anión sistemático + catión Stock | tetraoxosulfato(VI) de hierro(III) |
| Sales ácidas | bi‑ (de ácidos dipróticos), mono/diácido (fosfatos); Stock: hidrógeno‑ | bicarbonato / hidrogenocarbonato de sodio |
| Hg(I) | Ion dímero Hg₂²⁺ | Hg₂Cl₂ cloruro mercurioso |
| Mn y Cr | Como metales: Mn²⁺/Mn³⁺, Cr²⁺/Cr³⁺; como no metales: anhídridos y ácidos (permangánico, crómico, dicrómico) | |

## Exclusiones por precisión química

- No se generan «fosfito PO₃³⁻» ni «hipofosfito PO₂³⁻»: el H₃PO₃ es diprótico y el H₃PO₂ monoprótico
  (tienen H unidos al P), así que esas especies no existen como tales.
- No se generan sales del mismo elemento como catión y como central del anión (CrCrO₄, MnMnO₄).
- Algunas fórmulas tienen dos interpretaciones (CuMnO₄: permanganato cuproso o manganato cúprico);
  la aplicación muestra ambas.

# Nomenclatura orgánica

Implementada en `src/chem/nomenclatura/organica.ts` (nombre ↔ estructura, sin librerías de nomenclatura).

| Tema | Convención usada | Ejemplo |
|---|---|---|
| Reglas | IUPAC 1979/1993 (las de los textos de admisión): la cadena principal contiene el máximo de grupos principales y de enlaces múltiples antes que la mayor longitud | 2-etilbut-1-eno (no 3-metilidenopentano) |
| Localizadores | Delante de la terminación; se omiten en C1/C2 y en anillos con un solo grupo | but-2-eno, etanol, ciclohexanol |
| Prioridad | ácido > éster > amida > nitrilo > aldehído > cetona > alcohol > amina | ácido 2-hidroxipropanoico |
| Ramas complejas | Entre paréntesis, numeradas desde el punto de unión | 4-(1-metiletil)octano |
| Ésteres | «-oato de …ilo» | etanoato de etilo |
| Aminas y amidas | Sustituyentes en el N con el localizador N | N,N-dimetilmetanamida |
| Benceno | Prefijos + benceno; nombres aceptados: fenol, anilina, ácido benzoico, benzaldehído (tolueno se acepta al escribir) | 1,4-diclorobenceno |
| Éteres | Como alcoxi del alcano mayor | 1-metoxipropano |

Fuera de alcance (el nombrador lo indica): policíclicos, heterociclos, estereodescriptores (cis/trans, R/S)
en el nombre, ramas insaturadas o con heteroátomos.

Validación: `src/chem/__tests__/nomenclatura-organica.test.ts` comprueba, para 126 compuestos, estructura → nombre,
nombre → estructura (SMILES canónico igual al de PubChem) y la traducción al inglés frente al `IUPACName` de PubChem
(datos descargados con `node scripts/descargar-organica.mjs`).
