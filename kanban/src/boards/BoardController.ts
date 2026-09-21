import type { BoardRepository } from './BoardRepository.js';
import type { CardRepository } from '../cards/CardRepository.js';
import { type ControllerResult, redirect } from '../shared/http.js';
import { BoardNotFoundError } from './errors.js';

interface CreateColumnBody {
  name?: string;
  wipLimit?: string | number | null;
}

export class BoardController {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly cardRepository: CardRepository,
  ) {}

  showBoard(boardId?: string): ControllerResult {
    let board = boardId ? this.boardRepository.findById(boardId) : this.boardRepository.getDefault();

    if (!board) {
      throw new BoardNotFoundError(boardId ?? '');
    }

    const allBoards = this.boardRepository.findAll();
    const cards = this.cardRepository.findAll();

    const columnsView = board.columns.map((col) => {
      const colCards = cards
        .filter((card) => card.columnId === col.id)
        .map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          priority: card.priority,
          priorityBadgeClass:
            card.priority === 'alta'
              ? 'bg-red-100 text-red-700'
              : card.priority === 'média'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700',
        }));

      const isOverWipLimit =
        col.wipLimit !== null && colCards.length > col.wipLimit;

      return {
        id: col.id,
        name: col.name,
        order: col.order,
        wipLimit: col.wipLimit,
        isOverWipLimit,
        cards: colCards,
      };
    });

    return {
      status: 200,
      view: 'board/index',
      locals: {
        allBoards: allBoards.map((b) => ({ id: b.id, name: b.name })),
        board: {
          id: board.id,
          name: board.name,
          columns: columnsView,
        },
      },
    };
  }

  show(): ControllerResult {
    return this.showBoard();
  }

  createColumn(body: unknown, boardId?: string): ControllerResult {
    const { name, wipLimit } = (body ?? {}) as CreateColumnBody;

    const board = boardId
      ? this.boardRepository.findById(boardId)
      : this.boardRepository.getDefault();

    if (!board) {
      throw new BoardNotFoundError(boardId ?? '');
    }

    let parsedWipLimit: number | null = null;
    if (wipLimit !== undefined && wipLimit !== null && String(wipLimit).trim() !== '') {
      parsedWipLimit = Number(wipLimit);
    }

    board.addColumn(name ?? '', parsedWipLimit);

    if (typeof (this.boardRepository as { save?: (b: typeof board) => void }).save === 'function') {
      (this.boardRepository as { save: (b: typeof board) => void }).save(board);
    }

    return redirect(boardId ? `/boards/${boardId}` : '/');
  }
}