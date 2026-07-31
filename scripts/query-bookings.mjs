import Database from "better-sqlite3";

const db = new Database("data/iron-lion.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables.map((t) => t.name).join(", "));

for (const { name } of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${name} ORDER BY rowid DESC LIMIT 5`).all();
    if (rows.length) {
      console.log(`\n== ${name} (${rows.length}) ==`);
      console.log(JSON.stringify(rows, null, 2));
    }
  } catch {
    /* ignore */
  }
}
