export class InMemoryBoardRepository {
    constructor(initial) {
        this.boards = new Map();
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
    getDefault() {
        const board = this.boards.get(this.defaultBoardId);
        if (!board) {
            const first = Array.from(this.boards.values())[0];
            if (!first)
                throw new Error('Nenhum quadro cadastrado');
            return first;
        }
        return board;
    }
    findById(id) {
        return this.boards.get(id);
    }
    findAll() {
        return Array.from(this.boards.values());
    }
    save(board) {
        this.boards.set(board.id, board);
        if (!this.boards.has(this.defaultBoardId)) {
            this.defaultBoardId = board.id;
        }
    }
}
