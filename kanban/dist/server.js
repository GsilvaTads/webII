import express from 'express';
import ejs from 'ejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BoardController } from './boards/BoardController.js';
import { CardController } from './cards/CardController.js';
import { BoardColumnChecker } from './boards/BoardColumnChecker.js';
import { createRoutes } from './routes.js';
import { errorHandler } from './shared/errorHandler.js';
import { createSeededRepositories } from './seed.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function createServer(repositories = createSeededRepositories()) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    const columnChecker = new BoardColumnChecker(repositories.boardRepository);
    const boardController = new BoardController(repositories.boardRepository, repositories.cardRepository);
    const cardController = new CardController(repositories.cardRepository, columnChecker);
    app.use(createRoutes(boardController, cardController));
    app.use(errorHandler);
    return app;
}
