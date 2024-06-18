import axios from 'axios';

/**
 * Schnittstelle für den Spaltenwert
 */
interface ColumnValue {
  column: {
    title: string;
  };
  type: string;
  value: string;
}

/**
 * Schnittstelle für einen Artikel (Item)
 */
interface Item {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

/**
 * Schnittstelle für eine Gruppe
 */
interface Group {
  title: string;
  items_page: {
    cursor: string | null;
    items: Item[];
  };
}

/**
 * Schnittstelle für die Borddaten
 */
interface BoardData {
  data: {
    boards: {
      name: string;
      groups: Group[];
    }[]
  };
}

/**
 * Serviceklasse für die Kommunikation mit der Monday.com API
 */
export class MondayService {
  private apiUrl: string;
  private apiKey: string;

  /**
   * Konstruktor zum Initialisieren der API-URL und des API-Schlüssels
   * @param apiUrl Die Basis-URL der Monday.com API
   * @param apiKey Der API-Schlüssel für die Authentifizierung
   */
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Führt eine GraphQL-Abfrage an die Monday.com API aus
   * @param query Die GraphQL-Abfrage als Zeichenkette
   * @returns Das Ergebnis der Abfrage als Promise
   */
  async fetchData(query: string): Promise<any> {
    const response = await axios.post(this.apiUrl, { query }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
      },
    });
    return response.data;
  }
}

/**
 * Klasse zur Extraktion von Borddaten
 */
export class BoardExtractor {
  private mondayService: MondayService;
  private boardId: string;
  private boardData: any[] = [];

  /**
   * Konstruktor zum Initialisieren des MondayService und der Board-ID
   * @param mondayService Eine Instanz des MondayService
   * @param boardId Die ID des zu extrahierenden Boards
   */
  constructor(mondayService: MondayService, boardId: string) {
    this.mondayService = mondayService;
    this.boardId = boardId;
  }

  /**
   * Extrahiert die Gruppen und Artikel (Items) des Boards
   */
  async getGroups(): Promise<any[]> {
    const query = `{
      boards(ids: [${this.boardId}]) {
        name
        groups {
          title
          items_page {
            cursor
            items {
              id
              name
              column_values {
                column {
                  title
                }
                type
                value
              }
            }
          }
        }
      }
    }`;

    const data: BoardData = await this.mondayService.fetchData(query);
    const groups = data.data.boards[0].groups;

    for (const group of groups) {
      const groupName = group.title;
      const cursor = group.items_page.cursor;

      this.extractItems(group.items_page.items, groupName);

      if (cursor) await this.getPagedItems(cursor, groupName);
    }

    return this.boardData;

  }

  /**
   * Extrahiert die Artikel (Items) und fügt sie der Board-Datenstruktur hinzu
   * @param rows Die zu extrahierenden Artikel (Items)
   * @param groupName Der Name der Gruppe, zu der die Artikel gehören
   */
  private extractItems(rows: Item[], groupName: string): void {
    const tmp: any[] = [];
    rows.forEach((row) => {
      const colData = row.column_values.map((col) => {
        return { column: col.column.title, type: col.type, value: col.value };
      });
      const col = { id: row.id, name: row.name, group: groupName, ...this.parseColumns(colData) };

      tmp.push(col);
    });

    this.boardData = this.boardData.concat(tmp);
  }

  /**
   * Parsen der Spaltenwerte eines Artikels
   * @param columns Die Spaltenwerte des Artikels
   * @returns Ein Objekt mit den geparsten Spaltenwerten
   */
  private parseColumns(columns: any[]): any {
    const tmp: any = {};

    columns.forEach((column) => {
      const t = JSON.parse(column.value);
      if (column.type === 'board_relation') {
        if (t && t.linkedPulseIds) {
          tmp[column.column] = t.linkedPulseIds.map((x: any) => x.linkedPulseId).join(';');
        }
      } else if (column.type === 'phone') {
        if (t && t.phone) {
          tmp[column.column] = t.phone;
        }
      } else if (column.type === 'email') {
        if (t && t.email) {
          tmp[column.column] = t.email;
        }
      } else if (column.type === 'creation_log') {
        if (t && t.created_at) {
          tmp[column.column] = t.created_at;
        }
      } else if (column.type === 'status') {
        if (t && t.index) {
          tmp[column.column] = t.index;
        }
      } else {
        tmp[column.column] = t;
      }
      tmp.type = column.type;
    });

    return tmp;
  }

  /**
   * Holt die nächsten Seiten der Artikel (Items) einer Gruppe
   * @param cursor Der Cursor für die nächste Seite
   * @param groupName Der Name der Gruppe, zu der die Artikel gehören
   */
  private async getPagedItems(cursor: string, groupName: string): Promise<void> {
    const query = `{    
      next_items_page(cursor: "${cursor}") {
        cursor
        items {
          id
          name
          column_values {
            column {
              title
            }
            type
            value
          }
        }
      }
    }`;

    const data = await this.mondayService.fetchData(query);
    const newCursor = data.data.next_items_page.cursor;
    const items = data.data.next_items_page.items;

    this.extractItems(items, groupName);

    if (newCursor) {
      await this.getPagedItems(newCursor, groupName);
    }
  }
}
