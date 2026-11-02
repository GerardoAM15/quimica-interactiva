import { Formula } from '@/components/Formula';

/** Teoría del módulo 1 (tabla periódica y propiedades periódicas). */
export function TeoriaTablaPeriodica() {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold">Ley periódica</h3>
        <p>
          Las propiedades de los elementos son funciones periódicas de su <strong>número atómico</strong> Z (Moseley, 1913).
          La tabla actual ordena los 118 elementos por Z creciente en 7 <strong>periodos</strong> (filas) y 18{' '}
          <strong>grupos</strong> (columnas).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Periodo, grupo y bloque a partir de la configuración</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Periodo</strong> = mayor nivel n ocupado. Ejemplo: Fe, [Ar] 4s² 3d⁶ → periodo 4.
          </li>
          <li>
            <strong>Bloque</strong> = subnivel del último electrón según Moeller (s, p, d o f).
          </li>
          <li>
            <strong>Grupo A</strong> (bloques s y p): número de electrones de valencia ns + np. Cl: 3s² 3p⁵ → VIIA (17).
          </li>
          <li>
            <strong>Grupo B</strong> (bloque d): ns + (n−1)d. Si la suma es 8, 9 o 10 → VIIIB; 11 → IB; 12 → IIB.
          </li>
        </ul>
        <p className="mt-1 text-sm text-texto-suave">Conversión: grupos IUPAC 1–2 = IA–IIA, 3–12 = IIIB–IIB, 13–18 = IIIA–VIIIA.</p>
      </section>
      <section>
        <h3 className="font-semibold">Carga nuclear efectiva</h3>
        <p>Los electrones internos apantallan parte de la carga del núcleo. La carga que «siente» un electrón externo es:</p>
        <Formula tex="Z_{\text{ef}} = Z - S" bloque />
        <p>
          donde S es la constante de apantallamiento. En un periodo, Z aumenta pero los electrones nuevos entran al mismo
          nivel (apantallan poco): Z<sub>ef</sub> crece de izquierda a derecha. Esto explica casi todas las tendencias.
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Tendencias periódicas</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-borde text-left">
                <th className="py-1 pr-2">Propiedad</th>
                <th className="py-1 pr-2">En un periodo (→)</th>
                <th className="py-1">En un grupo (↓)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Radio atómico', 'disminuye', 'aumenta'],
                ['Energía de ionización', 'aumenta', 'disminuye'],
                ['Electronegatividad', 'aumenta', 'disminuye'],
                ['Afinidad electrónica', 'aumenta (en general)', 'disminuye (en general)'],
                ['Carácter metálico', 'disminuye', 'aumenta'],
              ].map(([p, a, b]) => (
                <tr key={p} className="border-b border-borde/50">
                  <td className="py-1 pr-2 font-medium">{p}</td>
                  <td className="py-1 pr-2">{a}</td>
                  <td className="py-1">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-texto-suave">
          Hay excepciones, por ejemplo en la energía de ionización: Be &gt; B y N &gt; O, por la estabilidad de los
          subniveles llenos (2s²) y semillenos (2p³).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Energía de ionización</h3>
        <p>Energía mínima para arrancar un electrón de un átomo gaseoso en su estado fundamental:</p>
        <Formula tex="\ce{X(g) -> X^+(g) + e^-}\qquad \Delta E = EI_1" bloque />
        <p>
          Se expresa en eV/átomo o kJ/mol: <Formula tex="1\ \text{eV/átomo} = 96{,}485\ \text{kJ/mol}" />.
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Estructuras cristalinas</h3>
        <p>La densidad teórica de un sólido cristalino cúbico se obtiene de su celda unitaria:</p>
        <Formula tex="\rho = \dfrac{Z\,M}{N_A\,a^3}" bloque />
        <p>
          con Z = átomos por celda (sc = 1, bcc = 2, fcc = 4, diamante = 8), M la masa molar y a la arista. Cada átomo aporta
          1/8 si está en un vértice, 1/2 en una cara, 1/4 en una arista y 1 si está en el interior.
        </p>
      </section>
    </div>
  );
}
