export class InvalidCardTitleError extends Error {
    constructor(reason) {
        super(`Título de cartão inválido: ${reason}`);
        this.name = 'InvalidCardTitleError';
    }
}
export class InvalidCardColumnError extends Error {
    constructor(reason) {
        super(`Coluna do cartão inválida: ${reason}`);
        this.name = 'InvalidCardColumnError';
    }
}
export class InvalidPriorityError extends Error {
    constructor(value) {
        super(`Prioridade inválida: "${String(value)}". Use "baixa", "média" ou "alta".`);
        this.name = 'InvalidPriorityError';
    }
}
export class CardNotFoundError extends Error {
    constructor(id) {
        super(`Cartão com ID "${id}" não encontrado.`);
        this.name = 'CardNotFoundError';
    }
}
export class WipLimitExceededError extends Error {
    constructor(columnName, limit) {
        super(`Limite de WIP (${limit}) excedido para a coluna "${columnName}".`);
        this.name = 'WipLimitExceededError';
    }
}
export class DuplicateCardTitleError extends Error {
    constructor(title, columnId) {
        super(`Já existe um cartão com o título "${title}" na coluna "${columnId}".`);
        this.name = 'DuplicateCardTitleError';
    }
}
