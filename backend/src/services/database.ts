import fs from 'node:fs';
import path from 'node:path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export interface CounterState {
  value: number;
  updatedAt: string;
}

let database: any;

const defaultDatabasePath = path.join(process.cwd(), 'backend', 'data', 'sobp-validation.sqlite');

export async function initializeDatabase(): Promise<void> {
  const databasePath = process.env.SQLITE_PATH ?? defaultDatabasePath;
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  database = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  await database.run(
    `INSERT OR IGNORE INTO counters (id, value, updated_at) VALUES ('main', 0, datetime('now'))`
  );
}

function getDatabase(): any {
  if (!database) {
    throw new Error('Database has not been initialized.');
  }

  return database;
}

export async function getCounter(): Promise<CounterState> {
  const row = (await getDatabase().get(
    `SELECT value, updated_at FROM counters WHERE id = 'main'`
  )) as { value: number; updated_at: string } | undefined;

  return {
    value: row?.value ?? 0,
    updatedAt: row?.updated_at ?? new Date().toISOString()
  };
}

export async function incrementCounter(): Promise<CounterState> {
  await getDatabase().run(
    `UPDATE counters SET value = value + 1, updated_at = datetime('now') WHERE id = 'main'`
  );

  return getCounter();
}
