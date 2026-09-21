import { describe, it, expect } from 'vitest';
import { CardController } from '../../../src/cards/CardController.js';
import { InMemoryCardRepository } from '../../../src/cards/CardRepository.js';
import { BoardColumnChecker } from '../../../src/boards/BoardColumnChecker.js';
import { InMemoryBoardRepository } from '../../../src/boards/BoardRepository.js';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';
import { Card } from '../../../src/cards/Card.js';

describe('CardController branches e fallbacks', () => {
  function makeSut() {
    const col1 = Column.create('col-1', 'A Fazer', 1);
    const col2 = Column.create('col-2', 'Feito', 2);
    const defaultBoard = Board.create('b-1', 'Quadro Padrão', [col1, col2]);
    const boardRepo = new InMemoryBoardRepository(defaultBoard);
    const cardRepo = new InMemoryCardRepository();
    const checker = new BoardColumnChecker(boardRepo);
    const controller = new CardController(cardRepo, checker);
    return { controller, cardRepo, boardRepo, defaultBoard };
  }

  it('lida com body nulo/undefined nas ações', () => {
    const { controller } = makeSut();
    expect(() => controller.create(undefined)).toThrow();
    expect(() => controller.move('id', undefined)).toThrow();
  });

  it('redireciona para returnUrl customizado se fornecido', () => {
    const { controller, cardRepo, defaultBoard } = makeSut();
    const colId = defaultBoard.columns[0].id;

    const resCreate = controller.create({
      title: 'Cartao Teste',
      columnId: colId,
      returnUrl: '/boards/board-2',
    });
    expect(resCreate.status).toBe(302);
    expect(resCreate.redirectTo).toBe('/boards/board-2');

    const card = cardRepo.findByColumn(colId)[0];
    const targetCol = defaultBoard.columns[1].id;
    const resMove = controller.move(card.id, { columnId: targetCol, returnUrl: '/boards/board-2' });
    expect(resMove.status).toBe(302);
    expect(resMove.redirectTo).toBe('/boards/board-2');

    const resUpdate = controller.update(card.id, { title: 'Novo Titulo', returnUrl: '/boards/board-2' });
    expect(resUpdate.status).toBe(302);
    expect(resUpdate.redirectTo).toBe('/boards/board-2');

    const resRemove = controller.remove(card.id, { returnUrl: '/boards/board-2' });
    expect(resRemove.status).toBe(302);
    expect(resRemove.redirectTo).toBe('/boards/board-2');
  });

  it('cobre branches de busca com query vazia e com valor', () => {
    const { controller, cardRepo, defaultBoard } = makeSut();
    cardRepo.save(Card.create('Aprender Vitest', defaultBoard.columns[0].id, 'alta'));

    const resVazio = controller.search({});
    expect(resVazio.status).toBe(200);

    const resUndef = controller.search(undefined);
    expect(resUndef.status).toBe(200);

    const resComTermo = controller.search({ query: 'Vitest' });
    expect(resComTermo.status).toBe(200);
  });

  it('cobre branches dos erros e dos caminhos alternativos do controller', () => {
    const { controller, cardRepo, defaultBoard } = makeSut();
    const colId = defaultBoard.columns[0].id;

    expect(() => controller.create({ title: 'A', columnId: colId })).toThrow();
    expect(() => controller.create({ columnId: colId })).toThrow();
    expect(() => controller.create({ title: 'Cartão Duplicado', columnId: 'missing-col' })).toThrow();

    const created = controller.create({ title: 'Cartão Duplicado', columnId: colId, priority: 'média' });
    expect(created.status).toBe(302);

    const invalidPriority = controller.create({
      title: 'Cartão Prioridade Inválida',
      columnId: colId,
      priority: 'urgente' as any,
    });
    expect(invalidPriority.status).toBe(302);

    expect(() => controller.create({ title: 'Cartão Duplicado', columnId: colId })).toThrow();

    const card = cardRepo.findByColumn(colId)[0];
    expect(() => controller.move('missing-id', { columnId: colId })).toThrow();
    expect(() => controller.move(card.id, { columnId: 'missing-col' })).toThrow();

    const boardWip = Board.create('b-2', 'Quadro WIP', [
      Column.create('c-1', 'A Fazer', 1, 1),
      Column.create('c-2', 'Feito', 2, 1),
    ]);
    const repoWip = new InMemoryBoardRepository(boardWip);
    const checkerWip = new BoardColumnChecker(repoWip);
    const wipController = new CardController(cardRepo, checkerWip);
    cardRepo.save(Card.create('Outra carta na meta', 'c-2', 'baixa'));

    expect(() => wipController.move(card.id, { columnId: 'c-2' })).toThrow();

    expect(controller.update(card.id, { title: 'Novo Título', priority: 'baixa' }).status).toBe(302);
    expect(controller.update(card.id, { description: 'Descrição nova' }).status).toBe(302);
    expect(controller.update(card.id, undefined).status).toBe(302);
    expect(() => controller.remove('missing-id')).toThrow();

    const cardSemColuna = Card.create('Sem coluna', 'col-inexistente', 'baixa');
    cardRepo.save(cardSemColuna);

    const detail = controller.showDetail(card.id);
    expect(detail.status).toBe(200);
    expect(detail.locals.card).toBeDefined();

    const detailSemColuna = controller.showDetail(cardSemColuna.id);
    expect(detailSemColuna.locals.card.columnName).toBe('Coluna Desconhecida');
    expect(() => controller.showDetail('missing-id')).toThrow();

    const resSearch = controller.search({ query: 'novo' });
    const resSearchSemColuna = controller.search({ query: 'Sem' });
    expect(resSearch.status).toBe(200);
    expect(resSearchSemColuna.status).toBe(200);
  });
});