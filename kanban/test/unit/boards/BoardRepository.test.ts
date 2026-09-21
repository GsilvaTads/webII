import { describe, it, expect } from 'vitest';
import { InMemoryBoardRepository } from '../../../src/boards/BoardRepository.js';
import { Board } from '../../../src/boards/Board.js';

describe('BoardRepository unit tests extras', () => {
  it('lança erro ao chamar getDefault em repositório vazio', () => {
    const repo = new InMemoryBoardRepository([]);
    expect(() => repo.getDefault()).toThrow();
  });

  it('retorna o primeiro quadro quando defaultBoardId ficou inválido', () => {
    const b1 = Board.create('b-1', 'Inicial', []);
    const b2 = Board.create('b-2', 'Outro', []);
    const repo = new InMemoryBoardRepository([b1, b2]);
    (repo as any).defaultBoardId = 'inexistente';

    expect(repo.getDefault()).toBe(b1);
  });

  it('retorna undefined ao buscar por id inexistente em findById', () => {
    const repo = new InMemoryBoardRepository([]);
    expect(repo.findById('inexistente')).toBeUndefined();
  });

  it('lista todos os quadros salvos', () => {
    const b1 = Board.create('b-1', 'Inicial', []);
    const b2 = Board.create('b-2', 'Outro', []);
    const repo = new InMemoryBoardRepository([b1]);

    repo.save(b2);

    expect(repo.findAll()).toHaveLength(2);
  });

  it('atualiza quadro existente no save', () => {
    const b1 = Board.create('b-1', 'Inicial', []);
    const repo = new InMemoryBoardRepository(b1);

    const bAtualizado = Board.create('b-1', 'Atualizado', []);
    repo.save(bAtualizado);

    expect(repo.findById('b-1')?.name).toBe('Atualizado');
  });

  it('define um default quando o repositório começa vazio e recebe o primeiro save', () => {
    const repo = new InMemoryBoardRepository();
    const board = Board.create('b-9', 'Primeiro', []);

    repo.save(board);

    expect(repo.getDefault()).toBe(board);
  });
});