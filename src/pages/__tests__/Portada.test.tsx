// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Portada from '../Portada';
import { MODULOS } from '@/modules/registro';

afterEach(cleanup);

describe('Portada', () => {
  it('muestra el título y enlaza a los 24 módulos', () => {
    render(
      <MemoryRouter>
        <Portada />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Química/);
    for (const m of MODULOS) {
      const enlaces = screen.getAllByRole('link', { name: new RegExp(m.titulo) });
      expect(enlaces.some((a) => a.getAttribute('href') === `/modulo/${m.slug}`)).toBe(true);
    }
  });
});
