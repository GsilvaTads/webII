import { randomUUID } from 'node:crypto';
import { Column, type ColumnSnapshot } from './Column.js';
import { InvalidColumnNameError } from './errors.js';

export interface BoardSnapshot {
  id: string;
  name: string;
  columns: ColumnSnapshot[];
}

export class Board {
  private readonly _id: string;
  private _name: string;
  private readonly _columns: Column[];

  constructor(id: string, name: string, columns: Column[] = []) {
    this._id = id;
    this._name = name;
    this._columns = [...columns].sort((a, b) => a.order - b.order);
  }

  static create(id: string, name: string, columns: Column[] = []): Board {
    return new Board(id, name, columns);
  }

  static restore(snapshot: BoardSnapshot): Board {
    const columns = snapshot.columns.map((colSnapshot) => Column.restore(colSnapshot));
    return new Board(snapshot.id, snapshot.name, columns);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get columns(): readonly Column[] {
    return this._columns;
  }

  hasColumn(columnId: string): boolean {
    return this._columns.some((c) => c.id === columnId);
  }

  findColumn(columnId: string): Column | undefined {
    return this._columns.find((c) => c.id === columnId);
  }

  /**
   * Atividade 7: adiciona uma nova coluna ao quadro.
   */
  addColumn(name: string, wipLimit: number | null = null): Column {
    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
      throw new InvalidColumnNameError(name ?? '');
    }

    const nextOrder = this._columns.length + 1;
    const newId = `col-${randomUUID()}`;
    const column = Column.create(newId, name.trim(), nextOrder, wipLimit);
    this._columns.push(column);
    return column;
  }

  toSnapshot(): BoardSnapshot {
    return {
      id: this._id,
      name: this._name,
      columns: this._columns.map((c) => c.toSnapshot()),
    };
  }
}