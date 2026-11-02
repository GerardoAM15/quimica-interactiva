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
    id: 'rdkit',
    tipo: 'software',
    nombre: 'RDKit.js',
    descripcion: 'Quimioinformática de código abierto compilada a WebAssembly.',
    licencia: 'BSD-3-Clause',
    url: 'https://github.com/rdkit/rdkit-js',
    uso: 'Lectura de SMILES/MOL, valencias, dibujo 2D y coordenadas 3D.',
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
