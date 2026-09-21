import { describe, it, expect } from 'vitest';
import { BoardController } from '../../../src/boards/BoardController.js';
import { InMemoryBoardRepository } from '../../../src/boards/BoardRepository.js';
import { InMemoryCardRepository } from '../../../src/cards/CardRepository.js';
import { BoardNotFoundError } from '../../../src/boards/errors.js';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';

describe('BoardController branches não cobertas', () => {
  it('lança BoardNotFoundError ao acessar showBoard com ID inexistente', () => {
    const repo = new InMemoryBoardRepository([]);
    const controller = new BoardController(repo, new InMemoryCardRepository());

    expect(() => controller.showBoard('id-fantasma')).toThrow(BoardNotFoundError);
  });

  it('lança BoardNotFoundError ao criar coluna em quadro inexistente', () => {
    const repo = new InMemoryBoardRepository([]);
    const controller = new BoardController(repo, new InMemoryCardRepository());

    expect(() => controller.createColumn({ name: 'Nova' }, 'id-fantasma')).toThrow(BoardNotFoundError);
  });

  it('cobre os branches de body e name ausentes em createColumn e showBoard', () => {
    const board = Board.create('b-1', 'Quadro', [Column.create('c-1', 'Col', 1)]);
    const repo = new InMemoryBoardRepository(board);
    const controller = new BoardController(repo, new InMemoryCardRepository());

    expect(() => controller.createColumn(undefined)).toThrow();
    expect(() => controller.createColumn({})).toThrow();

    const repoSemPadrao = {
      getDefault: () => undefined,
      findById: () => undefined,
      findAll: () => [],
    } as any;
    const controllerSemPadrao = new BoardController(repoSemPadrao, new InMemoryCardRepository());
    expect(() => controllerSemPadrao.createColumn(undefined)).toThrow(BoardNotFoundError);
    expect(() => controllerSemPadrao.showBoard()).toThrow(BoardNotFoundError);
  });

  it('cria coluna com wipLimit nulo/indefinido', () => {
    const board = Board.create('b-1', 'Quadro', [Column.create('c-1', 'Col', 1)]);
    const repo = new InMemoryBoardRepository(board);
    const controller = new BoardController(repo, new InMemoryCardRepository());

    const result = controller.createColumn({ name: 'Coluna Sem WIP', wipLimit: '' });
    const resultNull = controller.createColumn({ name: 'Coluna Nula', wipLimit: null });
    const resultUndefined = controller.createColumn({ name: 'Coluna Indefinida' });
    const resultNumber = controller.createColumn({ name: 'Coluna Com WIP', wipLimit: 4 });

    expect(result.status).toBe(302);
    expect(resultNull.status).toBe(302);
    expect(resultUndefined.status).toBe(302);
    expect(resultNumber.status).toBe(302);
  });

  it('mostra o board com cards em múltiplas prioridades e WIP excedido', () => {
    const col1 = Column.create('c-1', 'A Fazer', 1, 1);
    const col2 = Column.create('c-2', 'Feito', 2);
    const board = Board.create('b-1', 'Quadro', [col1, col2]);
    const repo = new InMemoryBoardRepository(board);
    const cardRepo = new InMemoryCardRepository();

    cardRepo.save({
      id: 'card-1',
      title: 'Alta',
      description: 'desc',
      priority: 'alta',
      columnId: col1.id,
      createdAt: new Date().toISOString(),
    } as any);
    cardRepo.save({
      id: 'card-2',
      title: 'Media',
      description: 'desc',
      priority: 'média',
      columnId: col1.id,
      createdAt: new Date().toISOString(),
    } as any);
    cardRepo.save({
      id: 'card-3',
      title: 'Baixa',
      description: 'desc',
      priority: 'baixa',
      columnId: col2.id,
      createdAt: new Date().toISOString(),
    } as any);

    const controller = new BoardController(repo, cardRepo);
    const result = controller.showBoard('b-1');

    expect(result.status).toBe(200);
    expect(result.locals.board.columns[0].isOverWipLimit).toBe(true);
    expect(result.locals.board.columns[0].cards[0].priorityBadgeClass).toContain('red');
    expect(result.locals.board.columns[0].cards[1].priorityBadgeClass).toContain('amber');
    expect(result.locals.board.columns[1].cards[0].priorityBadgeClass).toContain('emerald');
  });

  it('mostra o quadro padrão quando nenhum boardId é informado', () => {
    const board = Board.create('b-1', 'Quadro', [Column.create('c-1', 'Col', 1)]);
    const repo = new InMemoryBoardRepository(board);
    const controller = new BoardController(repo, new InMemoryCardRepository());

    const result = controller.show();

    expect(result.status).toBe(200);
    expect(result.locals.board.id).toBe('b-1');
  });

  it('ignora save do repositório quando ele não existe', () => {
    const board = Board.create('b-1', 'Quadro', [Column.create('c-1', 'Col', 1)]);
    const repo = {
      getDefault: () => board,
      findById: (id: string) => (id === 'b-1' ? board : undefined),
      findAll: () => [board],
      save: undefined,
    } as any;
    const controller = new BoardController(repo, new InMemoryCardRepository());

    const result = controller.createColumn({ name: 'Sem Save', wipLimit: 4 });
    expect(result.status).toBe(302);
    expect(result.redirectTo).toBe('/');
  });
});