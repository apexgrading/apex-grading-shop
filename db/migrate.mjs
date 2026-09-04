import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { SCHEMA_SQL } from "./schema.mjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "apex.db");

const db = new DatabaseSync(dbPath);
db.exec(SCHEMA_SQL);
db.close();

console.log(`Schema ready at ${dbPath}`);
