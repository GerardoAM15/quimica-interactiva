# Tabla de validación

Generada automáticamente por `npm test` (no editar a mano). Compara los resultados de `src/chem/`
con valores de referencia (PubChem, NIST, CODATA, soluciones analíticas y libros de texto).

## Constantes derivadas

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| R en L·atm/(mol·K) | 0.082057366 | 0.082057366 |  | 9.68e-8 | CODATA (R / 101325 Pa · 1000) |
| Volumen molar a CN | 22.41397 | 22.41397 | L/mol | 0.00e+0 | CODATA |
| R∞·h·c | 13.605693 | 13.605693 | eV | 3.77e-12 | CODATA |
| F = N_A·e | 96485.332 | 96485.332 | C/mol | 3.43e-9 | CODATA |

## Masas molares (parser de fórmulas vs PubChem)

42 compuestos. Error < 0,01 g/mol en todos los que PubChem reporta con 2 o más decimales (40); en el resto, la diferencia es menor que el redondeo de PubChem.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| H2O (agua) | 18.015 | 18.015 | g/mol | 0.00e+0 | PubChem CID 962 |
| CO2 (dióxido de carbono) | 44.009 | 44.009 | g/mol | 0.00e+0 | PubChem CID 280 |
| NaCl (cloruro de sodio) | 58.44 | 58.4398 | g/mol | 3.42e-4 | PubChem CID 5234 |
| H2SO4 (ácido sulfúrico) | 98.08 | 98.082 | g/mol | 2.04e-3 | PubChem CID 1118 |
| HNO3 (ácido nítrico) | 63.013 | 63.012 | g/mol | 1.59e-3 | PubChem CID 944 |
| HCl (cloruro de hidrógeno) | 36.46 | 36.458 | g/mol | 5.49e-3 | PubChem CID 313 |
| NH3 (amoníaco) | 17.031 | 17.031 | g/mol | 0.00e+0 | PubChem CID 222 |
| CH4 (metano) | 16.043 | 16.043 | g/mol | 0.00e+0 | PubChem CID 297 |
| C2H5OH (etanol) | 46.07 | 46.069 | g/mol | 2.17e-3 | PubChem CID 702 |
| C6H12O6 (glucosa) | 180.16 | 180.156 | g/mol | 2.22e-3 | PubChem CID 5793 |
| C12H22O11 (sacarosa) | 342.3 | 342.297 | g/mol | 8.76e-4 | PubChem CID 5988 |
| CaCO3 (carbonato de calcio) | 100.09 | 100.086 | g/mol | 4.00e-3 | PubChem CID 10112 |
| Ca(OH)2 (hidróxido de calcio) | 74.09 | 74.092 | g/mol | 2.70e-3 | PubChem CID 6093208 |
| NaOH (hidróxido de sodio) | 39.997 | 39.99677 | g/mol | 5.75e-4 | PubChem CID 14798 |
| KMnO4 (permanganato de potasio) | 158.034 | 158.03234 | g/mol | 1.05e-3 | PubChem CID 516875 |
| K2Cr2O7 (dicromato de potasio) | 294.18 | 294.1818 | g/mol | 6.12e-4 | PubChem CID 24502 |
| CuSO4 (sulfato de cobre(II)) | 159.61 | 159.612 | g/mol | 1.25e-3 | PubChem CID 24462 |
| CuSO4·5H2O (sulfato de cobre(II) pentahidratado) | 249.69 | 249.687 | g/mol | 1.20e-3 | PubChem CID 24463 |
| Al2(SO4)3 (sulfato de aluminio) | 342.2 | 342.161 | g/mol | 1.14e-2 | PubChem CID 24850 |
| Fe2O3 (óxido de hierro(III)) | 159.69 | 159.687 | g/mol | 1.88e-3 | PubChem CID 518696 |
| (NH4)2SO4 (sulfato de amonio) | 132.14 | 132.144 | g/mol | 3.03e-3 | PubChem CID 6097028 |
| Mg3(PO4)2 (fosfato de magnesio) | 262.86 | 262.8545 | g/mol | 2.09e-3 | PubChem CID 24439 |
| Ca3(PO4)2 (fosfato de calcio) | 310.18 | 310.1735 | g/mol | 2.10e-3 | PubChem CID 24456 |
| NaHCO3 (bicarbonato de sodio) | 84.007 | 84.00577 | g/mol | 1.46e-3 | PubChem CID 516892 |
| C6H6 (benceno) | 78.11 | 78.114 | g/mol | 5.12e-3 | PubChem CID 241 |
| CH3COOH (ácido acético) | 60.05 | 60.052 | g/mol | 3.33e-3 | PubChem CID 176 |
| C3H8 (propano) | 44.1 | 44.097 | g/mol | 6.80e-3 | PubChem CID 6334 |
| C8H18 (octano) | 114.23 | 114.232 | g/mol | 1.75e-3 | PubChem CID 356 |
| H3PO4 (ácido fosfórico) | 97.995 | 97.99376 | g/mol | 1.27e-3 | PubChem CID 1004 |
| KClO3 (clorato de potasio) | 122.55 | 122.5453 | g/mol | 3.84e-3 | PubChem CID 6426889 |
| Na2CO3 (carbonato de sodio) | 105.988 | 105.98754 | g/mol | 4.34e-4 | PubChem CID 10340 |
| Na2SO4·10H2O (sulfato de sodio decahidratado) | 322.2 | 322.1955 | g/mol | 1.40e-3 | PubChem CID 62649 |
| BaCl2·2H2O (cloruro de bario dihidratado) | 244.26 | 244.257 | g/mol | 1.23e-3 | PubChem CID 5284346 |
| Pb(NO3)2 (nitrato de plomo(II)) | 331 | 331.21 | g/mol | 6.34e-2 | PubChem CID 24924 |
| AgNO3 (nitrato de plata) | 169.873 | 169.8722 | g/mol | 4.71e-4 | PubChem CID 24470 |
| K4[Fe(CN)6] (ferrocianuro de potasio) | 368.34 | 368.3462 | g/mol | 1.68e-3 | PubChem CID 9605257 |
| C6H8O7 (ácido cítrico) | 192.12 | 192.123 | g/mol | 1.56e-3 | PubChem CID 311 |
| C2H2 (acetileno) | 26.04 | 26.038 | g/mol | 7.68e-3 | PubChem CID 6326 |
| SO2 (dióxido de azufre) | 64.07 | 64.068 | g/mol | 3.12e-3 | PubChem CID 1119 |
| N2O5 (pentóxido de dinitrógeno) | 108.01 | 108.009 | g/mol | 9.26e-4 | PubChem CID 66242 |
| O3 (ozono) | 47.998 | 47.997 | g/mol | 2.08e-3 | PubChem CID 24823 |
| P4O10 (decaóxido de tetrafósforo) | 283.89 | 283.885 | g/mol | 1.76e-3 | PubChem CID 14812 |

