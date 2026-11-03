/**
 * Fuentes de datos y software de terceros.
 * La página "Créditos y fuentes" se genera desde aquí: toda fuente nueva
 * (tabla termodinámica, foto de Wikimedia, etc.) debe registrarse en esta lista.
 */

export type TipoFuente = 'datos' | 'software';

export interface Fuente {
  id: string;
  tipo: TipoFuente;
  nombre: string;
  descripcion: string;
  licencia: string;
  url: string;
  /** Para qué se usa en la aplicación. */
  uso: string;
}

export const FUENTES: readonly Fuente[] = [
  {
    id: 'pubchem',
    tipo: 'datos',
    nombre: 'PubChem (NCBI / NIH)',
    descripcion: 'Base de datos química abierta del Centro Nacional de Información Biotecnológica de EE. UU.',
    licencia: 'Dominio público (datos del gobierno de EE. UU.)',
    url: 'https://pubchem.ncbi.nlm.nih.gov/',
    uso: 'Propiedades de los elementos y estructuras 3D (SDF) de las moléculas del catálogo.',
  },
  {
    id: 'codata',
    tipo: 'datos',
    nombre: 'CODATA — Valores recomendados de las constantes físicas fundamentales',
    descripcion: 'Publicados por el NIST (Physical Measurement Laboratory).',
    licencia: 'Datos del NIST, uso libre con cita',
    url: 'https://physics.nist.gov/cuu/Constants/',
    uso: 'Constantes R, N_A (Avogadro), F (Faraday), h (Planck), k_B (Boltzmann), c, e y otras.',
  },
  {
    id: 'nist-isotopos',
    tipo: 'datos',
    nombre: 'NIST — Atomic Weights and Isotopic Compositions for All Elements',
    descripcion: 'Masas isotópicas, abundancias naturales y pesos atómicos estándar IUPAC (Physical Measurement Laboratory).',
    licencia: 'Datos del NIST, uso libre con cita',
    url: 'https://www.nist.gov/pml/atomic-weights-and-isotopic-compositions-relative-atomic-masses',
    uso: 'Isótopos de cada elemento, masa atómica promedio y masas atómicas de la tabla periódica.',
  },
  {
    id: 'nist-asd',
    tipo: 'datos',
    nombre: 'NIST Atomic Spectra Database',
    descripcion: 'Longitudes de onda de referencia de las líneas espectrales.',
    licencia: 'Datos del NIST, uso libre con cita',
    url: 'https://physics.nist.gov/asd',
    uso: 'Validación de las líneas de Balmer y Lyman calculadas con la ecuación de Rydberg.',
  },
  {
    id: 'pubchem-moleculas',
    tipo: 'datos',
    nombre: 'PubChem: conformeros 3D y puntos de ebullición (PUG REST y PUG View)',
    descripcion: 'Estructuras 3D del catálogo de moléculas y puntos de ebullición experimentales con su referencia original (CRC, HSDB, NTP, Merck Index…).',
    licencia: 'Dominio público; cada punto de ebullición conserva la cita de su fuente',
    url: 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-view',
    uso: 'Visor 3D, constructor, fuerzas intermoleculares (gráficas de ebullición).',
  },
  {
    id: 'cordero',
    tipo: 'datos',
    nombre: 'Radios covalentes (B. Cordero et al., Dalton Trans. 2008, 2832)',
    descripcion: 'Radios covalentes de los elementos.',
    licencia: 'Valores citados de un artículo científico',
    url: 'https://doi.org/10.1039/B801115J',
    uso: 'Longitudes de enlace de la geometría 3D aproximada.',
  },
  {
    id: 'shannon',
    tipo: 'datos',
    nombre: 'Radios iónicos (R. D. Shannon, Acta Cryst. A32, 751, 1976)',
    descripcion: 'Radios iónicos efectivos según el número de coordinación.',
    licencia: 'Valores citados de un artículo científico (pendientes de revisión)',
    url: 'https://doi.org/10.1107/S0567739476001551',
    uso: 'Tamaño de los iones en las redes iónicas 3D.',
  },
  {
    id: 'crc',
    tipo: 'datos',
    nombre: 'CRC Handbook of Chemistry and Physics',
    descripcion: 'Secciones 4 (propiedades de los elementos) y 12 (estructuras cristalinas y parámetros de red).',
    licencia: 'Obra con derechos de autor: solo se citan valores puntuales',
    url: 'https://hbcp.chemnetbase.com/',
    uso: 'Parámetros de red, aspecto de los elementos, momentos dipolares y puntos de ebullición de H₂Te y SnH₄ (transcritos; pendientes de revisión).',
  },
  {
    id: 'wikimedia',
    tipo: 'datos',
    nombre: 'Wikimedia Commons',
    descripcion: 'Repositorio de imágenes libres.',
    licencia: 'Solo imágenes CC BY, CC BY-SA, CC0 o de dominio público; autor y licencia de cada foto en la ficha del elemento',
    url: 'https://commons.wikimedia.org/',
    uso: 'Foto real opcional de cada elemento (se carga solo al pedirla, con conexión).',
  },
  {
    id: 'rdkit',
    tipo: 'software',
    nombre: 'RDKit.js',
    descripcion: 'Quimioinformática de código abierto compilada a WebAssembly.',
    licencia: 'BSD-3-Clause',
    url: 'https://github.com/rdkit/rdkit-js',
    uso: 'Lectura de SMILES/molfile, validación de valencias, hidrógenos implícitos, coordenadas y dibujo 2D, SMILES canónico.',
  },
  {
    id: 'threejs',
    tipo: 'software',
    nombre: 'three.js, @react-three/fiber y @react-three/drei',
    descripcion: 'Gráficos 3D con WebGL.',
    licencia: 'MIT',
    url: 'https://threejs.org/',
    uso: 'Moléculas, orbitales, redes cristalinas y muestras 3D.',
  },
  {
    id: 'katex',
    tipo: 'software',
    nombre: 'KaTeX (con la extensión mhchem)',
    descripcion: 'Composición tipográfica de fórmulas matemáticas y químicas.',
    licencia: 'MIT',
    url: 'https://katex.org/',
    uso: 'Fórmulas de la teoría y ecuaciones químicas.',
  },
  {
    id: 'react',
    tipo: 'software',
    nombre: 'React, React Router y Zustand',
    descripcion: 'Interfaz de usuario, navegación y estado global.',
    licencia: 'MIT',
    url: 'https://react.dev/',
    uso: 'Toda la interfaz.',
  },
  {
    id: 'recharts',
    tipo: 'software',
    nombre: 'Recharts',
    descripcion: 'Gráficas para React.',
    licencia: 'MIT',
    url: 'https://recharts.org/',
    uso: 'Gráficas de tendencias, cinética, titulación y otras.',
  },
  {
    id: 'fuse',
    tipo: 'software',
    nombre: 'Fuse.js',
    descripcion: 'Búsqueda difusa.',
    licencia: 'Apache-2.0',
    url: 'https://www.fusejs.io/',
    uso: 'Búsqueda de elementos, moléculas y temas.',
  },
  {
    id: 'tailwind',
    tipo: 'software',
    nombre: 'Tailwind CSS',
    descripcion: 'Framework de estilos.',
    licencia: 'MIT',
    url: 'https://tailwindcss.com/',
    uso: 'Estilos de la interfaz.',
  },
];
