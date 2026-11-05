/**
 * «Descargar todo»: comprueba que el service worker haya guardado todos los recursos de la
 * aplicación (manifiesto de precaché de Workbox en sw.js) y descarga los que falten, para poder
 * usarla completa sin conexión (RDKit, KaTeX, Three.js, las 297 estructuras del catálogo…).
 */

export interface Recurso {
  url: string;
  revision: string | null;
}

export interface EstadoDescarga {
  disponible: boolean;
  motivo?: string;
  total: number;
  guardados: number;
  faltantes: Recurso[];
  persistente: boolean | null;
  usoMB: number | null;
  cuotaMB: number | null;
}

/** Lee la lista de recursos precacheados del service worker publicado. */
export async function listaPrecache(): Promise<Recurso[]> {
  const r = await fetch('./sw.js', { cache: 'no-store' });
  if (!r.ok) throw new Error('No se encontró el service worker.');
  const texto = await r.text();
  return [...texto.matchAll(/\{url:"([^"]+)",revision:(?:null|"([^"]*)")\}/g)].map((m) => ({ url: m[1]!, revision: m[2] ?? null }));
}

/** Clave con la que Workbox guarda cada recurso: los que tienen revisión llevan «__WB_REVISION__». */
const clave = (r: Recurso) => {
  const u = new URL(r.url, location.href.replace(/#.*$/, ''));
  if (r.revision) u.searchParams.set('__WB_REVISION__', r.revision);
  return u.href;
};

async function cachePrecache(): Promise<Cache | null> {
  const nombre = (await caches.keys()).find((k) => k.includes('precache'));
  return nombre ? caches.open(nombre) : null;
}

const MB = 1024 * 1024;

export async function estadoDescarga(): Promise<EstadoDescarga> {
  const base: EstadoDescarga = { disponible: false, total: 0, guardados: 0, faltantes: [], persistente: null, usoMB: null, cuotaMB: null };
  if (!('serviceWorker' in navigator) || !('caches' in window)) return { ...base, motivo: 'Este navegador no permite el uso sin conexión.' };
  let lista: Recurso[];
  try {
    lista = await listaPrecache();
  } catch {
    return { ...base, motivo: 'El uso sin conexión solo está disponible en la versión publicada (no en el modo de desarrollo).' };
  }
  const cache = await cachePrecache();
  const faltantes: Recurso[] = [];
  for (const r of lista) if (!cache || !(await cache.match(clave(r)))) faltantes.push(r);
  let persistente: boolean | null = null, usoMB: number | null = null, cuotaMB: number | null = null;
  try {
    persistente = (await navigator.storage?.persisted?.()) ?? null;
    const e = await navigator.storage?.estimate?.();
    if (e) (usoMB = (e.usage ?? 0) / MB), (cuotaMB = (e.quota ?? 0) / MB);
  } catch {
    /* sin Storage API */
  }
  return { disponible: true, total: lista.length, guardados: lista.length - faltantes.length, faltantes, persistente, usoMB, cuotaMB };
}

/**
 * Descarga y guarda los recursos que falten en la caché de Workbox (con la misma clave que usaría
 * el service worker) y pide almacenamiento persistente para que el navegador no lo borre.
 */
export async function descargarTodo(alAvanzar: (hechos: number, total: number) => void): Promise<{ errores: string[] }> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* opcional */
  }
  const estado = await estadoDescarga();
  if (!estado.disponible) throw new Error(estado.motivo ?? 'No disponible.');
  const nombre = (await caches.keys()).find((k) => k.includes('precache')) ?? 'workbox-precache-v2-manual';
  const cache = await caches.open(nombre);
  const errores: string[] = [];
  let hechos = 0;
  alAvanzar(0, estado.faltantes.length);
  // De a 6 en paralelo
  const cola = [...estado.faltantes];
  const trabajador = async () => {
    for (let r = cola.shift(); r; r = cola.shift()) {
      try {
        const resp = await fetch(new URL(r.url, location.href.replace(/#.*$/, '')).href, { cache: 'reload' });
        if (!resp.ok) throw new Error(String(resp.status));
        await cache.put(clave(r), resp);
      } catch (e) {
        errores.push(`${r.url}: ${(e as Error).message}`);
      }
      alAvanzar(++hechos, estado.faltantes.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabajador));
  return { errores };
}
