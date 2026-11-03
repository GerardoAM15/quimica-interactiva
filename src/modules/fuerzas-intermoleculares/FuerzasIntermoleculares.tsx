import { lazy, Suspense, useEffect, useState } from 'react';
import { fuerzasIntermoleculares, type FuerzasIntermoleculares as Fuerzas } from '@/chem/fuerzas';
import { BuscadorMoleculas } from '@/components/molecula/BuscadorMoleculas';
import { CATALOGO, cargarDelCatalogo, type EntradaCatalogo } from '@/components/molecula/cargarMolecula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Cargando } from '@/components/Cargando';
import { Ce, Formula } from '@/components/Formula';

const GraficasEbullicion = lazy(() => import('./GraficasEbullicion'));

type Seccion = 'tipos' | 'analizar' | 'ebullicion';
const SECCIONES = [
  { id: 'tipos', titulo: 'Tipos de fuerzas' },
  { id: 'analizar', titulo: 'Analizar y comparar' },
  { id: 'ebullicion', titulo: 'Puntos de ebullición' },
] as const;

export default function FuerzasIntermoleculares() {
  const [seccion, setSeccion] = useState<Seccion>('analizar');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: fuerzas intermoleculares">
          <TeoriaFuerzas />
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Fuerzas intermoleculares">
        {seccion === 'tipos' && <TiposFuerzas />}
        {seccion === 'analizar' && <Comparador />}
        {seccion === 'ebullicion' && (
          <Suspense fallback={<Cargando texto="Cargando gráficas…" />}>
            <GraficasEbullicion />
          </Suspense>
        )}
      </Pestanas>
    </div>
  );
}

