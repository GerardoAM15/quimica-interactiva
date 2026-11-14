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

## VSEPR: ángulo ideal vs experimental

43 moléculas e iones verificados en notación, geometría, hibridación y polaridad. Los pares libres reducen el ángulo real respecto del ideal (p. ej. H₂O 104,5° frente a 109,5°).

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| BeCl2: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| CO2: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| HCN: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| BF3: trigonal plana | 120 | 120 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| SO3: trigonal plana | 120 | 120 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| CO3^2-: trigonal plana | 120 | 120 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| NO3-: trigonal plana | 120 | 120 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| SO2: angular | 119 | 120 | ° (ideal VSEPR) | 8.40e-1 | Chang / Brown (ángulo experimental) |
| O3: angular | 117 | 120 | ° (ideal VSEPR) | 2.56e+0 | Chang / Brown (ángulo experimental) |
| NO2-: angular | 115 | 120 | ° (ideal VSEPR) | 4.35e+0 | Chang / Brown (ángulo experimental) |
| CH4: tetraédrica | 109.5 | 109.5 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| CCl4: tetraédrica | 109.5 | 109.5 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| NH4+: tetraédrica | 109.5 | 109.5 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| SO4^2-: tetraédrica | 109.5 | 109.5 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| NH3: piramidal trigonal | 107 | 109.5 | ° (ideal VSEPR) | 2.34e+0 | Chang / Brown (ángulo experimental) |
| PCl3: piramidal trigonal | 100 | 109.5 | ° (ideal VSEPR) | 9.50e+0 | Chang / Brown (ángulo experimental) |
| NF3: piramidal trigonal | 102 | 109.5 | ° (ideal VSEPR) | 7.35e+0 | Chang / Brown (ángulo experimental) |
| H2O: angular | 104.5 | 109.5 | ° (ideal VSEPR) | 4.78e+0 | Chang / Brown (ángulo experimental) |
| H2S: angular | 92 | 109.5 | ° (ideal VSEPR) | 1.90e+1 | Chang / Brown (ángulo experimental) |
| OF2: angular | 103 | 109.5 | ° (ideal VSEPR) | 6.31e+0 | Chang / Brown (ángulo experimental) |
| XeF2: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| I3-: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| SF6: octaédrica | 90 | 90 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| XeF4: cuadrada plana | 90 | 90 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| ICl4-: cuadrada plana | 90 | 90 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |
| N3-: lineal | 180 | 180 | ° (ideal VSEPR) | 0.00e+0 | Chang / Brown (ángulo experimental) |

## Ángulos de enlace en los conformeros 3D

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| agua: ángulo H–O–H | 104.5 | 103.98 | ° | 4.98e-1 | Experimental (Chang/Brown) vs conformero de PubChem |
| amoníaco: ángulo H–N–H | 107 | 106 | ° | 9.35e-1 | Experimental (Chang/Brown) vs conformero de PubChem |
| metano: ángulo H–C–H | 109.5 | 109.47 | ° | 2.74e-2 | Experimental (Chang/Brown) vs conformero de PubChem |
| eteno (etileno): ángulo H–C–H | 117 | 118.52 | ° | 1.30e+0 | Experimental (Chang/Brown) vs conformero de PubChem |
| dióxido de carbono: ángulo O–C–O | 180 | 180 | ° | 0.00e+0 | Experimental (Chang/Brown) vs conformero de PubChem |
| metanal (formaldehído): ángulo H–C–H | 116 | 115.53 | ° | 4.05e-1 | Experimental (Chang/Brown) vs conformero de PubChem |

## Puntos de ebullición del catálogo (PubChem)

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| agua | 100 | 99.97 | °C | 3.00e-2 | Valor de libro vs PubChem |
| etanol | 78.3 | 78.24 | °C | 7.66e-2 | Valor de libro vs PubChem |
| metanol | 64.7 | 64.7 | °C | 0.00e+0 | Valor de libro vs PubChem |
| benceno | 80.1 | 80.08 | °C | 2.50e-2 | Valor de libro vs PubChem |
| etoxietano (éter dietílico) | 34.6 | 35 | °C | 1.16e+0 | Valor de libro vs PubChem |
| hexano | 68.7 | 68.73 | °C | 4.37e-2 | Valor de libro vs PubChem |
| tetraclorometano | 76.7 | 76.7 | °C | 0.00e+0 | Valor de libro vs PubChem |
| propanona (acetona) | 56.1 | 56.08 | °C | 3.57e-2 | Valor de libro vs PubChem |
| amoníaco | -33.3 | -33.35 | °C | 1.50e-1 | Valor de libro vs PubChem |
| metano | -161.5 | -161.5 | °C | 0.00e+0 | Valor de libro vs PubChem |

## Balanceo de ecuaciones

48 ecuaciones (síntesis, descomposición, desplazamiento, doble desplazamiento, neutralización, combustión, redox moleculares e iónicas). Coeficientes enteros mínimos por espacio nulo con fracciones exactas.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| H2 + O2 → H2O | 2 : 1 : 2 | 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| N2 + H2 → NH3 | 1 : 3 : 2 | 1 : 3 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Fe + O2 → Fe2O3 | 4 : 3 : 2 | 4 : 3 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Al + O2 → Al2O3 | 4 : 3 : 2 | 4 : 3 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Na + Cl2 → NaCl | 2 : 1 : 2 | 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| P4 + O2 → P4O10 | 1 : 5 : 1 | 1 : 5 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| KClO3 → KCl + O2 | 2 : 2 : 3 | 2 : 2 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| CaCO3 → CaO + CO2 | 1 : 1 : 1 | 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| H2O2 → H2O + O2 | 2 : 2 : 1 | 2 : 2 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| NaHCO3 → Na2CO3 + H2O + CO2 | 2 : 1 : 1 : 1 | 2 : 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Zn + HCl → ZnCl2 + H2 | 1 : 2 : 1 : 1 | 1 : 2 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Al + HCl → AlCl3 + H2 | 2 : 6 : 2 : 3 | 2 : 6 : 2 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Fe + CuSO4 → FeSO4 + Cu | 1 : 1 : 1 : 1 | 1 : 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cl2 + NaBr → NaCl + Br2 | 1 : 2 : 2 : 1 | 1 : 2 : 2 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| AgNO3 + NaCl → AgCl + NaNO3 | 1 : 1 : 1 : 1 | 1 : 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| BaCl2 + Na2SO4 → BaSO4 + NaCl | 1 : 1 : 1 : 2 | 1 : 1 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Pb(NO3)2 + KI → PbI2 + KNO3 | 1 : 2 : 1 : 2 | 1 : 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| HCl + NaOH → NaCl + H2O | 1 : 1 : 1 : 1 | 1 : 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| H2SO4 + NaOH → Na2SO4 + H2O | 1 : 2 : 1 : 2 | 1 : 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| H3PO4 + Ca(OH)2 → Ca3(PO4)2 + H2O | 2 : 3 : 1 : 6 | 2 : 3 : 1 : 6 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Al(OH)3 + H2SO4 → Al2(SO4)3 + H2O | 2 : 3 : 1 : 6 | 2 : 3 : 1 : 6 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| CH4 + O2 → CO2 + H2O | 1 : 2 : 1 : 2 | 1 : 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C3H8 + O2 → CO2 + H2O | 1 : 5 : 3 : 4 | 1 : 5 : 3 : 4 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C2H6 + O2 → CO2 + H2O | 2 : 7 : 4 : 6 | 2 : 7 : 4 : 6 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C8H18 + O2 → CO2 + H2O | 2 : 25 : 16 : 18 | 2 : 25 : 16 : 18 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C6H12O6 + O2 → CO2 + H2O | 1 : 6 : 6 : 6 | 1 : 6 : 6 : 6 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C2H5OH + O2 → CO2 + H2O | 1 : 3 : 2 : 3 | 1 : 3 : 2 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| C12H22O11 + O2 → CO2 + H2O | 1 : 12 : 12 : 11 | 1 : 12 : 12 : 11 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Fe2O3 + CO → Fe + CO2 | 1 : 3 : 2 : 3 | 1 : 3 : 2 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| NH3 + O2 → NO + H2O | 4 : 5 : 4 : 6 | 4 : 5 : 4 : 6 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cu + HNO3 → Cu(NO3)2 + NO + H2O | 3 : 8 : 3 : 2 : 4 | 3 : 8 : 3 : 2 : 4 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cu + HNO3 → Cu(NO3)2 + NO2 + H2O | 1 : 4 : 1 : 2 : 2 | 1 : 4 : 1 : 2 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| KMnO4 + HCl → KCl + MnCl2 + Cl2 + H2O | 2 : 16 : 2 : 2 : 5 : 8 | 2 : 16 : 2 : 2 : 5 : 8 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| K2Cr2O7 + HCl → KCl + CrCl3 + Cl2 + H2O | 1 : 14 : 2 : 2 : 3 : 7 | 1 : 14 : 2 : 2 : 3 : 7 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| MnO2 + HCl → MnCl2 + Cl2 + H2O | 1 : 4 : 1 : 1 : 2 | 1 : 4 : 1 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| H2S + HNO3 → S + NO + H2O | 3 : 2 : 3 : 2 : 4 | 3 : 2 : 3 : 2 : 4 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Zn + HNO3 → Zn(NO3)2 + NH4NO3 + H2O | 4 : 10 : 4 : 1 : 3 | 4 : 10 : 4 : 1 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cl2 + NaOH → NaCl + NaClO3 + H2O | 3 : 6 : 5 : 1 : 3 | 3 : 6 : 5 : 1 : 3 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| FeS2 + O2 → Fe2O3 + SO2 | 4 : 11 : 2 : 8 | 4 : 11 : 2 : 8 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Ca3(PO4)2 + SiO2 + C → CaSiO3 + P4 + CO | 2 : 6 : 10 : 6 : 1 : 10 | 2 : 6 : 10 : 6 : 1 : 10 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| K4[Fe(CN)6] + KMnO4 + H2SO4 → KHSO4 + Fe2(SO4)3 + MnSO4 + HNO3 + CO2 + H2O | 10 : 122 : 299 : 162 : 5 : 122 : 60 : 60 : 188 | 10 : 122 : 299 : 162 : 5 : 122 : 60 : 60 : 188 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| MnO4^- + Fe^2+ + H^+ → Mn^2+ + Fe^3+ + H2O | 1 : 5 : 8 : 1 : 5 : 4 | 1 : 5 : 8 : 1 : 5 : 4 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cr2O7^2- + Fe^2+ + H^+ → Cr^3+ + Fe^3+ + H2O | 1 : 6 : 14 : 2 : 6 : 7 | 1 : 6 : 14 : 2 : 6 : 7 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cu + Ag^+ → Cu^2+ + Ag | 1 : 2 : 1 : 2 | 1 : 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Ag^+ + Cl^- → AgCl | 1 : 1 : 1 | 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Fe^3+ + e- → Fe^2+ | 1 : 1 : 1 | 1 : 1 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| SO2 + O2 → SO3 | 2 : 1 : 2 | 2 : 1 : 2 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |
| Cu^2+ + NH3 → [Cu(NH3)4]^2+ | 1 : 4 : 1 | 1 : 4 : 1 |  | 0 (idéntico) | Chang / Brown / textos preuniversitarios |

