import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { buildTestRepositories } from '../../helpers/fixtures.js';
import { Card } from '../../../src/cards/Card.js';
import { Board } from '../../../src/boards/Board.js';
import { Column } from '../../../src/boards/Column.js';

describe('Rotas de cartões', () => {
  describe('POST /cards (Atividade 1 & 6)', () => {
    it('cria um cartão válido e redireciona para /', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const columnId = board.columns[0].id;

      const response = await request(app)
        .post('/cards')
        .send({
          title: 'Implementar Atividade 1',
          columnId,
          priority: 'alta',
          description: 'Criação de cartão funcionando',
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const cards = repos.cardRepository.findAll();
      const created = cards.find((c) => c.title === 'Implementar Atividade 1');
      expect(created).toBeDefined();
      expect(created?.columnId).toBe(columnId);
    });

    it('cria um cartão sem passar corpo (body vazio)', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app).post('/cards').send({});
      expect(response.status).toBe(404);
    });

    it('rejeita título com menos de 3 caracteres com 400', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);
      const board = repos.boardRepository.getDefault();
      const columnId = board.columns[0].id;

      const response = await request(app)
        .post('/cards')
        .send({ title: 'Oi', columnId });

      expect(response.status).toBe(400);
    });

    it('rejeita columnId de uma coluna que não existe com 404', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app)
        .post('/cards')
        .send({
          title: 'Cartão Inválido',
          columnId: 'coluna-inexistente',
        });

      expect(response.status).toBe(404);
    });

    it('impede título duplicado na mesma coluna com 409 (Atividade 6)', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const columnId = board.columns[0].id;

      const card = Card.create('Título Duplicado', columnId);
      repos.cardRepository.save(card);

      const response = await request(app)
        .post('/cards')
        .send({ title: 'Título Duplicado', columnId });

      expect(response.status).toBe(409);
    });

    it('permite o mesmo título em colunas diferentes (Atividade 6)', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const col1 = board.columns[0].id;
      const col2 = board.columns[1].id;

      const card = Card.create('Mesmo Título', col1);
      repos.cardRepository.save(card);

      const response = await request(app)
        .post('/cards')
        .send({ title: 'Mesmo Título', columnId: col2 });

      expect(response.status).toBe(302);
    });
  });

  describe('POST /cards/:id/move (Atividade 2 & 5)', () => {
    it('move o cartão para a coluna informada e redireciona para /', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const sourceCol = board.columns[0].id;
      const targetCol = board.columns[1].id;

      const card = Card.create('Cartão para mover', sourceCol);
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/move`)
        .send({ columnId: targetCol });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const updated = repos.cardRepository.findById(card.id);
      expect(updated?.columnId).toBe(targetCol);
    });

    it('responde 404 se o cartão não existe', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const targetCol = board.columns[0].id;

      const response = await request(app)
        .post('/cards/id-inexistente/move')
        .send({ columnId: targetCol });

      expect(response.status).toBe(404);
    });

    it('responde 404 se o columnId for enviado vazio', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const sourceCol = board.columns[0].id;

      const card = Card.create('Cartão Existente', sourceCol);
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/move`)
        .send({});

      expect(response.status).toBe(404);
    });

    it('responde 404 se a coluna destino não existe', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const sourceCol = board.columns[0].id;

      const card = Card.create('Cartão Existente', sourceCol);
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/move`)
        .send({ columnId: 'coluna-fantasma' });

      expect(response.status).toBe(404);
    });

    it('responde 409 se a coluna destino já atingiu o limite de WIP', async () => {
      const repos = buildTestRepositories();

      const col1 = new Column('col-1', 'A Fazer', 0, null);
      const colWip = new Column('col-wip', 'Em Andamento', 1, 1);
      const customBoard = new Board('b-custom', 'Quadro com WIP', [col1, colWip]);

      repos.boardRepository = {
        getDefault: () => customBoard,
      } as unknown as typeof repos.boardRepository;

      const app = createServer(repos);

      const cardExisting = Card.create('Cartão 1', 'col-wip');
      repos.cardRepository.save(cardExisting);

      const cardToMove = Card.create('Cartão 2', 'col-1');
      repos.cardRepository.save(cardToMove);

      const response = await request(app)
        .post(`/cards/${cardToMove.id}/move`)
        .send({ columnId: 'col-wip' });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /cards/:id/update (Atividade 3 & 6)', () => {
    it('edita título, descrição e prioridade e redireciona para /', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card = Card.create('Título Original', 'col-todo', 'baixa', 'Desc Original');
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/update`)
        .send({
          title: 'Título Editado',
          description: 'Nova Descrição',
          priority: 'alta',
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const updated = repos.cardRepository.findById(card.id);
      expect(updated?.title).toBe('Título Editado');
      expect(updated?.description).toBe('Nova Descrição');
      expect(updated?.priority).toBe('alta');
    });

    it('atualiza apenas a descrição preservando o título atual', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card = Card.create('Título Mantido', 'col-todo');
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/update`)
        .send({ description: 'Descrição Adicionada' });

      expect(response.status).toBe(302);

      const updated = repos.cardRepository.findById(card.id);
      expect(updated?.title).toBe('Título Mantido');
      expect(updated?.description).toBe('Descrição Adicionada');
    });

    it('responde 404 se o cartão a ser editado não existe', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app)
        .post('/cards/id-inexistente/update')
        .send({ title: 'Novo Título' });

      expect(response.status).toBe(404);
    });

    it('responde 400 se o novo título for inválido (menor que 3 caracteres)', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card = Card.create('Título Original', 'col-todo');
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/update`)
        .send({ title: 'Oi' });

      expect(response.status).toBe(400);
    });

    it('responde 400 se a nova prioridade for inválida', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card = Card.create('Título Original', 'col-todo');
      repos.cardRepository.save(card);

      const response = await request(app)
        .post(`/cards/${card.id}/update`)
        .send({ priority: 'invalida' });

      expect(response.status).toBe(400);
    });

    it('impede renomear para um título já existente na mesma coluna com 409 (Atividade 6)', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card1 = Card.create('Primeiro Cartão', 'col-todo');
      const card2 = Card.create('Segundo Cartão', 'col-todo');
      repos.cardRepository.save(card1);
      repos.cardRepository.save(card2);

      const response = await request(app)
        .post(`/cards/${card2.id}/update`)
        .send({ title: 'Primeiro Cartão' });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /cards/:id/delete (Atividade 4)', () => {
    it('remove o cartão com sucesso e redireciona para /', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const card = Card.create('Cartão para Deletar', 'col-todo');
      repos.cardRepository.save(card);

      const response = await request(app).post(`/cards/${card.id}/delete`);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const deleted = repos.cardRepository.findById(card.id);
      expect(deleted).toBeUndefined();
    });

    it('responde 404 se o cartão a ser excluído não existe', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app).post('/cards/id-inexistente/delete');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /cards/:id (Atividade 8 - Detalhe do Cartão)', () => {
    it('renderiza os detalhes do cartão com status 200', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const colId = board.columns[0].id;
      const colName = board.columns[0].name;

      const card = Card.create('Cartão com Detalhes', colId, 'alta', 'Descrição detalhada');
      repos.cardRepository.save(card);

      const response = await request(app).get(`/cards/${card.id}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Cartão com Detalhes');
      expect(response.text).toContain('Descrição detalhada');
      expect(response.text).toContain(colName);
      expect(response.text).toContain('alta');
    });

    it('responde 404 se o cartão pesquisado não existe', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app).get('/cards/id-inexistente');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /cards/search (Atividade 9 - Busca de Cartões)', () => {
    it('filtra cartões pelo título de forma case-insensitive e retorna 200', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const colId = board.columns[0].id;

      const card1 = Card.create('Documentar API Express', colId);
      const card2 = Card.create('Refatorar CSS', colId);
      repos.cardRepository.save(card1);
      repos.cardRepository.save(card2);

      const response = await request(app)
        .get('/cards/search')
        .query({ query: 'express' });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Documentar API Express');
      expect(response.text).not.toContain('Refatorar CSS');
    });

    it('retorna todos os cartões quando a query de busca for vazia ou omitida', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const board = repos.boardRepository.getDefault();
      const colId = board.columns[0].id;

      const card1 = Card.create('Cartão Alfa', colId);
      const card2 = Card.create('Cartão Beta', colId);
      repos.cardRepository.save(card1);
      repos.cardRepository.save(card2);

      const response = await request(app).get('/cards/search');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Cartão Alfa');
      expect(response.text).toContain('Cartão Beta');
    });
  });
});