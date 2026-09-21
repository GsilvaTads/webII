import type { ColumnChecker, ColumnInfo } from '../cards/ColumnChecker.js';
import type { BoardRepository } from './BoardRepository.js';

export class BoardColumnChecker implements ColumnChecker {
  constructor(private readonly boardRepository: BoardRepository) {}

  hasColumn(columnId: string): boolean {
    const board = this.boardRepository.getDefault();
    return board.hasColumn(columnId);
  }

  getColumnInfo(columnId: string): ColumnInfo | undefined {
    const board = this.boardRepository.getDefault();
    const column = board.findColumn(columnId);
    if (!column) return undefined;

    return {
      id: column.id,
      name: column.name,
      wipLimit: column.wipLimit,
    };
  }
}