## Configuración electrónica

Coinciden con PubChem 117 de 118 elementos. Se listan solo las excepciones a la regla de Moeller y las diferencias documentadas; el resto coincide exactamente.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Cr (Z = 24) | [Ar]3d5 4s1 | [Ar]3d5 4s1 |  | 0 (idéntico) | PubChem |
| Cu (Z = 29) | [Ar]4s1 3d10 | [Ar]4s1 3d10 |  | 0 (idéntico) | PubChem |
| Nb (Z = 41) | [Kr]5s1 4d4 | [Kr]5s1 4d4 |  | 0 (idéntico) | PubChem |
| Mo (Z = 42) | [Kr]5s1 4d5 | [Kr]5s1 4d5 |  | 0 (idéntico) | PubChem |
| Ru (Z = 44) | [Kr]5s1 4d7 | [Kr]5s1 4d7 |  | 0 (idéntico) | PubChem |
| Rh (Z = 45) | [Kr]5s1 4d8 | [Kr]5s1 4d8 |  | 0 (idéntico) | PubChem |
| Pd (Z = 46) | [Kr]4d10 | [Kr]4d10 |  | 0 (idéntico) | PubChem |
| Ag (Z = 47) | [Kr]5s1 4d10 | [Kr]5s1 4d10 |  | 0 (idéntico) | PubChem |
| La (Z = 57) | [Xe]6s2 5d1 | [Xe]6s2 5d1 |  | 0 (idéntico) | PubChem |
| Ce (Z = 58) | [Xe]6s2 4f1 5d1 | [Xe]6s2 4f1 5d1 |  | 0 (idéntico) | PubChem |
| Gd (Z = 64) | [Xe]6s2 4f7 5d1 | [Xe]6s2 4f7 5d1 |  | 0 (idéntico) | PubChem |
| Pt (Z = 78) | [Xe]6s1 4f14 5d9 | [Xe]6s1 4f14 5d9 |  | 0 (idéntico) | PubChem |
| Au (Z = 79) | [Xe]6s1 4f14 5d10 | [Xe]6s1 4f14 5d10 |  | 0 (idéntico) | PubChem |
| Ac (Z = 89) | [Rn]7s2 6d1 | [Rn]7s2 6d1 |  | 0 (idéntico) | PubChem |
| Th (Z = 90) | [Rn]7s2 6d2 | [Rn]7s2 6d2 |  | 0 (idéntico) | PubChem |
| Pa (Z = 91) | [Rn]7s2 5f2 6d1 | [Rn]7s2 5f2 6d1 |  | 0 (idéntico) | PubChem |
| U (Z = 92) | [Rn]7s2 5f3 6d1 | [Rn]7s2 5f3 6d1 |  | 0 (idéntico) | PubChem |
| Np (Z = 93) | [Rn]7s2 5f4 6d1 | [Rn]7s2 5f4 6d1 |  | 0 (idéntico) | PubChem |
| Cm (Z = 96) | [Rn]7s2 5f7 6d1 | [Rn]7s2 5f7 6d1 |  | 0 (idéntico) | PubChem |
| Lr (Z = 103) | [Rn]7s2 5f14 6d1 | [Rn] 7s2 5f14 7p1 |  | — | PubChem (diferencia documentada) |

