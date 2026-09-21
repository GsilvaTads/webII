export class BoardColumnChecker {
    constructor(boardRepository) {
        this.boardRepository = boardRepository;
    }
    hasColumn(columnId) {
        const board = this.boardRepository.getDefault();
        return board.hasColumn(columnId);
    }
    getColumnInfo(columnId) {
        const board = this.boardRepository.getDefault();
        const column = board.findColumn(columnId);
        if (!column)
            return undefined;
        return {
            id: column.id,
            name: column.name,
            wipLimit: column.wipLimit,
        };
    }
}
