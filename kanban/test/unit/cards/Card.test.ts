import { describe, expect, it } from 'vitest';
import { Card } from '../../../src/cards/Card.js';
import { InvalidCardColumnError, InvalidCardTitleError, InvalidPriorityError } from '../../../src/cards/errors.js';

describe('Card.create', () => {
  it('cria um cartão com prioridade baixa e descrição vazia por padrão', () => {
    const card = Card.create('Configurar ambiente', 'col-todo');

    expect(card.title).toBe('Configurar ambiente');
    expect(card.columnId).toBe('col-todo');
    expect(card.priority).toBe('baixa');
    expect(card.description).toBe('');
    expect(card.id).toBeTypeOf('string');
  });

  it('aceita prioridade e descrição customizadas, normalizando o título', () => {
    const card = Card.create('  Mover cartão  ', 'col-doing', 'alta', '  detalhes  ');

    expect(card.title).toBe('Mover cartão');
    expect(card.priority).toBe('alta');
    expect(card.description).toBe('detalhes');
  });

  it('rejeita título com menos de 3 caracteres', () => {
    expect(() => Card.create('ab', 'col-todo')).toThrow(InvalidCardTitleError);
  });

  it('rejeita título com mais de 120 caracteres', () => {
    expect(() => Card.create('a'.repeat(121), 'col-todo')).toThrow(InvalidCardTitleError);
  });

  it('rejeita título que não é string', () => {
    // @ts-expect-error propositalmente passando um tipo inválido
    expect(() => Card.create(123, 'col-todo')).toThrow(InvalidCardTitleError);
  });

  it('rejeita columnId vazio', () => {
    expect(() => Card.create('Título válido', '   ')).toThrow(InvalidCardColumnError);
  });

  it('rejeita columnId que não é string', () => {
    // @ts-expect-error propositalmente passando um tipo inválido
    expect(() => Card.create('Título válido', 42)).toThrow(InvalidCardColumnError);
  });

  it('rejeita prioridade inválida', () => {
    // @ts-expect-error propositalmente passando um valor fora do union
    expect(() => Card.create('Título válido', 'col-todo', 'urgente')).toThrow(InvalidPriorityError);
  });
});

describe('Card.restore', () => {
  it('reconstrói um cartão a partir de um snapshot já persistido', () => {
    const original = Card.create('Cartão original', 'col-todo', 'média', 'descrição');
    const restored = Card.restore(original.toSnapshot());

    expect(restored.toSnapshot()).toEqual(original.toSnapshot());
  });
});

describe('Card#changeColumn (Atividade 2)', () => {
  it('troca a coluna do cartão com sucesso', () => {
    const card = Card.create('Cartão', 'col-todo');
    card.changeColumn('col-doing');

    expect(card.columnId).toBe('col-doing');
  });

  it('rejeita columnId inválido ou vazio', () => {
    const card = Card.create('Cartão', 'col-todo');

    expect(() => card.changeColumn('   ')).toThrow(InvalidCardColumnError);
  });
});

describe('Card#rename e Card#changePriority (Atividade 3)', () => {
  it('renomeia e atualiza descrição com sucesso', () => {
    const card = Card.create('Título Antigo', 'col-todo', 'baixa', 'Desc antiga');
    card.rename('Novo Título', 'Nova descrição');

    expect(card.title).toBe('Novo Título');
    expect(card.description).toBe('Nova descrição');
  });

  it('renomeia mantendo a descrição quando não informada', () => {
    const card = Card.create('Título Antigo', 'col-todo', 'baixa', 'Desc antiga');
    card.rename('Novo Título Apenas');

    expect(card.title).toBe('Novo Título Apenas');
    expect(card.description).toBe('Desc antiga');
  });

  it('rejeita novo título inválido', () => {
    const card = Card.create('Título Antigo', 'col-todo');
    expect(() => card.rename('Oi')).toThrow(InvalidCardTitleError);
  });

  it('troca a prioridade com sucesso', () => {
    const card = Card.create('Título', 'col-todo', 'baixa');
    card.changePriority('alta');

    expect(card.priority).toBe('alta');
  });

  it('rejeita prioridade inválida ao trocar', () => {
    const card = Card.create('Título', 'col-todo');
    // @ts-expect-error propositalmente passando valor inválido
    expect(() => card.changePriority('urgente')).toThrow(InvalidPriorityError);
  });
});

describe('Card unit tests extras', () => {
  it('cobre validações de título inválido e troca de prioridade', () => {
    const card = Card.create('Titulo', 'col-1', 'baixa');

    // Renomear com valor vazio/espaços
    expect(() => card.rename('')).toThrow();
    expect(() => card.rename('   ')).toThrow();

    // Trocar prioridade
    card.changePriority('alta');
    expect(card.priority).toBe('alta');

    // Mudar para coluna vazia
    expect(() => card.changeColumn('')).toThrow();
  });
});