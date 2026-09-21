import { describe, it, expect, vi } from 'vitest';
import { redirect, respond } from '../../../src/shared/http.js';
import { errorHandler } from '../../../src/shared/errorHandler.js';

describe('shared/http e errorHandler branches', () => {
  it('redirect permite definir status customizado (diferente de 302)', () => {
    const res = redirect('/outra-rota', 301);
    expect(res.status).toBe(301);
    expect(res.redirectTo).toBe('/outra-rota');
  });

  it('respond renderiza view quando o resultado é de render', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      render: vi.fn(),
    } as any;

    respond(res, {
      status: 200,
      view: 'cards/show',
      locals: { ok: true },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.render).toHaveBeenCalledWith('cards/show', { ok: true });
  });

  it('respond redireciona quando o resultado é de redirect', () => {
    const res = {
      redirect: vi.fn(),
    } as any;

    respond(res, redirect('/boards/board-2'));
    respond(res, { status: 302, redirectTo: '/boards/board-2' });
    respond(res, { redirectTo: '/default-status' });

    expect(res.redirect).toHaveBeenCalledWith(302, '/boards/board-2');
    expect(res.redirect).toHaveBeenCalledWith(302, '/default-status');
    expect(res.redirect).toHaveBeenCalledTimes(3);
  });

  it('errorHandler renderiza erro 500 genérico para exceções não mapeadas', () => {
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      render: vi.fn(),
    } as any;
    const next = vi.fn();

    const erroGenerico = new Error('Falha inesperada no banco');
    errorHandler(erroGenerico, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ status: 500 }));
  });
});