## Nomenclatura inorgánica

107 compuestos e iones, 308 pares nombre ↔ fórmula verificados en ambos sentidos.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Na2O | óxido de sodio · óxido de sodio · monóxido de disodio | óxido de sodio · óxido de sodio · monóxido de disodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CaO | óxido de calcio · óxido de calcio · monóxido de calcio | óxido de calcio · óxido de calcio · monóxido de calcio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Al2O3 | óxido de aluminio · óxido de aluminio · trióxido de dialuminio | óxido de aluminio · óxido de aluminio · trióxido de dialuminio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| FeO | óxido ferroso · óxido de hierro(II) · monóxido de hierro | óxido ferroso · óxido de hierro(II) · monóxido de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Fe2O3 | óxido férrico · óxido de hierro(III) · trióxido de dihierro | óxido férrico · óxido de hierro(III) · trióxido de dihierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Cu2O | óxido cuproso · óxido de cobre(I) · monóxido de dicobre | óxido cuproso · óxido de cobre(I) · monóxido de dicobre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CuO | óxido cúprico · óxido de cobre(II) · monóxido de cobre | óxido cúprico · óxido de cobre(II) · monóxido de cobre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| PbO2 | óxido plúmbico · óxido de plomo(IV) · dióxido de plomo | óxido plúmbico · óxido de plomo(IV) · dióxido de plomo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| SnO | óxido estannoso · óxido de estaño(II) · monóxido de estaño | óxido estannoso · óxido de estaño(II) · monóxido de estaño |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Au2O3 | óxido áurico · óxido de oro(III) · trióxido de dioro | óxido áurico · óxido de oro(III) · trióxido de dioro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Hg2O | óxido mercurioso · óxido de mercurio(I) · monóxido de dimercurio | óxido mercurioso · óxido de mercurio(I) · monóxido de dimercurio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HgO | óxido mercúrico · óxido de mercurio(II) · monóxido de mercurio | óxido mercúrico · óxido de mercurio(II) · monóxido de mercurio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NiO | óxido niqueloso · óxido de níquel(II) · monóxido de níquel | óxido niqueloso · óxido de níquel(II) · monóxido de níquel |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CO2 | anhídrido carbónico · óxido de carbono(IV) · dióxido de carbono | anhídrido carbónico · óxido de carbono(IV) · dióxido de carbono |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CO | anhídrido carbonoso · óxido de carbono(II) · monóxido de carbono | anhídrido carbonoso · óxido de carbono(II) · monóxido de carbono |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| SO2 | anhídrido sulfuroso · óxido de azufre(IV) · dióxido de azufre | anhídrido sulfuroso · óxido de azufre(IV) · dióxido de azufre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| SO3 | anhídrido sulfúrico · óxido de azufre(VI) · trióxido de azufre | anhídrido sulfúrico · óxido de azufre(VI) · trióxido de azufre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| N2O3 | anhídrido nitroso · óxido de nitrógeno(III) · trióxido de dinitrógeno | anhídrido nitroso · óxido de nitrógeno(III) · trióxido de dinitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| N2O5 | anhídrido nítrico · óxido de nitrógeno(V) · pentóxido de dinitrógeno | anhídrido nítrico · óxido de nitrógeno(V) · pentóxido de dinitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Cl2O | anhídrido hipocloroso · óxido de cloro(I) · monóxido de dicloro | anhídrido hipocloroso · óxido de cloro(I) · monóxido de dicloro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Cl2O7 | anhídrido perclórico · óxido de cloro(VII) · heptóxido de dicloro | anhídrido perclórico · óxido de cloro(VII) · heptóxido de dicloro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| P2O5 | anhídrido fosfórico · óxido de fósforo(V) · pentóxido de difósforo | anhídrido fosfórico · óxido de fósforo(V) · pentóxido de difósforo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| SiO2 | anhídrido silícico · óxido de silicio · dióxido de silicio | anhídrido silícico · óxido de silicio · dióxido de silicio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Mn2O7 | anhídrido permangánico · óxido de manganeso(VII) · heptóxido de dimanganeso | anhídrido permangánico · óxido de manganeso(VII) · heptóxido de dimanganeso |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CrO3 | anhídrido crómico · óxido de cromo(VI) · trióxido de cromo | anhídrido crómico · óxido de cromo(VI) · trióxido de cromo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| B2O3 | anhídrido bórico · óxido de boro · trióxido de diboro | anhídrido bórico · óxido de boro · trióxido de diboro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| N2O | óxido nitroso · óxido de nitrógeno(I) · monóxido de dinitrógeno | óxido nitroso · óxido de nitrógeno(I) · monóxido de dinitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NO | óxido nítrico · óxido de nitrógeno(II) · monóxido de nitrógeno | óxido nítrico · óxido de nitrógeno(II) · monóxido de nitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NO2 | dióxido de nitrógeno · óxido de nitrógeno(IV) · dióxido de nitrógeno | dióxido de nitrógeno · óxido de nitrógeno(IV) · dióxido de nitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Na2O2 | peróxido de sodio · peróxido de sodio · dióxido de disodio | peróxido de sodio · peróxido de sodio · dióxido de disodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| BaO2 | peróxido de bario · peróxido de bario · dióxido de bario | peróxido de bario · peróxido de bario · dióxido de bario |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2O2 | peróxido de hidrógeno · dióxido de dihidrógeno | peróxido de hidrógeno · dióxido de dihidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaH | hidruro de sodio · hidruro de sodio · hidruro de sodio | hidruro de sodio · hidruro de sodio · hidruro de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CaH2 | hidruro de calcio · hidruro de calcio · dihidruro de calcio | hidruro de calcio · hidruro de calcio · dihidruro de calcio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| FeH3 | hidruro férrico · hidruro de hierro(III) · trihidruro de hierro | hidruro férrico · hidruro de hierro(III) · trihidruro de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NH3 | amoníaco · trihidruro de nitrógeno | amoníaco · trihidruro de nitrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| PH3 | fosfina · trihidruro de fósforo | fosfina · trihidruro de fósforo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CH4 | metano · tetrahidruro de carbono | metano · tetrahidruro de carbono |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HCl | ácido clorhídrico · cloruro de hidrógeno | ácido clorhídrico · cloruro de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HF | ácido fluorhídrico · fluoruro de hidrógeno | ácido fluorhídrico · fluoruro de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HI | ácido yodhídrico · yoduro de hidrógeno | ácido yodhídrico · yoduro de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2S | ácido sulfhídrico · sulfuro de hidrógeno | ácido sulfhídrico · sulfuro de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaOH | hidróxido de sodio · hidróxido de sodio · hidróxido de sodio | hidróxido de sodio · hidróxido de sodio · hidróxido de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Ca(OH)2 | hidróxido de calcio · hidróxido de calcio · dihidróxido de calcio | hidróxido de calcio · hidróxido de calcio · dihidróxido de calcio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Fe(OH)2 | hidróxido ferroso · hidróxido de hierro(II) · dihidróxido de hierro | hidróxido ferroso · hidróxido de hierro(II) · dihidróxido de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Fe(OH)3 | hidróxido férrico · hidróxido de hierro(III) · trihidróxido de hierro | hidróxido férrico · hidróxido de hierro(III) · trihidróxido de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Cu(OH)2 | hidróxido cúprico · hidróxido de cobre(II) · dihidróxido de cobre | hidróxido cúprico · hidróxido de cobre(II) · dihidróxido de cobre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Al(OH)3 | hidróxido de aluminio · hidróxido de aluminio · trihidróxido de aluminio | hidróxido de aluminio · hidróxido de aluminio · trihidróxido de aluminio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Pb(OH)4 | hidróxido plúmbico · hidróxido de plomo(IV) · tetrahidróxido de plomo | hidróxido plúmbico · hidróxido de plomo(IV) · tetrahidróxido de plomo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2SO4 | ácido sulfúrico · ácido tetraoxosulfúrico(VI) · tetraoxosulfato(VI) de hidrógeno | ácido sulfúrico · ácido tetraoxosulfúrico(VI) · tetraoxosulfato(VI) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2SO3 | ácido sulfuroso · ácido trioxosulfúrico(IV) · trioxosulfato(IV) de hidrógeno | ácido sulfuroso · ácido trioxosulfúrico(IV) · trioxosulfato(IV) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HNO3 | ácido nítrico · ácido trioxonítrico(V) · trioxonitrato(V) de hidrógeno | ácido nítrico · ácido trioxonítrico(V) · trioxonitrato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HNO2 | ácido nitroso · ácido dioxonítrico(III) · dioxonitrato(III) de hidrógeno | ácido nitroso · ácido dioxonítrico(III) · dioxonitrato(III) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2CO3 | ácido carbónico · ácido trioxocarbónico(IV) · trioxocarbonato(IV) de hidrógeno | ácido carbónico · ácido trioxocarbónico(IV) · trioxocarbonato(IV) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HClO | ácido hipocloroso · ácido monoxoclórico(I) · monoxoclorato(I) de hidrógeno | ácido hipocloroso · ácido monoxoclórico(I) · monoxoclorato(I) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HClO2 | ácido cloroso · ácido dioxoclórico(III) · dioxoclorato(III) de hidrógeno | ácido cloroso · ácido dioxoclórico(III) · dioxoclorato(III) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HClO3 | ácido clórico · ácido trioxoclórico(V) · trioxoclorato(V) de hidrógeno | ácido clórico · ácido trioxoclórico(V) · trioxoclorato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HClO4 | ácido perclórico · ácido tetraoxoclórico(VII) · tetraoxoclorato(VII) de hidrógeno | ácido perclórico · ácido tetraoxoclórico(VII) · tetraoxoclorato(VII) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H3PO4 | ácido fosfórico · ácido tetraoxofosfórico(V) · tetraoxofosfato(V) de hidrógeno | ácido fosfórico · ácido tetraoxofosfórico(V) · tetraoxofosfato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HPO3 | ácido metafosfórico · ácido trioxofosfórico(V) · trioxofosfato(V) de hidrógeno | ácido metafosfórico · ácido trioxofosfórico(V) · trioxofosfato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H4P2O7 | ácido pirofosfórico · ácido heptaoxodifosfórico(V) · heptaoxodifosfato(V) de hidrógeno | ácido pirofosfórico · ácido heptaoxodifosfórico(V) · heptaoxodifosfato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H3BO3 | ácido bórico · ácido trioxobórico(III) · trioxoborato(III) de hidrógeno | ácido bórico · ácido trioxobórico(III) · trioxoborato(III) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HMnO4 | ácido permangánico · ácido tetraoxomangánico(VII) · tetraoxomanganato(VII) de hidrógeno | ácido permangánico · ácido tetraoxomangánico(VII) · tetraoxomanganato(VII) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2MnO4 | ácido mangánico · ácido tetraoxomangánico(VI) · tetraoxomanganato(VI) de hidrógeno | ácido mangánico · ácido tetraoxomangánico(VI) · tetraoxomanganato(VI) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2CrO4 | ácido crómico · ácido tetraoxocrómico(VI) · tetraoxocromato(VI) de hidrógeno | ácido crómico · ácido tetraoxocrómico(VI) · tetraoxocromato(VI) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H2Cr2O7 | ácido dicrómico · ácido heptaoxodicrómico(VI) · heptaoxodicromato(VI) de hidrógeno | ácido dicrómico · ácido heptaoxodicrómico(VI) · heptaoxodicromato(VI) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HIO4 | ácido peryódico · ácido tetraoxoyódico(VII) · tetraoxoyodato(VII) de hidrógeno | ácido peryódico · ácido tetraoxoyódico(VII) · tetraoxoyodato(VII) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HBrO3 | ácido brómico · ácido trioxobrómico(V) · trioxobromato(V) de hidrógeno | ácido brómico · ácido trioxobrómico(V) · trioxobromato(V) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| H4SiO4 | ácido ortosilícico · ácido tetraoxosilícico(IV) · tetraoxosilicato(IV) de hidrógeno | ácido ortosilícico · ácido tetraoxosilícico(IV) · tetraoxosilicato(IV) de hidrógeno |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaCl | cloruro de sodio · cloruro de sodio · cloruro de sodio | cloruro de sodio · cloruro de sodio · cloruro de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| FeCl3 | cloruro férrico · cloruro de hierro(III) · tricloruro de hierro | cloruro férrico · cloruro de hierro(III) · tricloruro de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| FeCl2 | cloruro ferroso · cloruro de hierro(II) · dicloruro de hierro | cloruro ferroso · cloruro de hierro(II) · dicloruro de hierro |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CuCl | cloruro cuproso · cloruro de cobre(I) · cloruro de cobre | cloruro cuproso · cloruro de cobre(I) · cloruro de cobre |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Al2S3 | sulfuro de aluminio · sulfuro de aluminio · trisulfuro de dialuminio | sulfuro de aluminio · sulfuro de aluminio · trisulfuro de dialuminio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KI | yoduro de potasio · yoduro de potasio · yoduro de potasio | yoduro de potasio · yoduro de potasio · yoduro de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Hg2Cl2 | cloruro mercurioso · cloruro de mercurio(I) · dicloruro de dimercurio | cloruro mercurioso · cloruro de mercurio(I) · dicloruro de dimercurio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| PbS2 | sulfuro plúmbico · sulfuro de plomo(IV) · disulfuro de plomo | sulfuro plúmbico · sulfuro de plomo(IV) · disulfuro de plomo |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CaCO3 | carbonato de calcio · carbonato de calcio · trioxocarbonato(IV) de calcio | carbonato de calcio · carbonato de calcio · trioxocarbonato(IV) de calcio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Na2SO4 | sulfato de sodio · sulfato de sodio · tetraoxosulfato(VI) de sodio | sulfato de sodio · sulfato de sodio · tetraoxosulfato(VI) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| CuSO4 | sulfato cúprico · sulfato de cobre(II) · tetraoxosulfato(VI) de cobre(II) | sulfato cúprico · sulfato de cobre(II) · tetraoxosulfato(VI) de cobre(II) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| FeSO4 | sulfato ferroso · sulfato de hierro(II) · tetraoxosulfato(VI) de hierro(II) | sulfato ferroso · sulfato de hierro(II) · tetraoxosulfato(VI) de hierro(II) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Fe2(SO4)3 | sulfato férrico · sulfato de hierro(III) · tetraoxosulfato(VI) de hierro(III) | sulfato férrico · sulfato de hierro(III) · tetraoxosulfato(VI) de hierro(III) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KMnO4 | permanganato de potasio · permanganato de potasio · tetraoxomanganato(VII) de potasio | permanganato de potasio · permanganato de potasio · tetraoxomanganato(VII) de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| K2Cr2O7 | dicromato de potasio · dicromato de potasio · heptaoxodicromato(VI) de potasio | dicromato de potasio · dicromato de potasio · heptaoxodicromato(VI) de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaClO | hipoclorito de sodio · hipoclorito de sodio · monoxoclorato(I) de sodio | hipoclorito de sodio · hipoclorito de sodio · monoxoclorato(I) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KClO3 | clorato de potasio · clorato de potasio · trioxoclorato(V) de potasio | clorato de potasio · clorato de potasio · trioxoclorato(V) de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaNO3 | nitrato de sodio · nitrato de sodio · trioxonitrato(V) de sodio | nitrato de sodio · nitrato de sodio · trioxonitrato(V) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KNO2 | nitrito de potasio · nitrito de potasio · dioxonitrato(III) de potasio | nitrito de potasio · nitrito de potasio · dioxonitrato(III) de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Ca3(PO4)2 | fosfato de calcio · fosfato de calcio · tetraoxofosfato(V) de calcio | fosfato de calcio · fosfato de calcio · tetraoxofosfato(V) de calcio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| AgNO3 | nitrato de plata · nitrato de plata · trioxonitrato(V) de plata | nitrato de plata · nitrato de plata · trioxonitrato(V) de plata |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Pb(NO3)2 | nitrato plumboso · nitrato de plomo(II) · trioxonitrato(V) de plomo(II) | nitrato plumboso · nitrato de plomo(II) · trioxonitrato(V) de plomo(II) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| (NH4)2SO4 | sulfato de amonio · sulfato de amonio · tetraoxosulfato(VI) de amonio | sulfato de amonio · sulfato de amonio · tetraoxosulfato(VI) de amonio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NH4Cl | cloruro de amonio · cloruro de amonio · cloruro de amonio | cloruro de amonio · cloruro de amonio · cloruro de amonio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaHCO3 | bicarbonato de sodio · hidrogenocarbonato de sodio · hidrogenotrioxocarbonato(IV) de sodio | bicarbonato de sodio · hidrogenocarbonato de sodio · hidrogenotrioxocarbonato(IV) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KHSO4 | bisulfato de potasio · hidrogenosulfato de potasio · hidrogenotetraoxosulfato(VI) de potasio | bisulfato de potasio · hidrogenosulfato de potasio · hidrogenotetraoxosulfato(VI) de potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaH2PO4 | fosfato diácido de sodio · dihidrogenofosfato de sodio · dihidrogenotetraoxofosfato(V) de sodio | fosfato diácido de sodio · dihidrogenofosfato de sodio · dihidrogenotetraoxofosfato(V) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Na2HPO4 | fosfato monoácido de sodio · hidrogenofosfato de sodio · hidrogenotetraoxofosfato(V) de sodio | fosfato monoácido de sodio · hidrogenofosfato de sodio · hidrogenotetraoxofosfato(V) de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NaHS | bisulfuro de sodio · hidrogenosulfuro de sodio | bisulfuro de sodio · hidrogenosulfuro de sodio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Mg(OH)Cl | cloruro básico de magnesio · hidroxicloruro de magnesio · cloruro hidróxido de magnesio | cloruro básico de magnesio · hidroxicloruro de magnesio · cloruro hidróxido de magnesio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Al(OH)2Cl | cloruro dibásico de aluminio · dihidroxicloruro de aluminio · cloruro dihidróxido de aluminio | cloruro dibásico de aluminio · dihidroxicloruro de aluminio · cloruro dihidróxido de aluminio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| KAl(SO4)2 | sulfato doble de aluminio y potasio · sulfato de aluminio y potasio | sulfato doble de aluminio y potasio · sulfato de aluminio y potasio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| SO4^2- | ion sulfato · ion sulfato · ion tetraoxosulfato(VI) | ion sulfato · ion sulfato · ion tetraoxosulfato(VI) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NO3^- | ion nitrato · ion nitrato · ion trioxonitrato(V) | ion nitrato · ion nitrato · ion trioxonitrato(V) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| ClO^- | ion hipoclorito · ion hipoclorito · ion monoxoclorato(I) | ion hipoclorito · ion hipoclorito · ion monoxoclorato(I) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| HCO3^- | ion bicarbonato · ion hidrogenocarbonato | ion bicarbonato · ion hidrogenocarbonato |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| Fe^3+ | ion férrico · ion hierro(III) | ion férrico · ion hierro(III) |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |
| NH4^+ | ion amonio · ion amonio | ion amonio · ion amonio |  | 0 (idéntico) | Textos preuniversitarios (convención documentada) |

