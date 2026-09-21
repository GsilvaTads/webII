import { describe, it, expect } from 'vitest';
import { DomainError, NotImplementedError } from '../../../src/shared/errors.js';

describe('shared/errors', () => {
  it('instancia DomainError com mensagem e nome esperados', () => {
    const err = new DomainError('Falha de domínio');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('Falha de domínio');
    expect(err.name).toBe('DomainError');
  });

  it('instancia NotImplementedError com mensagem padrão e customizada', () => {
    const err = new NotImplementedError('MetodoX');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('MetodoX');
    expect(err.name).toBe('NotImplementedError');
  });
});