/** Esquemas de cada tipo de fuerza (SVG). */
function TiposFuerzas() {
  const tarjeta = 'rounded-lg border border-borde bg-superficie p-4';
  const molecula = (x: number, y: number, izq: string, der: string, rot = 0) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse rx={30} ry={14} fill="#38bdf8" fillOpacity={0.25} stroke="#38bdf8" />
      <text x={-18} y={4} fontSize={11} textAnchor="middle" fill="#2563eb">{izq}</text>
      <text x={18} y={4} fontSize={11} textAnchor="middle" fill="#dc2626">{der}</text>
    </g>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className={tarjeta}>
        <h3 className="font-semibold">Dispersión de London</h3>
        <svg viewBox="0 0 260 70" className="my-2 w-full text-texto" aria-hidden>
          {molecula(60, 35, 'δ+', 'δ−')}
          {molecula(170, 35, 'δ+', 'δ−')}
          <text x={115} y={40} fontSize={12} fill="currentColor" opacity={0.6}>· · ·</text>
        </svg>
        <p className="text-sm">
          Dipolos <strong>instantáneos</strong> por el movimiento de los electrones inducen dipolos en las vecinas. Existen en todas las moléculas;
          aumentan con la masa molar y la superficie de contacto. Son las únicas en moléculas apolares (CH₄, Cl₂, CO₂).
        </p>
      </article>
      <article className={tarjeta}>
        <h3 className="font-semibold">Dipolo-dipolo</h3>
        <svg viewBox="0 0 260 70" className="my-2 w-full text-texto" aria-hidden>
          {molecula(60, 35, 'δ+', 'δ−')}
          {molecula(170, 35, 'δ+', 'δ−')}
          <line x1={95} y1={35} x2={135} y2={35} stroke="currentColor" strokeDasharray="3 3" opacity={0.6} />
        </svg>
        <p className="text-sm">
          Atracción entre el extremo δ− de una molécula polar y el δ+ de otra (HCl, acetona, SO₂). Más intensas que las de London a masa molar
          parecida.
        </p>
      </article>
      <article className={tarjeta}>
        <h3 className="font-semibold">Puente de hidrógeno</h3>
        <svg viewBox="0 0 260 90" className="my-2 w-full text-texto" aria-hidden>
          <text x={50} y={50} fontSize={16} fontWeight={700} fill="#ef4444">O</text>
          <text x={30} y={78} fontSize={13} fill="currentColor">H</text>
          <text x={80} y={46} fontSize={13} fill="currentColor">H</text>
          <line x1={58} y1={52} x2={40} y2={70} stroke="currentColor" />
          <line x1={64} y1={42} x2={80} y2={42} stroke="currentColor" />
          <line x1={92} y1={42} x2={148} y2={42} stroke="#ec4899" strokeDasharray="4 3" strokeWidth={2} />
          <text x={150} y={48} fontSize={16} fontWeight={700} fill="#ef4444">O</text>
          <text x={175} y={30} fontSize={13} fill="currentColor">H</text>
          <text x={175} y={72} fontSize={13} fill="currentColor">H</text>
          <line x1={162} y1={38} x2={176} y2={30} stroke="currentColor" />
          <line x1={162} y1={48} x2={176} y2={64} stroke="currentColor" />
        </svg>
        <p className="text-sm">
          Un H unido a <strong>N, O o F</strong> (muy electronegativos y pequeños) se atrae fuertemente hacia un par libre de N, O o F de otra
          molécula. Explica el alto punto de ebullición del agua y que el hielo flote.
        </p>
      </article>
      <article className={tarjeta}>
        <h3 className="font-semibold">Ion-dipolo</h3>
        <svg viewBox="0 0 260 90" className="my-2 w-full text-texto" aria-hidden>
          <circle cx={130} cy={45} r={16} fill="#a78bfa" />
          <text x={130} y={50} fontSize={13} textAnchor="middle" fill="#fff">Na⁺</text>
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a} 130 45) translate(130 45)`}>
              <text x={34} y={4} fontSize={11} fill="#dc2626">δ−O</text>
              <text x={58} y={4} fontSize={10} fill="currentColor" opacity={0.7}>H₂</text>
            </g>
          ))}
        </svg>
        <p className="text-sm">Entre un ion y moléculas polares: el Na⁺ se rodea de los O (δ−) del agua. Es la base de la disolución de las sales en agua.</p>
      </article>
      <p className="text-sm text-texto-suave md:col-span-2">
        Intensidad relativa (en general): ion-dipolo &gt; puente de hidrógeno &gt; dipolo-dipolo &gt; London (a masa molar parecida). En
        moléculas muy grandes, las fuerzas de London pueden superar a las demás.
      </p>
    </div>
  );
}

function useFuerzas(m: EntradaCatalogo | null) {
  const [f, setF] = useState<Fuerzas | null>(null);
  useEffect(() => {
    if (!m) return;
    let vivo = true;
    setF(null);
    void cargarDelCatalogo(m.cid).then(({ molecula }) => vivo && setF(fuerzasIntermoleculares(molecula)));
    return () => {
      vivo = false;
    };
  }, [m]);
  return f;
}

function FichaFuerzas({ m, f }: { m: EntradaCatalogo; f: Fuerzas | null }) {
  const item = (si: boolean, texto: string) => (
    <li className="flex items-center gap-2">
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${si ? 'bg-exito text-acento-texto' : 'bg-superficie-2 text-texto-suave'}`} aria-hidden>
        {si ? '✓' : '–'}
      </span>
      <span className={si ? '' : 'text-texto-suave'}>
        {texto}
        <span className="sr-only">{si ? ': sí' : ': no'}</span>
      </span>
    </li>
  );
  return (
    <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
      <h3 className="text-base font-semibold">
        {m.nombre} <span className="font-normal text-texto-suave">(<Ce>{m.formula.replace(/([+-])(\d?)$/, '^{$2$1}')}</Ce>, {m.masaMolar} g/mol)</span>
      </h3>
      {!f ? (
        <p className="mt-2 text-texto-suave">Analizando…</p>
      ) : (
        <>
          <ul className="mt-2 space-y-1">
            {item(true, 'Fuerzas de London')}
            {item(f.dipoloDipolo, 'Dipolo-dipolo (molécula polar)')}
            {item(f.puenteHidrogeno, 'Puente de hidrógeno')}
            {item(f.esIon, 'Ion-dipolo (es un ion)')}
          </ul>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-texto-suave">
            {f.explicacion.slice(1).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2">
            Punto de {m.puntoEbullicion?.sublima ? 'sublimación' : 'ebullición'}:{' '}
            <strong>{m.puntoEbullicion ? `${m.puntoEbullicion.valor} °C` : 'sin dato en PubChem'}</strong>
          </p>
        </>
      )}
    </div>
  );
}