## Estequiometría (ejercicios de Chang)

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Urea a partir de 637,2 g NH₃ + 1142 g CO₂ | 1124 | 1123.5 | g | 4.45e-2 | Chang, Química (reactivo limitante) |
| Ti teórico (TiCl₄ + 2 Mg) | 8.950000e+6 | 8.934036e+6 | g | 1.78e-1 | Chang, Química (rendimiento) |
| % de rendimiento del Ti | 88.4 | 88.54 | % | 1.58e-1 | Chang, Química |

## Gases

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| 6,9 mol de CO en 30,4 L a 62 °C: P | 6.2 | 6.2421 | atm | 6.79e-1 | Chang, Química, cap. 5 |
| Boyle: 726 mmHg y 946 mL → 154 mL | 4460 | 4459.7 | mmHg | 6.73e-3 | Chang, Química, cap. 5 |
| 1 mol a 0 °C y 1 atm: V | 22.41 | 22.414 | L | 1.78e-2 | Chang, Química, cap. 5 |
| Densidad del CO₂ a 0,990 atm y 55 °C | 1.62 | 1.618 | g/L | 1.23e-1 | Chang, Química, cap. 5 |
| Graham: efusión en 1,50 min frente a Br₂ en 4,73 min → M | 16.1 | 16.072 | g/mol | 1.74e-1 | Chang, Química, cap. 5 |
| Van der Waals: 3,50 mol NH₃ en 5,20 L a 47 °C | 16.2 | 16.246 | atm | 2.84e-1 | Chang, Química, cap. 5 |
| v_rms del N₂ a 25 °C | 515 | 515.24 | m/s | 4.66e-2 | Chang, Química, cap. 5 |
| v_rms del He a 25 °C | 1360 | 1363.1 | m/s | 2.28e-1 | Chang, Química, cap. 5 |

