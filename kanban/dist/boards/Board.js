import { randomUUID } from 'node:crypto';
import { Column } from './Column.js';
import { InvalidColumnNameError } from './errors.js';
export class Board {
    constructor(id, name, columns = []) {
        this._id = id;
        this._name = name;
        this._columns = [...columns].sort((a, b) => a.order - b.order);
    }
    static create(id, name, columns = []) {
        return new Board(id, name, columns);
    }
    static restore(snapshot) {
        const columns = snapshot.columns.map((colSnapshot) => Column.restore(colSnapshot));
        return new Board(snapshot.id, snapshot.name, columns);
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get columns() {
        return this._columns;
    }
    hasColumn(columnId) {
        return this._columns.some((c) => c.id === columnId);
    }
    findColumn(columnId) {
        return this._columns.find((c) => c.id === columnId);
    }
    /**
     * Atividade 7: adiciona uma nova coluna ao quadro.
     */
    addColumn(name, wipLimit = null) {
        if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
            throw new InvalidColumnNameError(name ?? '');
        }
        const nextOrder = this._columns.length + 1;
        const newId = `col-${randomUUID()}`;
        const column = Column.create(newId, name.trim(), nextOrder, wipLimit);
        this._columns.push(column);
        return column;
    }
    toSnapshot() {
        return {
            id: this._id,
            name: this._name,
            columns: this._columns.map((c) => c.toSnapshot()),
        };
    }
}
