import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { buildTestRepositories } from '../../helpers/fixtures.js';

describe('Rotas de quadro', () => {
  describe('GET /', () => {
    it('renderiza o quadro padrão com status 200', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Quadro de Teste');
    });
  });

  describe('POST /columns (Atividade 7)', () => {
    it('cria uma nova coluna e redireciona para /', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app)
        .post('/columns')
        .send({
          name: 'Homologação',
          wipLimit: 4,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const board = repos.boardRepository.getDefault();
      const createdCol = board.columns.find((col) => col.name === 'Homologação');
      expect(createdCol).toBeDefined();
      expect(createdCol?.wipLimit).toBe(4);
    });

    it('rejeita criação com nome de coluna vazio ou curto com 400', async () => {
      const repos = buildTestRepositories();
      const app = createServer(repos);

      const response = await request(app)
        .post('/columns')
        .send({
          name: 'Oi',
        });

      expect(response.status).toBe(400);
    });
  });
});