## Termoquímica: coherencia de la tabla ΔHf°, S°, ΔGf°

Cada ΔGf° tabulado se compara con ΔHf° − T·ΔSf°, calculando ΔSf° con las entropías de los elementos.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| C(diamante): ΔHf° − TΔSf° | 2.87 | 2.88 | kJ/mol | 3.48e-1 | Chang, apéndice 3 (coherencia interna) |
| O3(g): ΔHf° − TΔSf° | 163.4 | 163.04 | kJ/mol | 2.20e-1 | Chang, apéndice 3 (coherencia interna) |
| H2O(l): ΔHf° − TΔSf° | -237.2 | -237.02 | kJ/mol | 7.59e-2 | Chang, apéndice 3 (coherencia interna) |
| H2O(g): ΔHf° − TΔSf° | -228.6 | -228.44 | kJ/mol | 7.00e-2 | Chang, apéndice 3 (coherencia interna) |
| H2O2(l): ΔHf° − TΔSf° | -118.1 | -120.1 | kJ/mol | 1.69e+0 | Chang, apéndice 3 (coherencia interna) |
| CO(g): ΔHf° − TΔSf° | -137.3 | -137.25 | kJ/mol | 3.64e-2 | Chang, apéndice 3 (coherencia interna) |
| CO2(g): ΔHf° − TΔSf° | -394.4 | -394.37 | kJ/mol | 7.61e-3 | Chang, apéndice 3 (coherencia interna) |
| CH4(g): ΔHf° − TΔSf° | -50.8 | -50.55 | kJ/mol | 4.92e-1 | Chang, apéndice 3 (coherencia interna) |
| C2H6(g): ΔHf° − TΔSf° | -32.89 | -32.56 | kJ/mol | 1.00e+0 | Chang, apéndice 3 (coherencia interna) |
| C3H8(g): ΔHf° − TΔSf° | -23.5 | -22.95 | kJ/mol | 2.34e+0 | Chang, apéndice 3 (coherencia interna) |
| C2H4(g): ΔHf° − TΔSf° | 68.1 | 68.36 | kJ/mol | 3.82e-1 | Chang, apéndice 3 (coherencia interna) |
| C2H2(g): ΔHf° − TΔSf° | 209.2 | 209.18 | kJ/mol | 9.56e-3 | Chang, apéndice 3 (coherencia interna) |
| C6H6(l): ΔHf° − TΔSf° | 124.5 | 124.87 | kJ/mol | 2.97e-1 | Chang, apéndice 3 (coherencia interna) |
| CH3OH(l): ΔHf° − TΔSf° | -166.3 | -166.13 | kJ/mol | 1.02e-1 | Chang, apéndice 3 (coherencia interna) |
| C2H5OH(l): ΔHf° − TΔSf° | -174.18 | -173.86 | kJ/mol | 1.84e-1 | Chang, apéndice 3 (coherencia interna) |
| C6H12O6(s): ΔHf° − TΔSf° | -910.56 | -909.85 | kJ/mol | 7.80e-2 | Chang, apéndice 3 (coherencia interna) |
| NH3(g): ΔHf° − TΔSf° | -16.6 | -16.71 | kJ/mol | 6.63e-1 | Chang, apéndice 3 (coherencia interna) |
| NO(g): ΔHf° − TΔSf° | 86.7 | 86.72 | kJ/mol | 2.31e-2 | Chang, apéndice 3 (coherencia interna) |
| NO2(g): ΔHf° − TΔSf° | 51.8 | 51.83 | kJ/mol | 5.79e-2 | Chang, apéndice 3 (coherencia interna) |
| N2O4(g): ΔHf° − TΔSf° | 98.29 | 98.27 | kJ/mol | 2.03e-2 | Chang, apéndice 3 (coherencia interna) |
| N2O(g): ΔHf° − TΔSf° | 103.6 | 103.63 | kJ/mol | 2.90e-2 | Chang, apéndice 3 (coherencia interna) |
| SO2(g): ΔHf° − TΔSf° | -300.4 | -299.56 | kJ/mol | 2.80e-1 | Chang, apéndice 3 (coherencia interna) |
| SO3(g): ΔHf° − TΔSf° | -370.4 | -370.4 | kJ/mol | 0.00e+0 | Chang, apéndice 3 (coherencia interna) |
| H2S(g): ΔHf° − TΔSf° | -33 | -32.9 | kJ/mol | 3.03e-1 | Chang, apéndice 3 (coherencia interna) |
| HCl(g): ΔHf° − TΔSf° | -95.27 | -95.28 | kJ/mol | 1.05e-2 | Chang, apéndice 3 (coherencia interna) |
| NaCl(s): ΔHf° − TΔSf° | -384 | -384.02 | kJ/mol | 5.21e-3 | Chang, apéndice 3 (coherencia interna) |
| NaOH(s): ΔHf° − TΔSf° | -380.7 | -380.63 | kJ/mol | 1.84e-2 | Chang, apéndice 3 (coherencia interna) |
| CaCO3(s): ΔHf° − TΔSf° | -1128.8 | -1128.82 | kJ/mol | 1.77e-3 | Chang, apéndice 3 (coherencia interna) |
| CaO(s): ΔHf° − TΔSf° | -604.2 | -604.5 | kJ/mol | 4.97e-2 | Chang, apéndice 3 (coherencia interna) |
| Ca(OH)2(s): ΔHf° − TΔSf° | -896.8 | -896.74 | kJ/mol | 6.69e-3 | Chang, apéndice 3 (coherencia interna) |
| Fe2O3(s): ΔHf° − TΔSf° | -741 | -741.13 | kJ/mol | 1.75e-2 | Chang, apéndice 3 (coherencia interna) |
| Al2O3(s): ΔHf° − TΔSf° | -1576.4 | -1576.45 | kJ/mol | 3.17e-3 | Chang, apéndice 3 (coherencia interna) |
| MgO(s): ΔHf° − TΔSf° | -569.6 | -569.53 | kJ/mol | 1.23e-2 | Chang, apéndice 3 (coherencia interna) |

