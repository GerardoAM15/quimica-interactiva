import { useState } from 'react';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Formula } from '@/components/Formula';
import { EnlaceIonico } from './EnlaceIonico';
import { EnlaceCovalente } from './EnlaceCovalente';
import { EnlaceMetalico } from './EnlaceMetalico';
import { EstructurasLewis } from './EstructurasLewis';
import { GeometriaVSEPR } from './GeometriaVSEPR';

type Seccion = 'ionico' | 'covalente' | 'metalico' | 'lewis' | 'vsepr';
const SECCIONES = [
  { id: 'ionico', titulo: 'Enlace iónico' },
  { id: 'covalente', titulo: 'Enlace covalente (ΔEN)' },
  { id: 'metalico', titulo: 'Enlace metálico' },
  { id: 'lewis', titulo: 'Lewis y resonancia' },
  { id: 'vsepr', titulo: 'Geometría (VSEPR)' },
] as const;

export default function EnlaceQuimico() {
  const [seccion, setSeccion] = useState<Seccion>('lewis');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: enlace químico">
          <TeoriaEnlace />
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Tipos de enlace">
        {seccion === 'ionico' && <EnlaceIonico />}
        {seccion === 'covalente' && <EnlaceCovalente />}
        {seccion === 'metalico' && <EnlaceMetalico />}
        {seccion === 'lewis' && <EstructurasLewis />}
        {seccion === 'vsepr' && <GeometriaVSEPR />}
      </Pestanas>
    </div>
  );
}

function TeoriaEnlace() {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold">Regla del octeto</h3>
        <p>
          Los átomos ganan, pierden o comparten electrones para alcanzar 8 electrones de valencia (2 para el H), la configuración de un gas
          noble. Excepciones: octeto incompleto (Be, B, Al), octeto expandido (elementos del periodo 3 en adelante: P, S, Cl, Xe…) y especies
          con número impar de electrones (NO, NO₂).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Tipo de enlace según ΔEN</h3>
        <Formula tex="\Delta EN = |EN_A - EN_B|\qquad \%CI = 100\left(1-e^{-\Delta EN^2/4}\right)" bloque />
        <p>ΔEN = 0: covalente apolar · 0 &lt; ΔEN &lt; 1,7: covalente polar · ΔEN ≥ 1,7 (metal + no metal): iónico.</p>
      </section>
      <section>
        <h3 className="font-semibold">Estructuras de Lewis y carga formal</h3>
        <Formula tex="CF = V - \left(e^-_{\text{libres}} + \tfrac{1}{2}\,e^-_{\text{enlace}}\right)" bloque />
        <p>
          Entre varias estructuras posibles, la más estable tiene las cargas formales más pequeñas y la carga negativa en el átomo más
          electronegativo. Si hay varias ubicaciones equivalentes de los enlaces múltiples, la molécula real es un <strong>híbrido de resonancia</strong>
          (en el NO₃⁻ los tres enlaces N–O son iguales).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">TRPECV (VSEPR)</h3>
        <Formula tex="\text{dominios} = \dfrac{V_{\text{central}} + \sum \text{aportes} - q}{2}" bloque />
        <p>
          Aportes: H y halógenos +1; O y S terminales 0; N terminal −1. Los dominios (enlaces y pares libres) se alejan al máximo: 2 lineal, 3
          trigonal plana, 4 tetraédrica, 5 bipiramidal trigonal, 6 octaédrica. Los pares libres repelen más que los enlazantes y reducen los
          ángulos (CH₄ 109,5° &gt; NH₃ 107° &gt; H₂O 104,5°).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Hibridación</h3>
        <p>2 dominios: sp · 3: sp² · 4: sp³ · 5: sp³d · 6: sp³d².</p>
      </section>
    </div>
  );
}