## Espectro del hidrógeno

λ calculada con R_H (masa reducida) y convertida al aire con la fórmula de Edlén.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Hα (3 → 2), en el aire | 656.279 | 656.28831 | nm | 1.42e-3 | NIST ASD |
| Hβ (4 → 2), en el aire | 486.135 | 486.13798 | nm | 6.13e-4 | NIST ASD |
| Hγ (5 → 2), en el aire | 434.047 | 434.05099 | nm | 9.19e-4 | NIST ASD |
| Hδ (6 → 2), en el aire | 410.174 | 410.17774 | nm | 9.12e-4 | NIST ASD |
| Lyman-α (2 → 1), en el vacío | 121.567 | 121.56845 | nm | 1.19e-3 | NIST ASD |
| Energía de ionización del H (−E₁) | 13.598 | 13.598287 | eV | 2.11e-3 | PubChem |

## Masa atómica promedio a partir de los isótopos

Se compararon 84 elementos con abundancia natural: error < 0,01 u en todos salvo Se y Pb (< 0,02 u), cuya composición isotópica representativa no coincide con el peso atómico estándar vigente (ver comentario en atomo.test.ts). Se muestra una selección.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| H: Σ mᵢ·xᵢ | 1.008 | 1.00794 | u | 5.95e-3 | NIST (isótopos) vs PubChem (dentro del intervalo IUPAC) |
| B: Σ mᵢ·xᵢ | 10.81 | 10.81103 | u | 9.53e-3 | NIST (isótopos) vs PubChem (dentro del intervalo IUPAC) |
| C: Σ mᵢ·xᵢ | 12.011 | 12.01074 | u | 2.16e-3 | NIST (isótopos) vs PubChem (dentro del intervalo IUPAC) |
| Mg: Σ mᵢ·xᵢ | 24.305 | 24.30505 | u | 2.06e-4 | NIST (isótopos) vs PubChem (dentro del intervalo IUPAC) |
| Cl: Σ mᵢ·xᵢ | 35.45 | 35.45294 | u | 8.29e-3 | NIST (isótopos) vs PubChem (dentro del intervalo IUPAC) |
| Fe: Σ mᵢ·xᵢ | 55.845 | 55.84514 | u | 2.51e-4 | NIST (isótopos) vs IUPAC (NIST) |
| Cu: Σ mᵢ·xᵢ | 63.546 | 63.54604 | u | 6.29e-5 | NIST (isótopos) vs IUPAC (NIST) |
| Se: Σ mᵢ·xᵢ | 78.971 | 78.95939 | u | 1.47e-2 | NIST (isótopos) vs IUPAC (NIST) |
| Br: Σ mᵢ·xᵢ | 79.904 | 79.90353 | u | 5.88e-4 | NIST (isótopos) vs IUPAC (valor convencional) |
| Ag: Σ mᵢ·xᵢ | 107.8682 | 107.86815 | u | 4.64e-5 | NIST (isótopos) vs IUPAC (NIST) |
| Pb: Σ mᵢ·xᵢ | 207.2 | 207.21691 | u | 8.16e-3 | NIST (isótopos) vs IUPAC (NIST) |