## Cinética

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| t½ de orden 1, k = 6,7·10⁻⁴ s⁻¹ | 1030 | 1034.5 | s | 4.37e-1 | Chang, cap. 13 (ln 2/k) |
| t½ de orden 2, k = 7,0·10⁹ M⁻¹s⁻¹, [A]₀ = 0,086 M | 1.700000e-9 | 1.661100e-9 | s | 2.29e+0 | Chang, cap. 13 (1/k[A]₀; 2 cifras) |
| k de F₂ + 2ClO₂ (v = k[F₂][ClO₂]) | 1.2 | 1.2 | M⁻¹s⁻¹ | 0.00e+0 | Chang, cap. 13 (velocidades iniciales) |

## Equilibrio

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| H₂ + I₂ ⇌ 2HI: [HI]eq desde 0,500 M de H₂ e I₂ | 0.786 | 0.7865 | M | 6.36e-2 | Chang, cap. 14 |
| N₂O₄ ⇌ 2NO₂: Kp a 25 °C | 0.113 | 0.1133 |  | 2.65e-1 | Chang, cap. 14 |

## pH, buffers y titulación

El pH se calcula por balance de carga exacto (bisección); el analítico usa la fórmula cerrada indicada.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| HCl 0,10 M | 1 | 1 | pH | 0.00e+0 | analítico: −log C |
| HCl 1,0·10⁻⁸ M (con el agua) | 6.978 | 6.9783 | pH | 4.30e-3 | analítico: [H⁺] = (C + √(C² + 4Kw))/2 |
| NaOH 0,050 M | 12.699 | 12.699 | pH | 0.00e+0 | analítico: 14 + log C |
| Ba(OH)₂ 0,020 M | 12.602 | 12.6021 | pH | 7.94e-4 | analítico: 14 + log 2C |
| CH₃COOH 0,10 M (Ka = 1,8·10⁻⁵) | 2.8752771 | 2.8753 | pH | 7.98e-4 | analítico: cuadrática; Chang ≈ 2,87 |
| NH₃ 0,40 M (Kb = 1,8·10⁻⁵) | 11.42721 | 11.4272 | pH | 8.39e-5 | analítico: cuadrática; Chang ≈ 11,43 |
| H₃PO₄ 0,10 M | 1.6217533 | 1.6218 | pH | 2.88e-3 | analítico: cuadrática con Ka₁ |
| Buffer CH₃COOH 0,10 M / CH₃COONa 0,10 M | 4.7447275 | 4.7449 | pH | 3.64e-3 | Henderson-Hasselbalch |
| Buffer NH₃ 0,30 M / NH₄Cl 0,36 M | 9.1760913 | 9.1761 | pH | 9.53e-5 | Henderson-Hasselbalch; Chang ≈ 9,17 |
| CH₃COOH con NaOH: semiequivalencia (pH = pKa) | 4.7447275 | 4.7452 | pH | 9.96e-3 | analítico |
| CH₃COOH con NaOH: equivalencia | 8.7218487 | 8.7219 | pH | 5.88e-4 | analítico; Chang ≈ 8,72 |
| CH₃COOH con NaOH: 35 mL | 12.221849 | 12.2218 | pH | 3.99e-4 | analítico: exceso de OH⁻ |
| HCl con NaOH: equivalencia | 7 | 7 | pH | 0.00e+0 | analítico |
| HCl con NaOH: 10 mL | 1.3679768 | 1.368 | pH | 1.70e-3 | analítico: exceso de H⁺ |
| NH₃ con HCl: equivalencia | 5.2781513 | 5.2781 | pH | 9.71e-4 | analítico; Chang ≈ 5,28 |

