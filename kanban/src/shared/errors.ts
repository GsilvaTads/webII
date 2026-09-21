/**
 * Erro lançado por todo caso de uso ainda não implementado neste template.
 * Mapeado para HTTP 501 em `shared/errorHandler.ts`. Ao implementar uma
 * atividade, substituam o `throw new NotImplementedError(...)` pela lógica
 * real — e não esqueçam de atualizar/remover o teste que hoje espera 501
 * para aquela rota (ver `test/integration/routes/`).
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotImplementedError extends Error {
  constructor(methodName: string) {
    super(`Método não implementado: ${methodName}`);
    this.name = 'NotImplementedError';
  }
}