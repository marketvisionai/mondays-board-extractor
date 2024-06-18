# Monday.com Board Extractor

Dieses Projekt ermöglicht das Extrahieren von Daten aus einem Monday.com Board über die API und das Speichern dieser Daten als JSON-Datei.

## Voraussetzungen

Stellen Sie sicher, dass Node.js und npm installiert sind. Dieses Projekt verwendet TypeScript, daher müssen auch die entsprechenden Pakete installiert werden.

## Installation

1. Klonen Sie das Repository:

   ```bash
   git clone https://github.com/marketvisionai/mondays-board-extractor.git
   cd mondays-board-extractor
   ```

2. Installieren Sie die Abhängigkeiten:

   ```bash
   npm install
   ```

3. Erstellen Sie eine `tsconfig.json`-Datei:

   ```json
   {
     "compilerOptions": {
       "target": "ES6",
       "module": "commonjs",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```

4. Erstellen Sie eine `.env`-Datei im Stammverzeichnis und fügen Sie Ihren Monday.com API-Schlüssel und die Board-ID hinzu:

   ```env
   API_URL=https://api.monday.com/v2
   API_KEY=your_api_key
   BOARD_ID=3519379160
   ```

## Nutzung

1. Starten Sie das Skript zur Datenextraktion:

   ```bash
   npx ts-node src/index.ts
   ```

2. Die Daten des Boards werden in einer JSON-Datei im `data`-Verzeichnis gespeichert.

## Projektstruktur

- `src/`
  - `index.ts`: Einstiegspunkt des Programms.
  - `mondayService.ts`: Enthält die `MondayService`-Klasse für die Kommunikation mit der API.
  - `boardExtractor.ts`: Enthält die `BoardExtractor`-Klasse für die Datenextraktion.
- `data/`: Hier werden die extrahierten JSON-Dateien gespeichert.

## Klassen und Methoden

### `MondayService`

Diese Klasse dient als Service zur Kommunikation mit der Monday.com API.

- **Konstruktor**: Initialisiert die API-URL und den API-Schlüssel.
- **`fetchData(query: string): Promise<any>`**: Führt eine GraphQL-Abfrage aus und gibt die Antwort zurück.

### `BoardExtractor`

Diese Klasse extrahiert die Daten eines bestimmten Boards.

- **Konstruktor**: Initialisiert den `MondayService` und die `boardId`.
- **`getGroups(): Promise<void>`**: Extrahiert die Gruppen und Artikel (Items) des Boards und speichert sie als JSON-Datei.
- **`extractItems(rows: Item[], groupName: string): void`**: Extrahiert die Artikel (Items) einer Gruppe und fügt sie der Board-Datenstruktur hinzu.
- **`parseColumns(columns: any[]): any`**: Parst die Spaltenwerte eines Artikels.
- **`getPagedItems(cursor: string, groupName: string): Promise<void>`**: Holt die nächsten Seiten der Artikel (Items) einer Gruppe.

## Weboberfläche (optional)

Eine einfache Weboberfläche kann mit HTML und JavaScript erstellt werden, um ein Board im Browser auszuwählen und die Daten anzuzeigen.

### Beispiel HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Monday.com Board Extractor</title>
  </head>
  <body>
    <h1>Select a Board</h1>
    <form id="boardForm">
      <label for="boardId">Board ID:</label>
      <input type="text" id="boardId" name="boardId" required />
      <button type="submit">Extract Data</button>
    </form>

    <pre id="output"></pre>

    <script>
      document.getElementById("boardForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const boardId = document.getElementById("boardId").value;

        const response = await fetch("/extract-board-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ boardId }),
        });

        const data = await response.json();
        document.getElementById("output").textContent = JSON.stringify(data, null, 2);
      });
    </script>
  </body>
</html>
```

### Backend für Weboberfläche

```typescript
import express from "express";
import bodyParser from "body-parser";
import { MondayService } from "./mondayService";
import { BoardExtractor } from "./boardExtractor";

const app = express();
app.use(bodyParser.json());

app.post("/extract-board-data", async (req, res) => {
  const { boardId } = req.body;

  const apiUrl = "";
  const apiKey = "";
  const boardId = "";

  const mondayService = new MondayService(apiUrl, apiKey);
  const boardExtractor = new BoardExtractor(mondayService, boardId);

  const data = await boardExtractor.getGroups();

  res.json({ message: "Data extraction complete", data });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Mitwirkende

- Dein Name - [GitHub Profil](https://github.com/dein-profil)

## Lizenz

Dieses Projekt ist lizenziert unter der MIT-Lizenz - siehe die [LICENSE](LICENSE) Datei für Details.