## Electroquímica

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| Pila de Daniell: E° | 1.1 | 1.1 | V | 0.00e+0 | Chang, cap. 19 |
| Pila de Daniell: ΔG° | -212 | -212.3 | kJ | 1.42e-1 | Chang, cap. 19 |
| Co | Co²⁺ (0,15 M) ‖ Fe²⁺ (0,68 M) | Fe: Nernst | -0.14 | -0.1406 | V | 4.29e-1 | Chang, cap. 19 |
| Electrólisis de CaCl₂: 0,452 A, 1,50 h | 0.507 | 0.5069 | g | 1.97e-2 | Chang, cap. 19 |

## Nomenclatura orgánica (IUPAC ↔ SMILES, PubChem)

Para cada compuesto: nombre generado desde la estructura, estructura reconstruida desde el nombre (SMILES canónico de RDKit igual al de PubChem) y traducción al inglés igual al IUPACName de PubChem.

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| C | methane | metano → methane |  | — | PubChem CID 297 |
| CC | ethane | etano → ethane |  | — | PubChem CID 6324 |
| CCC | propane | propano → propane |  | — | PubChem CID 6334 |
| CCCC | butane | butano → butane |  | — | PubChem CID 7843 |
| CCCCC | pentane | pentano → pentane |  | — | PubChem CID 8003 |
| CCCCCC | hexane | hexano → hexane |  | — | PubChem CID 8058 |
| CCCCCCC | heptane | heptano → heptane |  | — | PubChem CID 8900 |
| CCCCCCCC | octane | octano → octane |  | — | PubChem CID 356 |
| CCCCCCCCC | nonane | nonano → nonane |  | — | PubChem CID 8141 |
| CCCCCCCCCC | decane | decano → decane |  | — | PubChem CID 15600 |
| CC(C)C | 2-methylpropane | 2-metilpropano → 2-methylpropane |  | — | PubChem CID 6360 |
| CC(C)CC | 2-methylbutane | 2-metilbutano → 2-methylbutane |  | — | PubChem CID 6556 |
| CC(C)(C)C | 2,2-dimethylpropane | 2,2-dimetilpropano → 2,2-dimethylpropane |  | — | PubChem CID 10041 |
| CCC(C)CC | 3-methylpentane | 3-metilpentano → 3-methylpentane |  | — | PubChem CID 7282 |
| CC(C)C(C)C | 2,3-dimethylbutane | 2,3-dimetilbutano → 2,3-dimethylbutane |  | — | PubChem CID 6589 |
| CCC(CC)CCC | 3-ethylhexane | 3-etilhexano → 3-ethylhexane |  | — | PubChem CID 12096 |
| CC(C)CC(C)(C)C | 2,2,4-trimethylpentane | 2,2,4-trimetilpentano → 2,2,4-trimethylpentane |  | — | PubChem CID 10907 |
| CCCC(C)CC(C)C | 2,4-dimethylheptane | 2,4-dimetilheptano → 2,4-dimethylheptane |  | — | PubChem CID 16656 |
| CCC(C)C(CC)CCC | 4-ethyl-3-methylheptane | 4-etil-3-metilheptano → 4-ethyl-3-methylheptane |  | — | PubChem CID 521414 |
| C=C | ethene | eteno → ethene |  | — | PubChem CID 6325 |
| C=CC | prop-1-ene | prop-1-eno → prop-1-ene |  | — | PubChem CID 8252 |
| C=CCC | but-1-ene | but-1-eno → but-1-ene |  | — | PubChem CID 7844 |
| CC=CC | but-2-ene | but-2-eno → but-2-ene |  | — | PubChem CID 12220 |
| C=CC=C | buta-1,3-diene | buta-1,3-dieno → buta-1,3-diene |  | — | PubChem CID 7845 |
| CC(=C)C | 2-methylprop-1-ene | 2-metilprop-1-eno → 2-methylprop-1-ene |  | — | PubChem CID 8255 |
| C=CCC=C | penta-1,4-diene | penta-1,4-dieno → penta-1,4-diene |  | — | PubChem CID 11587 |
| CCC=CCC | hex-3-ene | hex-3-eno → hex-3-ene |  | — | PubChem CID 11601 |
| C=C(C)C=C | 2-methylbuta-1,3-diene | 2-metilbuta-1,3-dieno → 2-methylbuta-1,3-diene |  | — | PubChem CID 6557 |
| C#C | acetylene | etino → acetylene |  | — | PubChem CID 6326 |
| C#CC | prop-1-yne | prop-1-ino → prop-1-yne |  | — | PubChem CID 6335 |
| C#CCC | but-1-yne | but-1-ino → but-1-yne |  | — | PubChem CID 7846 |
| CC#CC | but-2-yne | but-2-ino → but-2-yne |  | — | PubChem CID 10419 |
| C=CC#C | but-1-en-3-yne | but-1-en-3-ino → but-1-en-3-yne |  | — | PubChem CID 12720 |
| C=CCC#C | pent-1-en-4-yne | pent-1-en-4-ino → pent-1-en-4-yne |  | — | PubChem CID 522708 |
| C1CC1 | cyclopropane | ciclopropano → cyclopropane |  | — | PubChem CID 6351 |
| C1CCC1 | cyclobutane | ciclobutano → cyclobutane |  | — | PubChem CID 9250 |
| C1CCCC1 | cyclopentane | ciclopentano → cyclopentane |  | — | PubChem CID 9253 |
| C1CCCCC1 | cyclohexane | ciclohexano → cyclohexane |  | — | PubChem CID 8078 |
| CC1CCCCC1 | methylcyclohexane | metilciclohexano → methylcyclohexane |  | — | PubChem CID 7962 |
| CC1CCCCC1C | 1,2-dimethylcyclohexane | 1,2-dimetilciclohexano → 1,2-dimethylcyclohexane |  | — | PubChem CID 11416 |
| C1CCC=CC1 | cyclohexene | ciclohexeno → cyclohexene |  | — | PubChem CID 8079 |
| CC1CCCC=C1 | 3-methylcyclohexene | 3-metilciclohexeno → 3-methylcyclohexene |  | — | PubChem CID 11573 |
| c1ccccc1 | benzene | benceno → benzene |  | — | PubChem CID 241 |
| Cc1ccccc1 | toluene | metilbenceno → toluene |  | — | PubChem CID 1140 |
| CCc1ccccc1 | ethylbenzene | etilbenceno → ethylbenzene |  | — | PubChem CID 7500 |
| CCCc1ccccc1 | propylbenzene | propilbenceno → propylbenzene |  | — | PubChem CID 7668 |
| Clc1ccccc1 | chlorobenzene | clorobenceno → chlorobenzene |  | — | PubChem CID 7964 |
| Brc1ccccc1 | bromobenzene | bromobenceno → bromobenzene |  | — | PubChem CID 7961 |
| [O-][N+](=O)c1ccccc1 | nitrobenzene | nitrobenceno → nitrobenzene |  | — | PubChem CID 7416 |
| Clc1ccccc1Cl | 1,2-dichlorobenzene | 1,2-diclorobenceno → 1,2-dichlorobenzene |  | — | PubChem CID 7239 |
| Clc1ccc(Cl)cc1 | 1,4-dichlorobenzene | 1,4-diclorobenceno → 1,4-dichlorobenzene |  | — | PubChem CID 4685 |
| Oc1ccccc1 | phenol | fenol → phenol |  | — | PubChem CID 996 |
| OC(=O)c1ccccc1 | benzoic acid | ácido benzoico → benzoic acid |  | — | PubChem CID 243 |
| O=Cc1ccccc1 | benzaldehyde | benzaldehído → benzaldehyde |  | — | PubChem CID 240 |
| Nc1ccccc1 | aniline | anilina → aniline |  | — | PubChem CID 6115 |
| CCl | chloromethane | clorometano → chloromethane |  | — | PubChem CID 6327 |
| ClCCl | dichloromethane | diclorometano → dichloromethane |  | — | PubChem CID 6344 |
| ClC(Cl)Cl | chloroform | triclorometano → chloroform |  | — | PubChem CID 6212 |
| ClC(Cl)(Cl)Cl | tetrachloromethane | tetraclorometano → tetrachloromethane |  | — | PubChem CID 5943 |
| CCBr | bromoethane | bromoetano → bromoethane |  | — | PubChem CID 6332 |
| ClCCCl | 1,2-dichloroethane | 1,2-dicloroetano → 1,2-dichloroethane |  | — | PubChem CID 11 |
| CC(Cl)C | 2-chloropropane | 2-cloropropano → 2-chloropropane |  | — | PubChem CID 6361 |
| CC(Br)CC | 2-bromobutane | 2-bromobutano → 2-bromobutane |  | — | PubChem CID 6554 |
| C=CCl | chloroethene | cloroeteno → chloroethene |  | — | PubChem CID 6338 |
| FC(F)(F)C(Cl)Br | 2-bromo-2-chloro-1,1,1-trifluoroethane | 2-bromo-2-cloro-1,1,1-trifluoroetano → 2-bromo-2-chloro-1,1,1-trifluoroethane |  | — | PubChem CID 3562 |
| CO | methanol | metanol → methanol |  | — | PubChem CID 887 |
| CCO | ethanol | etanol → ethanol |  | — | PubChem CID 702 |
| CCCO | propan-1-ol | propan-1-ol → propan-1-ol |  | — | PubChem CID 1031 |
| CC(O)C | propan-2-ol | propan-2-ol → propan-2-ol |  | — | PubChem CID 3776 |
| CCCCO | butan-1-ol | butan-1-ol → butan-1-ol |  | — | PubChem CID 263 |
| CC(C)(C)O | 2-methylpropan-2-ol | 2-metilpropan-2-ol → 2-methylpropan-2-ol |  | — | PubChem CID 6386 |
| OCCO | ethane-1,2-diol | etano-1,2-diol → ethane-1,2-diol |  | — | PubChem CID 174 |
| OCC(O)CO | propane-1,2,3-triol | propano-1,2,3-triol → propane-1,2,3-triol |  | — | PubChem CID 753 |
| C=CCO | prop-2-en-1-ol | prop-2-en-1-ol → prop-2-en-1-ol |  | — | PubChem CID 7858 |
| OC1CCCCC1 | cyclohexanol | ciclohexanol → cyclohexanol |  | — | PubChem CID 7966 |
| ClCCO | 2-chloroethanol | 2-cloroetanol → 2-chloroethanol |  | — | PubChem CID 34 |
| CC(O)CC(C)C | 4-methylpentan-2-ol | 4-metilpentan-2-ol → 4-methylpentan-2-ol |  | — | PubChem CID 7910 |
| OCCc1ccccc1 | 2-phenylethanol | 2-feniletanol → 2-phenylethanol |  | — | PubChem CID 6054 |
| COC | methoxymethane | metoximetano → methoxymethane |  | — | PubChem CID 8254 |
| CCOCC | ethoxyethane | etoxietano → ethoxyethane |  | — | PubChem CID 3283 |
| COCC | methoxyethane | metoxietano → methoxyethane |  | — | PubChem CID 10903 |
| CCCOC | 1-methoxypropane | 1-metoxipropano → 1-methoxypropane |  | — | PubChem CID 11182 |
| C=O | formaldehyde | metanal → formaldehyde |  | — | PubChem CID 712 |
| CC=O | acetaldehyde | etanal → acetaldehyde |  | — | PubChem CID 177 |
| CCC=O | propanal | propanal → propanal |  | — | PubChem CID 527 |
| CCCC=O | butanal | butanal → butanal |  | — | PubChem CID 261 |
| O=CCCCC=O | pentanedial | pentanodial → pentanedial |  | — | PubChem CID 3485 |
| C=CC=O | prop-2-enal | prop-2-enal → prop-2-enal |  | — | PubChem CID 7847 |
| CC(C)C=O | 2-methylpropanal | 2-metilpropanal → 2-methylpropanal |  | — | PubChem CID 6561 |
| CC(C)=O | propan-2-one | propan-2-ona → propan-2-one |  | — | PubChem CID 180 |
| CCC(C)=O | butan-2-one | butan-2-ona → butan-2-one |  | — | PubChem CID 6569 |
| CCC(=O)CC | pentan-3-one | pentan-3-ona → pentan-3-one |  | — | PubChem CID 7288 |
| CC(=O)CC(C)=O | pentane-2,4-dione | pentano-2,4-diona → pentane-2,4-dione |  | — | PubChem CID 31261 |
| O=C1CCCCC1 | cyclohexanone | ciclohexanona → cyclohexanone |  | — | PubChem CID 7967 |
| C=CC(C)=O | but-3-en-2-one | but-3-en-2-ona → but-3-en-2-one |  | — | PubChem CID 6570 |
| OC=O | formic acid | ácido metanoico → formic acid |  | — | PubChem CID 284 |
| CC(O)=O | acetic acid | ácido etanoico → acetic acid |  | — | PubChem CID 176 |
| CCC(O)=O | propanoic acid | ácido propanoico → propanoic acid |  | — | PubChem CID 1032 |
| CCCC(O)=O | butanoic acid | ácido butanoico → butanoic acid |  | — | PubChem CID 264 |
| OC(=O)CCC(O)=O | butanedioic acid | ácido butanodioico → butanedioic acid |  | — | PubChem CID 1110 |
| C=CC(O)=O | prop-2-enoic acid | ácido prop-2-enoico → prop-2-enoic acid |  | — | PubChem CID 6581 |
| CC(Cl)C(O)=O | 2-chloropropanoic acid | ácido 2-cloropropanoico → 2-chloropropanoic acid |  | — | PubChem CID 11734 |
| CC(=O)C(O)=O | 2-oxopropanoic acid | ácido 2-oxopropanoico → 2-oxopropanoic acid |  | — | PubChem CID 1060 |
| CC(O)C(O)=O | 2-hydroxypropanoic acid | ácido 2-hidroxipropanoico → 2-hydroxypropanoic acid |  | — | PubChem CID 612 |
| COC(C)=O | methyl acetate | etanoato de metilo → methyl acetate |  | — | PubChem CID 6584 |
| CCOC(C)=O | ethyl acetate | etanoato de etilo → ethyl acetate |  | — | PubChem CID 8857 |
| CCOC(=O)CC | ethyl propanoate | propanoato de etilo → ethyl propanoate |  | — | PubChem CID 7749 |
| COC=O | methyl formate | metanoato de metilo → methyl formate |  | — | PubChem CID 7865 |
| CCCCOC(C)=O | butyl acetate | etanoato de butilo → butyl acetate |  | — | PubChem CID 31272 |
| CN | methanamine | metanamina → methanamine |  | — | PubChem CID 6329 |
| CCN | ethanamine | etanamina → ethanamine |  | — | PubChem CID 6341 |
| CCCN | propan-1-amine | propan-1-amina → propan-1-amine |  | — | PubChem CID 7852 |
| CC(C)N | propan-2-amine | propan-2-amina → propan-2-amine |  | — | PubChem CID 6363 |
| CNC | N-methylmethanamine | N-metilmetanamina → N-methylmethanamine |  | — | PubChem CID 674 |
| CCNC | N-methylethanamine | N-metiletanamina → N-methylethanamine |  | — | PubChem CID 12219 |
| CN(C)C | N,N-dimethylmethanamine | N,N-dimetilmetanamina → N,N-dimethylmethanamine |  | — | PubChem CID 1146 |
| NCCN | ethane-1,2-diamine | etano-1,2-diamina → ethane-1,2-diamine |  | — | PubChem CID 3301 |
| NC=O | formamide | metanamida → formamide |  | — | PubChem CID 713 |
| CC(N)=O | acetamide | etanamida → acetamide |  | — | PubChem CID 178 |
| CCC(N)=O | propanamide | propanamida → propanamide |  | — | PubChem CID 6578 |
| CNC(C)=O | N-methylacetamide | N-metiletanamida → N-methylacetamide |  | — | PubChem CID 6582 |
| CN(C)C=O | N,N-dimethylformamide | N,N-dimetilmetanamida → N,N-dimethylformamide |  | — | PubChem CID 6228 |
| CC#N | acetonitrile | etanonitrilo → acetonitrile |  | — | PubChem CID 6342 |
| CCC#N | propanenitrile | propanonitrilo → propanenitrile |  | — | PubChem CID 7854 |
| CCCC#N | butanenitrile | butanonitrilo → butanenitrile |  | — | PubChem CID 8008 |
| C=CC#N | prop-2-enenitrile | prop-2-enonitrilo → prop-2-enenitrile |  | — | PubChem CID 7855 |

