import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';
import { InvalidColumnNameError } from '../../../src/boards/errors.js';

describe('Board', () => {
  it('instancia um quadro e mantém colunas ordenadas por order', () => {
    const col2 = Column.create('col-2', 'Em Andamento', 2);
    const col1 = Column.create('col-1', 'A Fazer', 1);
    const board = Board.create('b-1', 'Quadro', [col2, col1]);

    expect(board.columns[0].id).toBe('col-1');
    expect(board.columns[1].id).toBe('col-2');
  });

  it('verifica se possui uma coluna com hasColumn', () => {
    const col1 = Column.create('col-1', 'A Fazer', 1);
    const board = Board.create('b-1', 'Quadro', [col1]);

    expect(board.hasColumn('col-1')).toBe(true);
    expect(board.hasColumn('col-fantasma')).toBe(false);
  });

  it('encontra uma coluna com findColumn', () => {
    const col1 = Column.create('col-1', 'A Fazer', 1);
    const board = Board.create('b-1', 'Quadro', [col1]);

    expect(board.findColumn('col-1')).toBe(col1);
    expect(board.findColumn('col-fantasma')).toBeUndefined();
  });

  describe('Board#addColumn (Atividade 7)', () => {
    it('adiciona uma nova coluna com ID único, ordem sequencial e sem limite de WIP', () => {
      const board = Board.create('b-1', 'Quadro');
      const col = board.addColumn('Nova Coluna');

      expect(board.columns.length).toBe(1);
      expect(col.name).toBe('Nova Coluna');
      expect(col.order).toBe(1);
      expect(col.wipLimit).toBeNull();
      expect(col.id.startsWith('col-')).toBe(true);
    });

    it('incrementa a ordem sequencial ao adicionar múltiplas colunas', () => {
      const col1 = Column.create('col-1', 'Primeira', 1);
      const board = Board.create('b-1', 'Quadro', [col1]);

      const col2 = board.addColumn('Segunda', 3);

      expect(board.columns.length).toBe(2);
      expect(col2.order).toBe(2);
      expect(col2.wipLimit).toBe(3);
    });

    it('rejeita nome de coluna inválido com InvalidColumnNameError', () => {
      const board = Board.create('b-1', 'Quadro');

      expect(() => board.addColumn('')).toThrow(InvalidColumnNameError);
      expect(() => board.addColumn('ab')).toThrow(InvalidColumnNameError);
      expect(() => board.addColumn(null as any)).toThrow(InvalidColumnNameError);
      expect(() => board.addColumn(123 as any)).toThrow(InvalidColumnNameError);
    });
  });

  describe('Board unit tests - branches e coberturas extras', () => {
    it('restaura um quadro a partir do snapshot', () => {
      const snapshot = {
        id: 'b-2',
        name: 'Quadro Restaurado',
        columns: [
          { id: 'c-1', name: 'A Fazer', order: 1, wipLimit: null },
          { id: 'c-2', name: 'Feito', order: 2, wipLimit: 3 },
        ],
      };

      const board = Board.restore(snapshot);

      expect(board.id).toBe('b-2');
      expect(board.name).toBe('Quadro Restaurado');
      expect(board.columns.map((c) => c.name)).toEqual(['A Fazer', 'Feito']);
    });

    it('retorna undefined ao buscar coluna inexistente com findColumn', () => {
      const board = Board.create('b-1', 'Board', [Column.create('c-1', 'Col', 1)]);
      expect(board.findColumn('nao-existe')).toBeUndefined();
    });

    it('hasColumn retorna false para coluna inexistente', () => {
      const board = Board.create('b-1', 'Board', []);
      expect(board.hasColumn('fantasma')).toBe(false);
    });
  });
});