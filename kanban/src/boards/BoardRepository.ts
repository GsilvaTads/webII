import type { Board } from './Board.js';

/**
 * MODEL (persistência) — "banco em memória" do quadro. Só existe um quadro
 * por instância do repositório; suportar múltiplos quadros (Atividade 10)
 * exigiria trocar `getDefault()` por algo como `findById(id)`/`findAll()`.
 */

export interface BoardRepository {
  getDefault(): Board;
  findById(id: string): Board | undefined;
  findAll(): Board[];
  save(board: Board): void;
}

export class InMemoryBoardRepository implements BoardRepository {
  private boards: Map<string, Board> = new Map();
  private defaultBoardId: string;

  constructor(initial?: Board | Board[]) {
    const list = Array.isArray(initial)
      ? initial
      : initial
        ? [initial]
        : [];

    for (const b of list) {
      this.boards.set(b.id, b);
    }
    this.defaultBoardId = list[0]?.id ?? 'board-1';
  }

  getDefault(): Board {
    const board = this.boards.get(this.defaultBoardId);
    if (!board) {
      const first = Array.from(this.boards.values())[0];
      if (!first) throw new Error('Nenhum quadro cadastrado');
      return first;
    }
    return board;
  }

  findById(id: string): Board | undefined {
    return this.boards.get(id);
  }

  findAll(): Board[] {
    return Array.from(this.boards.values());
  }

  save(board: Board): void {
    this.boards.set(board.id, board);
    if (!this.boards.has(this.defaultBoardId)) {
      this.defaultBoardId = board.id;
    }
  }
}