import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { errorHandler } from '../../../src/shared/errorHandler.js';
import { NotImplementedError } from '../../../src/shared/errors.js';
import { ColumnNotFoundError } from '../../../src/boards/errors.js';
import {
  DuplicateCardTitleError,
  InvalidCardTitleError,
  WipLimitExceededError,
} from '../../../src/cards/errors.js';

function buildResponseDouble(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.render = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('errorHandler', () => {
  it('mapeia um erro de validação para 400', () => {
    const res = buildResponseDouble();

    errorHandler(new InvalidCardTitleError('curto'), {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ status: 400 }));
  });

  it('mapeia um erro de conflito para 409', () => {
    const res = buildResponseDouble();

    errorHandler(new DuplicateCardTitleError('Repetido', 'col-1'), {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('mapeia um erro de WIP para 409', () => {
    const res = buildResponseDouble();

    errorHandler(new WipLimitExceededError('A Fazer', 2), {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('mapeia um erro conhecido (NotImplementedError) para o status registrado', () => {
    const res = buildResponseDouble();

    errorHandler(new NotImplementedError('X#y'), {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ status: 501 }));
  });

  it('mapeia outro erro conhecido (ColumnNotFoundError) para 404', () => {
    const res = buildResponseDouble();

    errorHandler(new ColumnNotFoundError('col-x'), {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('usa 500 para um erro que não está no mapa', () => {
    const res = buildResponseDouble();

    errorHandler(new Error('algo inesperado'), {} as never, res, () => undefined);
    errorHandler('string genérica' as never, {} as never, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