## Orbitales: normalización

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| ∫|ψ|²dV, 1s (cuadrícula 81³) | 1 | 1.0001866 |  | 1.87e-2 | Normalización analítica |
| ∫|ψ|²dV, 2px (cuadrícula 81³) | 1 | 0.99999146 |  | 8.54e-4 | Normalización analítica |
| ∫|ψ|²dV, 3dxy (cuadrícula 81³) | 1 | 0.99999744 |  | 2.56e-4 | Normalización analítica |
| ∫|ψ|²dV, 4fz³ (cuadrícula 81³) | 1 | 0.99998992 |  | 1.01e-3 | Normalización analítica |
| ∫R²r²dr, n=1 l=0 (Simpson) | 1 | 1 |  | 8.44e-8 | Normalización analítica |
| ∫R²r²dr, n=3 l=1 (Simpson) | 1 | 1 |  | 1.07e-12 | Normalización analítica |
| ∫R²r²dr, n=5 l=2 (Simpson) | 1 | 1 |  | 3.42e-12 | Normalización analítica |
| ∫R²r²dr, n=6 l=3 (Simpson) | 1 | 1 |  | 3.23e-7 | Normalización analítica |

## Orbitales híbridos

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Ángulo entre híbridos sp | 180 | 180 | ° | 0.00e+0 | Geometría (arccos(−1/3) para sp³) |
| Ángulo entre híbridos sp2 | 120 | 120 | ° | 1.18e-14 | Geometría (arccos(−1/3) para sp³) |
| Ángulo entre híbridos sp3 | 109.4712 | 109.47122 | ° | 1.88e-5 | Geometría (arccos(−1/3) para sp³) |

## Isosuperficies (marching cubes)

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Radio de la esfera que encierra el 90 % (1s) | 2.67 | 2.6548395 | a₀ | 5.68e-1 | ∫₀^r r²R² dr = 0,9 (analítico ≈ 2,66 a₀) |

## Estructuras cristalinas: densidad teórica vs PubChem