## Tabla de solubilidad

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| AgCl | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| AgBr | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| AgI | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| NaNO3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| KNO3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| AgNO3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Pb(NO3)2 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| BaSO4 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| PbSO4 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| SrSO4 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| CaSO4 | poco | poco |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Na2SO4 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| CuSO4 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| NaCl | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| KI | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| PbI2 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| PbCl2 | poco | poco |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| CaCO3 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Na2CO3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| (NH4)2CO3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Ca3(PO4)2 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| K3PO4 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Mg(OH)2 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Fe(OH)3 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Cu(OH)2 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| NaOH | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Ba(OH)2 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Ca(OH)2 | poco | poco |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| CuS | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| PbS | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Na2S | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| ZnS | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| PbCrO4 | insoluble | insoluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| K2CrO4 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Ca(CH3COO)2 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| Al2S3 | reacciona | reacciona |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| FeCl3 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |
| ZnCl2 | soluble | soluble |  | 0 (idéntico) | Reglas de solubilidad (Chang 4.2, Brown 4.1) |

## Estereoquímica: configuración R/S y E/Z (propio vs RDKit)

Descriptores por índice de átomo (átomo:descriptor). Referencia: RDKit (get_stereo_tags).

| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |
|---|---|---|---|---|---|
| L-alanina | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| D-alanina | 1:R | 1:R |  | 0 (idéntico) | RDKit |
| L-serina | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| L-cisteína | 1:R | 1:R |  | 0 (idéntico) | RDKit |
| L-valina | 3:S | 3:S |  | 0 (idéntico) | RDKit |
| L-leucina | 4:S | 4:S |  | 0 (idéntico) | RDKit |
| L-fenilalanina | 7:S | 7:S |  | 0 (idéntico) | RDKit |
| L-ácido aspártico | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| L-metionina | 4:S | 4:S |  | 0 (idéntico) | RDKit |
| L-prolina | 2:S | 2:S |  | 0 (idéntico) | RDKit |
| L-treonina | 1:R 2:S | 1:R 2:S |  | 0 (idéntico) | RDKit |
| L-isoleucina | 2:S 4:S | 2:S 4:S |  | 0 (idéntico) | RDKit |
| ácido (S)-láctico | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| ácido (R)-láctico | 1:R | 1:R |  | 0 (idéntico) | RDKit |
| D-gliceraldehído | 1:R | 1:R |  | 0 (idéntico) | RDKit |
| L-gliceraldehído | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| ácido L-(+)-tartárico | 0:R 1:R | 0:R 1:R |  | 0 (idéntico) | RDKit |
| ácido D-(−)-tartárico | 0:S 1:S | 0:S 1:S |  | 0 (idéntico) | RDKit |
| ácido meso-tartárico | 0:R 1:S | 0:R 1:S |  | 0 (idéntico) | RDKit |
| D-glucosa (cadena abierta) | 1:R 2:R 3:S 4:R | 1:R 2:R 3:S 4:R |  | 0 (idéntico) | RDKit |
| (R)-2-butanol | 2:R | 2:R |  | 0 (idéntico) | RDKit |
| (S)-2-butanol | 2:S | 2:S |  | 0 (idéntico) | RDKit |
| (S)-ibuprofeno | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| (S)-naproxeno | 1:S | 1:S |  | 0 (idéntico) | RDKit |
| (R)-carvona | 4:R | 4:R |  | 0 (idéntico) | RDKit |
| (S)-carvona | 4:S | 4:S |  | 0 (idéntico) | RDKit |
| (R)-limoneno | 4:R | 4:R |  | 0 (idéntico) | RDKit |
| (R)-adrenalina | 3:R | 3:R |  | 0 (idéntico) | RDKit |
| (−)-mentol | 3:S 6:R 9:R | 3:S 6:R 9:R |  | 0 (idéntico) | RDKit |
| (2R,3R)-2,3-dibromobutano | 1:R 3:R | 1:R 3:R |  | 0 (idéntico) | RDKit |
| meso-2,3-dibromobutano | 1:R 3:S | 1:R 3:S |  | 0 (idéntico) | RDKit |
| trans-1,2-dimetilciclohexano | 1:R 6:R | 1:R 6:R |  | 0 (idéntico) | RDKit |
| (S)-3-metilhexano | 3:S | 3:S |  | 0 (idéntico) | RDKit |
| bromoclorofluorometano | 1:R | 1:R |  | 0 (idéntico) | RDKit |
| (E)-2-buteno | 1-2:E | 1-2:E |  | 0 (idéntico) | RDKit |
| (Z)-2-buteno | 1-2:Z | 1-2:Z |  | 0 (idéntico) | RDKit |
| (E)-1,2-dicloroeteno | 1-2:E | 1-2:E |  | 0 (idéntico) | RDKit |
| (Z)-1,2-dicloroeteno | 1-2:Z | 1-2:Z |  | 0 (idéntico) | RDKit |
| ácido fumárico | 0-1:E | 0-1:E |  | 0 (idéntico) | RDKit |
| ácido maleico | 0-1:Z | 0-1:Z |  | 0 (idéntico) | RDKit |
| (E)-cinamaldehído | 6-7:E | 6-7:E |  | 0 (idéntico) | RDKit |
| (E)-3-metil-2-penteno | 2-3:E | 2-3:E |  | 0 (idéntico) | RDKit |
| (Z)-3-metil-2-penteno | 2-3:Z | 2-3:Z |  | 0 (idéntico) | RDKit |
| geraniol | 5-6:E | 5-6:E |  | 0 (idéntico) | RDKit |
| nerol | 5-6:Z | 5-6:Z |  | 0 (idéntico) | RDKit |
| (Z)-1-bromo-2-cloro-1-fluoroeteno | 1-3:Z | 1-3:Z |  | 0 (idéntico) | RDKit |
