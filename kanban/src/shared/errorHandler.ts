import type { Request, Response, NextFunction } from 'express';
import {
  InvalidCardTitleError,
  InvalidCardColumnError,
  InvalidPriorityError,
  CardNotFoundError,
  WipLimitExceededError,
  DuplicateCardTitleError,
} from '../cards/errors.js';
import {
  ColumnNotFoundError,
  InvalidColumnNameError,
  BoardNotFoundError,
} from '../boards/errors.js';
import { NotImplementedError } from './errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const errName = (err as Error)?.name;

  if (
    err instanceof InvalidCardTitleError ||
    err instanceof InvalidCardColumnError ||
    err instanceof InvalidPriorityError ||
    err instanceof InvalidColumnNameError ||
    errName === 'InvalidCardTitleError' ||
    errName === 'InvalidCardColumnError' ||
    errName === 'InvalidPriorityError' ||
    errName === 'InvalidColumnNameError'
  ) {
    res.status(400).render('error', {
      status: 400,
      title: 'Bad Request',
      message: (err as Error).message,
    });
    return;
  }

  if (
    err instanceof CardNotFoundError ||
    err instanceof ColumnNotFoundError ||
    err instanceof BoardNotFoundError ||
    errName === 'CardNotFoundError' ||
    errName === 'ColumnNotFoundError' ||
    errName === 'BoardNotFoundError'
  ) {
    res.status(404).render('error', {
      status: 404,
      title: 'Not Found',
      message: (err as Error).message,
    });
    return;
  }

  if (
    err instanceof WipLimitExceededError ||
    err instanceof DuplicateCardTitleError ||
    errName === 'WipLimitExceededError' ||
    errName === 'DuplicateCardTitleError'
  ) {
    res.status(409).render('error', {
      status: 409,
      title: 'Conflict',
      message: (err as Error).message,
    });
    return;
  }

  if (err instanceof NotImplementedError || errName === 'NotImplementedError') {
    res.status(501).render('error', {
      status: 501,
      title: 'Not Implemented',
      message: (err as Error).message,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Erro interno inesperado.';
  res.status(500).render('error', {
    status: 500,
    title: 'Internal Server Error',
    message,
  });
}