/** Puntaje de la fuerza más intensa (para argumentar la comparación). */
const nivel = (f: Fuerzas) => (f.esIon ? 4 : f.puenteHidrogeno ? 3 : f.dipoloDipolo ? 2 : 1);
const NOMBRE_NIVEL = ['', 'solo fuerzas de London', 'dipolo-dipolo', 'puentes de hidrógeno', 'interacciones iónicas'];

function Comparador() {
  const [a, setA] = useState<EntradaCatalogo | null>(() => CATALOGO.find((m) => m.nombre === 'etanol') ?? null);
  const [b, setB] = useState<EntradaCatalogo | null>(() => CATALOGO.find((m) => m.nombre === 'metoximetano (éter dimetílico)') ?? null);
  const fa = useFuerzas(a), fb = useFuerzas(b);

  let conclusion: string | null = null;
  if (a && b && fa && fb && a.puntoEbullicion && b.puntoEbullicion) {
    const [mayor, menor, fM, fm] = a.puntoEbullicion.valor >= b.puntoEbullicion.valor ? [a, b, fa, fb] : [b, a, fb, fa];
    const razon =
      nivel(fM) > nivel(fm)
        ? `porque presenta ${NOMBRE_NIVEL[nivel(fM)]}, más intensas que las de ${menor.nombre} (${NOMBRE_NIVEL[nivel(fm)]})`
        : nivel(fM) === nivel(fm) && mayor.masaMolar > menor.masaMolar
          ? `porque, con el mismo tipo de fuerza, tiene mayor masa molar (más electrones → fuerzas de London más intensas)`
          : 'aunque las fuerzas son de tipo parecido, influyen la forma molecular, el número de puentes de H o la polarizabilidad';
    conclusion = `${mayor.nombre} hierve a mayor temperatura (${mayor.puntoEbullicion!.valor} °C frente a ${menor.puntoEbullicion!.valor} °C) ${razon}.`;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <BuscadorMoleculas alElegir={setA} etiqueta="Molécula A" />
          {a && <FichaFuerzas m={a} f={fa} />}
        </div>
        <div className="space-y-2">
          <BuscadorMoleculas alElegir={setB} etiqueta="Molécula B" />
          {b && <FichaFuerzas m={b} f={fb} />}
        </div>
      </div>
      {conclusion && (
        <p className="rounded-md border border-acento/50 p-3 text-sm" aria-live="polite">
          <strong>Comparación:</strong> {conclusion}
        </p>
      )}
      <p className="text-xs text-texto-suave">
        La polaridad se determina con la geometría 3D (enlaces polares o pares libres que no se cancelan); los puentes de hidrógeno, por la
        presencia de H unido a N, O o F y de un aceptor con par libre.
      </p>
    </div>
  );
}

function TeoriaFuerzas() {
  return (
    <div className="space-y-4">
      <p>
        Las fuerzas intermoleculares son atracciones <strong>entre</strong> moléculas (mucho más débiles que los enlaces dentro de ellas).
        Determinan el estado físico, el punto de ebullición, la solubilidad y la viscosidad.
      </p>
      <section>
        <h3 className="font-semibold">Energía de la interacción dipolo-dipolo</h3>
        <Formula tex="E \propto -\dfrac{\mu_1\,\mu_2}{r^3}" bloque />
        <p>Crece con los momentos dipolares μ y disminuye rápidamente con la distancia r.</p>
      </section>
      <section>
        <h3 className="font-semibold">Fuerzas de London</h3>
        <Formula tex="E \propto -\dfrac{\alpha_1\,\alpha_2}{r^6}" bloque />
        <p>α es la polarizabilidad (facilidad para deformar la nube electrónica), que aumenta con el número de electrones y el tamaño.</p>
      </section>
      <section>
        <h3 className="font-semibold">Regla práctica para comparar puntos de ebullición</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Identificar el tipo de fuerza más intensa de cada sustancia.</li>
          <li>Si es el mismo tipo, la de mayor masa molar (más electrones) hierve a mayor temperatura.</li>
          <li>Con igual masa, la molécula más lineal (más superficie de contacto) hierve más alto que la ramificada.</li>
        </ol>
      </section>
    </div>
  );
}
