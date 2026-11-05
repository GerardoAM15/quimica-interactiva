import { useState } from 'react';
import { parsearNombre, smilesDeGrafo } from '@/chem/nomenclatura/organica';
import { adicion, combustion, esterificar, halogenar, hidrogenar, saponificar, type ResultadoReaccion } from '@/chem/reaccionesOrganicas';
import { balancear, ecuacionTexto } from '@/chem/balance';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce, Formula } from '@/components/Formula';
import { VistaOrganica } from '@/components/molecula/VistaOrganica';

type Tipo = 'combustion' | 'halogenacion' | 'hidrogenacion' | 'adicion' | 'esterificacion' | 'saponificacion';
const TIPOS = [
  { id: 'combustion', titulo: 'Combustión' },
  { id: 'halogenacion', titulo: 'Halogenación' },
  { id: 'hidrogenacion', titulo: 'Hidrogenación' },
  { id: 'adicion', titulo: 'Adición (Markovnikov)' },
  { id: 'esterificacion', titulo: 'Esterificación' },
  { id: 'saponificacion', titulo: 'Saponificación' },
] as const;

const EJEMPLOS: Record<Tipo, string[]> = {
  combustion: ['metano', 'propano', 'octano', 'etanol', 'glucosa'],
  halogenacion: ['metano', 'propano', '2-metilpropano', 'butano', 'ciclohexano'],
  hidrogenacion: ['eteno', 'but-2-eno', 'prop-1-ino', 'buta-1,3-dieno', 'ciclohexeno'],
  adicion: ['eteno', 'prop-1-eno', '2-metilprop-1-eno', 'but-1-eno'],
  esterificacion: ['ácido etanoico + etanol', 'ácido propanoico + metanol', 'ácido metanoico + propan-1-ol', 'ácido butanoico + etanol'],
  saponificacion: ['etanoato de etilo', 'propanoato de metilo', 'butanoato de etilo', 'metanoato de butilo'],
};

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';

/** Texto de la ecuación → mhchem (las fórmulas moleculares con subíndices; los nombres como texto). */
const aCe = (ec: string) => ec.replace(/⇌/g, '<=>').replace(/→/g, '->');

