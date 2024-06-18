import dotenv from 'dotenv';
import fs from 'fs';

import { MondayService } from './extraction';
import { BoardExtractor } from './extraction';

// Laden der Umgebungsvariablen aus der .env-Datei
dotenv.config();

const API_URL = process.env.API_URL || '';
const API_KEY = process.env.API_KEY || '';
const BOARD_ID = process.env.BOARD_ID || '';


/**
 * Hauptprogramm zum Starten der Extraktion
 */
(async () => {
    const mondayService = new MondayService(API_URL, API_KEY);
    const boardExtractor = new BoardExtractor(mondayService, BOARD_ID);

    const boardData = await boardExtractor.getGroups();

    fs.writeFileSync(`./data/${BOARD_ID}.json`, JSON.stringify(boardData));
})();
