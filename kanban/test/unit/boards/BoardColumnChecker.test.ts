import { describe, expect, it } from 'vitest';
import { BoardColumnChecker } from '../../../src/boards/BoardColumnChecker.js';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';
import type { BoardRepository } from '../../../src/boards/BoardRepository.js';

describe('BoardColumnChecker', () => {
  it('identifica coluna existente e inexistente com hasColumn', () => {
    const col = Column.create('col-1', 'A Fazer', 1);
    const board = Board.create('b-1', 'Quadro', [col]);
    const mockRepo = { getDefault: () => board } as BoardRepository;

    const checker = new BoardColumnChecker(mockRepo);

    expect(checker.hasColumn('col-1')).toBe(true);
    expect(checker.hasColumn('col-fantasma')).toBe(false);
  });

  it('recupera dados da coluna com getColumnInfo ou undefined se inexistente', () => {
    const col = Column.create('col-1', 'A Fazer', 1, 3);
    const board = Board.create('b-1', 'Quadro', [col]);
    const mockRepo = { getDefault: () => board } as BoardRepository;

    const checker = new BoardColumnChecker(mockRepo);

    const info = checker.getColumnInfo('col-1');
    expect(info).toEqual({
      id: 'col-1',
      name: 'A Fazer',
      wipLimit: 3,
    });

    expect(checker.getColumnInfo('col-fantasma')).toBeUndefined();
  });
});