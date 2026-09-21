import { describe, it, expect } from 'vitest';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';
import { Card } from '../../../src/cards/Card.js';
import { toBoardViewModel } from '../../../src/boards/boardView.js';

describe('boardView unit tests', () => {
  it('transforma entidade Board e lista de Cards em ViewModel com propriedades calculadas', () => {
    const colTodo = Column.create('col-1', 'A Fazer', 1);
    const colDoing = Column.create('col-2', 'Em Andamento', 2, 1);
    const board = Board.create('b-1', 'Quadro 1', [colTodo, colDoing]);

    const card1 = Card.create('Card 1', 'col-1', 'alta', 'Desc 1');
    const card2 = Card.create('Card 2', 'col-2', 'média');
    const card3 = Card.create('Card 3', 'col-2', 'baixa'); // Estoura WIP (2/1)

    const vm = toBoardViewModel(board, [card1, card2, card3]);

    expect(vm.id).toBe('b-1');
    expect(vm.name).toBe('Quadro 1');
    expect(vm.columns).toHaveLength(2);

    // Coluna 1
    expect(vm.columns[0].id).toBe('col-1');
    expect(vm.columns[0].cards).toHaveLength(1);
    expect(vm.columns[0].cards[0].priorityBadgeClass).toBe('bg-red-100 text-red-700');
    expect(vm.columns[0].isOverWipLimit).toBe(false);

    // Coluna 2 (com limite estourado)
    expect(vm.columns[1].id).toBe('col-2');
    expect(vm.columns[1].cards).toHaveLength(2);
    expect(vm.columns[1].isOverWipLimit).toBe(true);
  });
});