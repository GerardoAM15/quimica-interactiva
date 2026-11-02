import { useEffect, useState } from 'react';
import { elementoPorZ } from '@/chem/elements';
import { useEnLinea } from '@/lib/pwa';
import { aparienciaDe } from './apariencia';

/** Títulos de artículo de Wikipedia (inglés) que no coinciden con el nombre del elemento. */
const TITULOS_ESPECIALES: Record<string, string> = { Hg: 'Mercury (element)' };

/** Licencias permitidas: CC BY, CC BY-SA (cualquier versión), CC0 y dominio público. */
export function licenciaPermitida(licencia: string): boolean {
  const l = licencia.trim().toLowerCase();
  if (/\bnc\b|\bnd\b|non-?commercial|no ?deriv/.test(l)) return false;
  return /^cc[- ]by([- ]sa)?[- ]?\d/.test(l) || /^cc0/.test(l) || /public domain|dominio público|^pd\b|^pd-/.test(l);
}

interface Foto {
  url: string;
  pagina: string;
  autor: string;
  licencia: string;
  urlLicencia: string | null;
  titulo: string;
}

const sinHtml = (html: string) => {
  try {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || 'autor desconocido';
  } catch {
    return html.replace(/<[^>]+>/g, '').trim();
  }
};

async function buscarFoto(z: number, senal: AbortSignal): Promise<Foto | null> {
  const el = elementoPorZ(z);
  const titulo = TITULOS_ESPECIALES[el.simbolo] ?? el.nombreIngles;
  // 1) Imagen principal del artículo de Wikipedia del elemento
  const wp = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(titulo)}`;
  const r1 = await fetch(wp, { signal: senal }).then((r) => r.json());
  const pagina = Object.values(r1?.query?.pages ?? {})[0] as { pageimage?: string } | undefined;
  if (!pagina?.pageimage) return null;
  // 2) Metadatos de licencia en Wikimedia Commons
  const archivo = `File:${pagina.pageimage}`;
  const cm = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(archivo)}`;
  const r2 = await fetch(cm, { signal: senal }).then((r) => r.json());
  const info = (Object.values(r2?.query?.pages ?? {})[0] as { imageinfo?: Record<string, unknown>[] } | undefined)?.imageinfo?.[0] as
    | { thumburl?: string; url: string; descriptionurl: string; extmetadata?: Record<string, { value: string }> }
    | undefined;
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const licencia = meta.LicenseShortName?.value ?? '';
  if (!licenciaPermitida(licencia)) return null;
  return {
    url: info.thumburl ?? info.url,
    pagina: info.descriptionurl,
    autor: sinHtml(meta.Artist?.value ?? ''),
    licencia,
    urlLicencia: meta.LicenseUrl?.value ?? null,
    titulo: pagina.pageimage.replace(/_/g, ' ').replace(/\.[a-z]+$/i, ''),
  };
}

/** Foto real opcional desde Wikimedia Commons (solo licencias libres, con atribución). */
export function FotoWikimedia({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const enLinea = useEnLinea();
  const [pedida, setPedida] = useState(false);
  const [estado, setEstado] = useState<'cargando' | 'lista' | 'sin-foto' | 'error'>('cargando');
  const [foto, setFoto] = useState<Foto | null>(null);
  const noObservable = aparienciaDe(z).tipo === 'no-observable';

  useEffect(() => {
    setPedida(false);
    setFoto(null);
  }, [z]);

  useEffect(() => {
    if (!pedida) return;
    const ctl = new AbortController();
    setEstado('cargando');
    buscarFoto(z, ctl.signal)
      .then((f) => {
        setFoto(f);
        setEstado(f ? 'lista' : 'sin-foto');
      })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') setEstado('error');
      });
    return () => ctl.abort();
  }, [pedida, z]);

  if (noObservable) {
    return <p className="text-sm text-texto-suave">No existen fotografías de una muestra visible de {el.nombre.toLowerCase()}.</p>;
  }
  if (!pedida) {
    return (
      <div className="text-sm">
        <p className="text-texto-suave">
          Se puede mostrar una fotografía real de Wikimedia Commons. Solo se aceptan imágenes con licencia CC BY, CC BY-SA o
          de dominio público, y se indica su autor.
        </p>
        <button
          type="button"
          disabled={!enLinea}
          onClick={() => setPedida(true)}
          className="mt-3 rounded-md bg-acento px-3 py-1.5 font-medium text-acento-texto disabled:opacity-50"
        >
          Cargar foto
        </button>
        {!enLinea && <p className="mt-2 text-aviso">Necesitas conexión a internet para cargar la foto.</p>}
      </div>
    );
  }
  if (estado === 'cargando') return <p className="text-sm text-texto-suave">Buscando foto en Wikimedia Commons…</p>;
  if (estado === 'error') return <p className="text-sm text-error">No se pudo conectar con Wikimedia Commons. Inténtalo más tarde.</p>;
  if (estado === 'sin-foto' || !foto) {
    return <p className="text-sm text-texto-suave">No se encontró una foto con licencia libre compatible para {el.nombre.toLowerCase()}.</p>;
  }
  return (
    <figure className="max-w-xl">
      <img src={foto.url} alt={`Fotografía: ${foto.titulo}`} className="max-h-[420px] w-auto rounded-lg border border-borde" loading="lazy" />
      <figcaption className="mt-2 text-xs text-texto-suave">
        «{foto.titulo}» · Autor: {foto.autor} · Licencia:{' '}
        {foto.urlLicencia ? (
          <a href={foto.urlLicencia} target="_blank" rel="noopener noreferrer" className="underline">
            {foto.licencia}
          </a>
        ) : (
          foto.licencia
        )}{' '}
        ·{' '}
        <a href={foto.pagina} target="_blank" rel="noopener noreferrer" className="underline">
          Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}
