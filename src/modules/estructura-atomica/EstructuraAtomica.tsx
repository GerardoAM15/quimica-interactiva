import { useState } from 'react';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Formula } from '@/components/Formula';
import { ModelosAtomicos } from './ModelosAtomicos';
import { NumerosCuanticos } from './NumerosCuanticos';
import { ConfiguracionElectronica } from './ConfiguracionElectronica';
import { IsotoposIones } from './IsotoposIones';
import { EspectroHidrogeno } from './EspectroHidrogeno';

type Seccion = 'modelos' | 'numeros' | 'configuracion' | 'isotopos' | 'espectro';
const SECCIONES = [
  { id: 'modelos', titulo: 'Modelos atómicos' },
  { id: 'numeros', titulo: 'Números cuánticos' },
  { id: 'configuracion', titulo: 'Configuración electrónica' },
  { id: 'isotopos', titulo: 'Isótopos e iones' },
  { id: 'espectro', titulo: 'Espectro del hidrógeno' },
] as const;

export default function EstructuraAtomica() {
  const [seccion, setSeccion] = useState<Seccion>('configuracion');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: estructura atómica">
          <TeoriaEstructura />
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Secciones de estructura atómica">
        {seccion === 'modelos' && <ModelosAtomicos />}
        {seccion === 'numeros' && <NumerosCuanticos />}
        {seccion === 'configuracion' && <ConfiguracionElectronica />}
        {seccion === 'isotopos' && <IsotoposIones />}
        {seccion === 'espectro' && <EspectroHidrogeno />}
      </Pestanas>
    </div>
  );
}

function TeoriaEstructura() {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold">Partículas fundamentales</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] text-sm">
            <thead>
              <tr className="border-b border-borde text-left">
                <th className="py-1 pr-2">Partícula</th>
                <th className="py-1 pr-2">Carga</th>
                <th className="py-1">Masa (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-borde/50">
                <td className="py-1 pr-2">Electrón (e⁻)</td>
                <td className="py-1 pr-2">−1,602 × 10⁻¹⁹ C</td>
                <td className="py-1">9,109 × 10⁻³¹</td>
              </tr>
              <tr className="border-b border-borde/50">
                <td className="py-1 pr-2">Protón (p⁺)</td>
                <td className="py-1 pr-2">+1,602 × 10⁻¹⁹ C</td>
                <td className="py-1">1,6726 × 10⁻²⁷</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Neutrón (n⁰)</td>
                <td className="py-1 pr-2">0</td>
                <td className="py-1">1,6749 × 10⁻²⁷</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-sm text-texto-suave">Valores CODATA. El protón es ≈ 1836 veces más pesado que el electrón.</p>
      </section>
      <section>
        <h3 className="font-semibold">Notación de nucleido</h3>
        <Formula tex="{}^{A}_{Z}\mathrm{X}^{q}\qquad A = Z + N\qquad \#e^- = Z - q" bloque />
        <p>A: número de masa (nucleones); Z: número atómico (protones); N: neutrones; q: carga del ion.</p>
      </section>
      <section>
        <h3 className="font-semibold">Modelo de Bohr (átomos hidrogenoides)</h3>
        <Formula tex="r_n = a_0\dfrac{n^2}{Z}\ \ (a_0 = 0{,}529\ \text{Å})\qquad E_n = -\dfrac{13{,}6\ \text{eV}\,Z^2}{n^2}" bloque />
        <p>La energía del fotón emitido o absorbido en un salto entre niveles es:</p>
        <Formula tex="E_{\text{fotón}} = |E_i - E_f| = h\nu = \dfrac{hc}{\lambda}" bloque />
      </section>
      <section>
        <h3 className="font-semibold">Ecuación de Rydberg</h3>
        <Formula tex="\dfrac{1}{\lambda} = R_H\,Z^2\left(\dfrac{1}{n_f^2} - \dfrac{1}{n_i^2}\right),\qquad R_H = 1{,}09678\times10^{7}\ \text{m}^{-1}" bloque />
        <p>
          Series: Lyman (n_f = 1, UV), Balmer (n_f = 2, visible), Paschen (3), Brackett (4) y Pfund (5) en el infrarrojo.
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Números cuánticos</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>n</strong> (principal): nivel de energía y tamaño del orbital; n = 1, 2, 3…</li>
          <li><strong>l</strong> (secundario): subnivel y forma; l = 0 … n − 1 (s, p, d, f).</li>
          <li><strong>mₗ</strong> (magnético): orientación del orbital; −l … +l.</li>
          <li><strong>mₛ</strong> (spin): giro del electrón; +1/2 o −1/2.</li>
        </ul>
        <p className="mt-1">Máximo de electrones: subnivel 2(2l + 1); nivel 2n². Energía relativa: ER = n + l.</p>
      </section>
      <section>
        <h3 className="font-semibold">Principios de llenado</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Aufbau / Moeller:</strong> los electrones ocupan primero los subniveles de menor n + l; a igual n + l, el de menor n.</li>
          <li><strong>Pauli:</strong> dos electrones de un átomo no pueden tener los cuatro números cuánticos iguales → máximo 2 por orbital, con spines opuestos.</li>
          <li><strong>Hund:</strong> en orbitales de igual energía, primero un electrón en cada uno con spines paralelos.</li>
        </ul>
        <p className="mt-1 text-sm text-texto-suave">
          Anomalías frecuentes en examen: Cr y Mo (d⁵s¹), Cu, Ag y Au (d¹⁰s¹), Pd (4d¹⁰).
        </p>
      </section>
    </div>
  );
}
