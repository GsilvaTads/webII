import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';
import { InMemoryBoardRepository } from '../../../src/boards/BoardRepository.js';
import { InMemoryCardRepository } from '../../../src/cards/CardRepository.js';

describe('Atividade 11 - Suporte a múltiplos quadros', () => {
  it('permite carregar um quadro específico via GET /boards/:boardId', async () => {
    const col1 = Column.create('c-1', 'Backlog', 1);
    const boardA = Board.create('b-alfa', 'Quadro Alfa', [col1]);
    const boardB = Board.create('b-beta', 'Quadro Beta', []);

    const boardRepo = new InMemoryBoardRepository([boardA, boardB]);
    const cardRepo = new InMemoryCardRepository();
    const app = createServer({ boardRepository: boardRepo, cardRepository: cardRepo });

    const resAlfa = await request(app).get('/boards/b-alfa');
    expect(resAlfa.status).toBe(200);
    expect(resAlfa.text).toContain('Quadro Alfa');

    const resBeta = await request(app).get('/boards/b-beta');
    expect(resBeta.status).toBe(200);
    expect(resBeta.text).toContain('Quadro Beta');
  });

  it('retorna 404 ao acessar GET /boards/:boardId com id inexistente', async () => {
    const boardRepo = new InMemoryBoardRepository([Board.create('b-1', 'Quadro 1')]);
    const cardRepo = new InMemoryCardRepository();
    const app = createServer({ boardRepository: boardRepo, cardRepository: cardRepo });

    const response = await request(app).get('/boards/quadro-inexistente');
    expect(response.status).toBe(404);
  });

  it('permite adicionar coluna em quadro específico via POST /boards/:boardId/columns', async () => {
    const boardA = Board.create('b-alfa', 'Quadro Alfa');
    const boardRepo = new InMemoryBoardRepository([boardA]);
    const cardRepo = new InMemoryCardRepository();
    const app = createServer({ boardRepository: boardRepo, cardRepository: cardRepo });

    const response = await request(app)
      .post('/boards/b-alfa/columns')
      .send({ name: 'Nova Coluna Alfa' });

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/boards/b-alfa');

    const board = boardRepo.findById('b-alfa');
    expect(board?.columns.some((c) => c.name === 'Nova Coluna Alfa')).toBe(true);
  });
});