// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ELEMENTOS } from '@/chem/elements';
import { licenciaPermitida } from '../tabla-periodica/FotoWikimedia';
import { aparienciaDe } from '../tabla-periodica/apariencia';
import { COLOR_BLOQUE, COLOR_ESTADO, COLOR_FAMILIA, colorEscala, colorTexto } from '../tabla-periodica/colores';
import { CuadriculaPeriodica } from '../tabla-periodica/CuadriculaPeriodica';
import { FichaElemento } from '../tabla-periodica/FichaElemento';
import { NumerosCuanticos } from '../estructura-atomica/NumerosCuanticos';

afterEach(cleanup);

/** Razón de contraste WCAG entre dos colores. */
function contraste(a: string, b: string): number {
  const L = (c: string) => {
    const m = c.startsWith('#') ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : (c.match(/\d+/g) ?? []).slice(0, 3).map(Number);
    const lin = m.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
  };
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

describe('fotos de Wikimedia: solo licencias libres', () => {
  it.each(['CC BY 4.0', 'CC BY-SA 3.0', 'CC-BY-SA-4.0', 'CC0', 'Public domain', 'PD-self'])('acepta %s', (l) => {
    expect(licenciaPermitida(l)).toBe(true);
  });
  it.each(['CC BY-NC 4.0', 'CC BY-ND 2.0', 'CC BY-NC-SA 3.0', 'Fair use', 'All rights reserved', ''])('rechaza «%s»', (l) => {
    expect(licenciaPermitida(l)).toBe(false);
  });
});

describe('contraste de las casillas (WCAG AA ≥ 4,5:1)', () => {
  const fondos = [...Object.values(COLOR_FAMILIA), ...Object.values(COLOR_BLOQUE), ...Object.values(COLOR_ESTADO), ...[0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].map(colorEscala), '#3a4157'];
  it.each(fondos)('fondo %s', (f) => {
    expect(contraste(f, colorTexto(f))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('apariencia de los elementos', () => {
  it('todos los elementos tienen un aspecto definido', () => {
    for (const e of ELEMENTOS) {
      const ap = aparienciaDe(e.z);
      expect(ap.descripcion.length, e.simbolo).toBeGreaterThan(10);
      if (ap.tipo === 'liquido') expect(['Br', 'Hg']).toContain(e.simbolo);
    }
    expect(aparienciaDe(10).tipo).toBe('gas');
    expect(aparienciaDe(80).metalico).toBe(true);
    expect(aparienciaDe(110).tipo).toBe('no-observable');
  });
});

describe('interfaz del bloque A', () => {
  it('la cuadrícula muestra los 118 elementos y permite elegir uno', () => {
    let elegido = 0;
    render(<CuadriculaPeriodica modo="familia" norm={undefined} seleccion={null} resaltados={null} alElegir={(z) => (elegido = z)} />);
    const botones = screen.getAllByRole('button');
    expect(botones).toHaveLength(118);
    fireEvent.click(screen.getByRole('button', { name: /^Hierro, Fe/ }));
    expect(elegido).toBe(26);
  });

  it('la ficha muestra los datos del elemento', () => {
    render(
      <MemoryRouter>
        <FichaElemento z={29} alElegir={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Cobre/ })).toBeTruthy();
    expect(screen.getByText(/del latín cuprum/)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Electrones' }));
    expect(screen.getByText(/Excepción a la regla de Moeller/)).toBeTruthy();
  });

  it('el explorador de números cuánticos valida l < n', () => {
    render(<NumerosCuanticos />);
    expect(screen.getByText(/Combinación válida/)).toBeTruthy();
  });
});