export default function ReaccionesOrganicas() {
  const [tipo, setTipo] = useState<Tipo>('combustion');
  const [entrada, setEntrada] = useState<Record<Tipo, string>>(Object.fromEntries(Object.entries(EJEMPLOS).map(([k, v]) => [k, v[1] ?? v[0]!])) as Record<Tipo, string>);
  const [halogeno, setHalogeno] = useState<'Cl' | 'Br'>('Cl');
  const [reactivo, setReactivo] = useState<'X2' | 'HX' | 'H2O'>('HX');
  const texto = entrada[tipo];
  let r: ResultadoReaccion | null = null;
  let error: string | null = null;
  try {
    if (tipo === 'combustion') {
      // La glucosa no es nombrable por el módulo: se usa su fórmula
      r = texto.trim() === 'glucosa' ? combustionFormula('C6H12O6') : combustion(parsearNombre(texto));
    } else if (tipo === 'halogenacion') r = halogenar(parsearNombre(texto), halogeno);
    else if (tipo === 'hidrogenacion') r = hidrogenar(parsearNombre(texto));
    else if (tipo === 'adicion') r = adicion(parsearNombre(texto), reactivo, halogeno);
    else if (tipo === 'esterificacion') {
      const [a, b] = texto.split('+').map((x) => x.trim());
      if (!a || !b) throw new Error('Escribe «ácido … + alcohol».');
      r = esterificar(parsearNombre(a), parsearNombre(b));
    } else r = saponificar(parsearNombre(texto));
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: reacciones orgánicas básicas">
          <div className="space-y-3">
            <Formula tex="\text{Combustión completa: } \ce{C_xH_yO_z + O2 -> CO2 + H2O}" bloque />
            <Formula tex="\text{Halogenación (sustitución, luz UV): } \ce{CH4 + Cl2 ->[h\nu] CH3Cl + HCl}" bloque />
            <Formula tex="\text{Hidrogenación (adición, Ni/Pt): } \ce{CH2=CH2 + H2 ->[Ni] CH3-CH3}" bloque />
            <p>
              <strong>Regla de Markovnikov:</strong> en la adición de HX o H₂O a un alqueno asimétrico, el H se une al carbono del doble enlace que tiene más
              hidrógenos.
            </p>
            <Formula tex="\text{Esterificación: } \ce{R-COOH + R'-OH <=>[H+] R-COO-R' + H2O}\qquad \text{Saponificación: } \ce{R-COO-R' + NaOH -> R-COONa + R'-OH}" bloque />
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={TIPOS} activa={tipo} alCambiar={setTipo} etiqueta="Tipo de reacción">
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block font-medium">{tipo === 'esterificacion' ? 'Ácido + alcohol' : 'Reactivo orgánico (nombre IUPAC)'}</span>
              <input value={texto} onChange={(e) => setEntrada((s) => ({ ...s, [tipo]: e.target.value }))} className={`${input} w-full`} spellCheck={false} />
            </label>
            {(tipo === 'halogenacion' || (tipo === 'adicion' && reactivo !== 'H2O')) && (
              <label>
                <span className="mb-1 block font-medium">Halógeno</span>
                <select value={halogeno} onChange={(e) => setHalogeno(e.target.value as 'Cl' | 'Br')} className={input}>
                  <option value="Cl">cloro</option>
                  <option value="Br">bromo</option>
                </select>
              </label>
            )}
            {tipo === 'adicion' && (
              <label>
                <span className="mb-1 block font-medium">Se adiciona</span>
                <select value={reactivo} onChange={(e) => setReactivo(e.target.value as 'X2' | 'HX' | 'H2O')} className={input}>
                  <option value="HX">HX (halogenuro de hidrógeno)</option>
                  <option value="X2">X₂ (halógeno)</option>
                  <option value="H2O">H₂O (hidratación, H⁺)</option>
                </select>
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {EJEMPLOS[tipo].map((e) => (
              <button key={e} type="button" onClick={() => setEntrada((s) => ({ ...s, [tipo]: e }))} className="rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2">
                {e}
              </button>
            ))}
          </div>
          {error && <p className="text-aviso">{error}</p>}
          {r && (
            <div className="space-y-3 rounded-lg border border-borde bg-superficie p-4">
              {tipo === 'combustion' ? <Ce bloque>{aCe(r.ecuacion)}</Ce> : <p className="text-base font-medium">{r.ecuacion}</p>}
              {r.productos.length > 0 && (
                <ul className="flex flex-wrap gap-4">
                  {r.productos.map((p) => (
                    <li key={p.nombre} className="space-y-1">
                      <p className="font-semibold">
                        {p.nombre}
                        {p.fraccion !== undefined && r!.productos.length > 1 && <span className="ml-2 font-normal text-texto-suave tabular-nums">{(p.fraccion * 100).toFixed(0)} % (estadístico)</span>}
                      </p>
                      {!/de sodio$/.test(p.nombre) ? <VistaOrganica smiles={smilesDeGrafo(p.grafo)} titulo={p.nombre} ancho={240} alto={160} con3D={false} /> : <VistaOrganica smiles={`${smilesDeGrafo(p.grafo).replace(/O$/, '[O-]')}.[Na+]`} titulo={p.nombre} ancho={240} alto={160} con3D={false} />}
                    </li>
                  ))}
                </ul>
              )}
              <PasoAPaso pasos={r.explicacion.map((x) => ({ titulo: x }))} abierto />
            </div>
          )}
        </div>
      </Pestanas>
    </div>
  );
}

function combustionFormula(f: string): ResultadoReaccion {
  return { ecuacion: ecuacionTexto(balancear(`${f} + O2 -> CO2 + H2O`)), productos: [], explicacion: ['Combustión completa: solo se forman CO₂ y H₂O.', 'Coeficientes enteros mínimos por el método algebraico.'] };
}
