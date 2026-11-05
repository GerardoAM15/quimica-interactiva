import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Componentes de cada módulo, cargados bajo demanda con React.lazy (un chunk por módulo).
 * Un slug sin entrada muestra la página «Módulo en preparación».
 */
export const COMPONENTES_MODULO: Partial<Record<string, LazyExoticComponent<ComponentType>>> = {
  'tabla-periodica': lazy(() => import('./tabla-periodica/TablaPeriodica')),
  'estructura-atomica': lazy(() => import('./estructura-atomica/EstructuraAtomica')),
  'orbitales-3d': lazy(() => import('./orbitales-3d/Orbitales3D')),
  'enlace-quimico': lazy(() => import('./enlace-quimico/EnlaceQuimico')),
  'visor-moleculas': lazy(() => import('./visor-moleculas/VisorMoleculas')),
  'constructor-moleculas': lazy(() => import('./constructor-moleculas/ConstructorMoleculas')),
  'fuerzas-intermoleculares': lazy(() => import('./fuerzas-intermoleculares/FuerzasIntermoleculares')),
  'nomenclatura-inorganica': lazy(() => import('./nomenclatura-inorganica/NomenclaturaInorganica')),
  'reacciones-quimicas': lazy(() => import('./reacciones-quimicas/ReaccionesQuimicas')),
  balanceador: lazy(() => import('./balanceador/Balanceador')),
  estequiometria: lazy(() => import('./estequiometria/Estequiometria')),
  'simulador-gases': lazy(() => import('./simulador-gases/SimuladorGases')),
  soluciones: lazy(() => import('./soluciones/Soluciones')),
  termoquimica: lazy(() => import('./termoquimica/Termoquimica')),
  cinetica: lazy(() => import('./cinetica/Cinetica')),
  equilibrio: lazy(() => import('./equilibrio/Equilibrio')),
  'acidos-bases': lazy(() => import('./acidos-bases/AcidosBases')),
  titulacion: lazy(() => import('./titulacion/Titulacion')),
  electroquimica: lazy(() => import('./electroquimica/Electroquimica')),
};