Valida los parámetros de red de src/data/cristales.json: ρ = Z·M/(N_A·V_celda). Diferencias de 1–2 % son normales (temperatura de medición, alótropos).

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Li (bcc, a = 351 pm) | 0.534 | 0.53298773 | g/cm³ | 1.90e-1 | PubChem (densidad) |
| Na (bcc, a = 429.1 pm) | 0.97 | 0.96635826 | g/cm³ | 3.75e-1 | PubChem (densidad) |
| K (bcc, a = 532.8 pm) | 0.862 | 0.85850795 | g/cm³ | 4.05e-1 | CRC Handbook (PubChem lista 0,89) |
| Rb (bcc, a = 570.5 pm) | 1.53 | 1.5286733 | g/cm³ | 8.67e-2 | PubChem (densidad) |
| Cs (bcc, a = 614.1 pm) | 1.93 | 1.9059197 | g/cm³ | 1.25e+0 | PubChem (densidad) |
| Ba (bcc, a = 502.8 pm) | 3.62 | 3.5879734 | g/cm³ | 8.85e-1 | PubChem (densidad) |
| V (bcc, a = 302.4 pm) | 6 | 6.1179435 | g/cm³ | 1.97e+0 | PubChem (densidad) |
| Cr (bcc, a = 288.5 pm) | 7.15 | 7.1913829 | g/cm³ | 5.79e-1 | PubChem (densidad) |
| Fe (bcc, a = 286.7 pm) | 7.874 | 7.8701011 | g/cm³ | 4.95e-2 | PubChem (densidad) |
| Nb (bcc, a = 330 pm) | 8.57 | 8.5858395 | g/cm³ | 1.85e-1 | PubChem (densidad) |
| Mo (bcc, a = 314.7 pm) | 10.2 | 10.224306 | g/cm³ | 2.38e-1 | PubChem (densidad) |
| Ta (bcc, a = 330.3 pm) | 16.4 | 16.676575 | g/cm³ | 1.69e+0 | PubChem (densidad) |
| W (bcc, a = 316.5 pm) | 19.3 | 19.257414 | g/cm³ | 2.21e-1 | PubChem (densidad) |
| Eu (bcc, a = 458.1 pm) | 5.24 | 5.2497538 | g/cm³ | 1.86e-1 | PubChem (densidad) |
| Al (fcc, a = 404.9 pm) | 2.7 | 2.6998054 | g/cm³ | 7.21e-3 | PubChem (densidad) |
| Ca (fcc, a = 558.8 pm) | 1.54 | 1.5256185 | g/cm³ | 9.34e-1 | PubChem (densidad) |
| Sr (fcc, a = 608.5 pm) | 2.64 | 2.5830368 | g/cm³ | 2.16e+0 | PubChem (densidad) |
| Ni (fcc, a = 352.4 pm) | 8.912 | 8.9082143 | g/cm³ | 4.25e-2 | PubChem (densidad) |
| Cu (fcc, a = 361.5 pm) | 8.933 | 8.9345442 | g/cm³ | 1.73e-2 | PubChem (densidad) |
| Rh (fcc, a = 380.3 pm) | 12.4 | 12.427069 | g/cm³ | 2.18e-1 | PubChem (densidad) |
| Pd (fcc, a = 389.1 pm) | 12 | 11.999099 | g/cm³ | 7.50e-3 | PubChem (densidad) |
| Ag (fcc, a = 408.6 pm) | 10.501 | 10.502857 | g/cm³ | 1.77e-2 | PubChem (densidad) |
| Ir (fcc, a = 383.9 pm) | 22.42 | 22.565582 | g/cm³ | 6.49e-1 | PubChem (densidad) |
| Pt (fcc, a = 392.4 pm) | 21.46 | 21.445874 | g/cm³ | 6.58e-2 | PubChem (densidad) |
| Au (fcc, a = 407.8 pm) | 19.282 | 19.291231 | g/cm³ | 4.79e-2 | PubChem (densidad) |
| Pb (fcc, a = 495.1 pm) | 11.342 | 11.340183 | g/cm³ | 1.60e-2 | PubChem (densidad) |
| Ce (fcc, a = 516.1 pm) | 6.77 | 6.7701025 | g/cm³ | 1.51e-3 | PubChem (densidad) |
| Yb (fcc, a = 548.5 pm) | 6.9 | 6.965637 | g/cm³ | 9.51e-1 | PubChem (densidad) |
| Th (fcc, a = 508.4 pm) | 11.72 | 11.728731 | g/cm³ | 7.45e-2 | PubChem (densidad) |
| Be (hcp, a = 228.6 pm) | 1.85 | 1.8452619 | g/cm³ | 2.56e-1 | PubChem (densidad) |
| Mg (hcp, a = 320.9 pm) | 1.74 | 1.7369351 | g/cm³ | 1.76e-1 | PubChem (densidad) |
| Sc (hcp, a = 330.9 pm) | 2.99 | 2.9859596 | g/cm³ | 1.35e-1 | PubChem (densidad) |
| Ti (hcp, a = 295.1 pm) | 4.5 | 4.4982539 | g/cm³ | 3.88e-2 | PubChem (densidad) |
| Co (hcp, a = 250.7 pm) | 8.86 | 8.8371471 | g/cm³ | 2.58e-1 | PubChem (densidad) |
| Zn (hcp, a = 266.5 pm) | 7.134 | 7.1360361 | g/cm³ | 2.85e-2 | PubChem (densidad) |
| Y (hcp, a = 364.7 pm) | 4.47 | 4.4727726 | g/cm³ | 6.20e-2 | PubChem (densidad) |
| Zr (hcp, a = 323.2 pm) | 6.52 | 6.5066988 | g/cm³ | 2.04e-1 | PubChem (densidad) |
| Tc (hcp, a = 273.5 pm) | 11 | 11.321904 | g/cm³ | 2.93e+0 | PubChem (densidad) |
| Ru (hcp, a = 270.6 pm) | 12.1 | 12.361423 | g/cm³ | 2.16e+0 | PubChem (densidad) |
| Cd (hcp, a = 297.9 pm) | 8.69 | 8.6450762 | g/cm³ | 5.17e-1 | PubChem (densidad) |
| Hf (hcp, a = 319.6 pm) | 13.3 | 13.266961 | g/cm³ | 2.48e-1 | PubChem (densidad) |
| Re (hcp, a = 276.1 pm) | 20.8 | 21.021634 | g/cm³ | 1.07e+0 | PubChem (densidad) |
| Os (hcp, a = 273.4 pm) | 22.57 | 22.607285 | g/cm³ | 1.65e-1 | PubChem (densidad) |
| Tl (hcp, a = 345.7 pm) | 11.8 | 11.870314 | g/cm³ | 5.96e-1 | PubChem (densidad) |
| Gd (hcp, a = 363.4 pm) | 7.9 | 7.8988943 | g/cm³ | 1.40e-2 | PubChem (densidad) |
| Tb (hcp, a = 360.6 pm) | 8.23 | 8.2270469 | g/cm³ | 3.59e-2 | PubChem (densidad) |
| Dy (hcp, a = 359.2 pm) | 8.55 | 8.5483191 | g/cm³ | 1.97e-2 | PubChem (densidad) |
| Ho (hcp, a = 357.8 pm) | 8.8 | 8.7940024 | g/cm³ | 6.82e-2 | PubChem (densidad) |
| Er (hcp, a = 355.9 pm) | 9.07 | 9.0668995 | g/cm³ | 3.42e-2 | PubChem (densidad) |
| Tm (hcp, a = 353.8 pm) | 9.32 | 9.3184689 | g/cm³ | 1.64e-2 | PubChem (densidad) |
| Lu (hcp, a = 350.5 pm) | 9.84 | 9.8426794 | g/cm³ | 2.72e-2 | PubChem (densidad) |
| Si (diamante, a = 543.1 pm) | 2.3296 | 2.3290248 | g/cm³ | 2.47e-2 | PubChem (densidad) |
| Ge (diamante, a = 565.8 pm) | 5.323 | 5.3267989 | g/cm³ | 7.14e-2 | PubChem (densidad) |
| Po (sc, a = 335.2 pm) | 9.32 | 9.213971 | g/cm³ | 1.14e+0 | PubChem (densidad) |

## Redes iónicas: densidad teórica

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| NaCl: ρ = Z·M/(N_A·a³) | 2.17 | 2.1636164 | g/cm³ | 2.94e-1 | CRC Handbook (pendiente de revisión) |
| CsCl: ρ = Z·M/(N_A·a³) | 3.99 | 3.988745 | g/cm³ | 3.15e-2 | CRC Handbook (pendiente de revisión) |
| CaF2: ρ = Z·M/(N_A·a³) | 3.18 | 3.1807271 | g/cm³ | 2.29e-2 | CRC Handbook (pendiente de revisión) |
| ZnS: ρ = Z·M/(N_A·a³) | 4.09 | 4.0878894 | g/cm³ | 5.16e-2 | CRC Handbook (pendiente de revisión) |
