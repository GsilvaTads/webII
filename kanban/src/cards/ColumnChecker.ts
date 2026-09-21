export interface ColumnInfo {
  id: string;
  name: string;
  wipLimit: number | null;
}

export interface ColumnChecker {
  hasColumn(columnId: string): boolean;
  getColumnInfo(columnId: string): ColumnInfo | undefined;
}