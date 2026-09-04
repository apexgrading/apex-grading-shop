import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { SCHEMA_SQL } from "./schema.mjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "apex.db");

const db = new DatabaseSync(dbPath);
db.exec(SCHEMA_SQL);

db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM cards;");

const insertCard = db.prepare(`
  INSERT INTO cards (title, category, grade, cert, price, imageUrl, pal, tag)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// The two real, photographed slabs
insertCard.run(
  "Mega Greninja ex — 2026 Chaos Rising #116",
  "Pokémon", 10, "AGC000001", 124000,
  "/assets/card-mega-greninja.jpg", null, null
);
insertCard.run(
  "Cynthia's Garchomp ex — 2025 Destined Rivals #232",
  "Pokémon", 10, "AGC000036", 68500,
  "/assets/card-cynthia-garchomp.jpg", null, null
);

const pokemonNames = [
  "Charizard ex — Obsidian Flames", "Umbreon VMAX — Evolving Skies",
  "Pikachu — Base Set Holo", "Lugia — Neo Genesis 1st Ed",
  "Rayquaza VMAX — Evolving Skies", "Gengar ex — Fusion Strike",
  "Mewtwo — Base Set Holo", "Sylveon VMAX — Evolving Skies",
  "Blastoise — Base Set Holo", "Giratina VSTAR — Lost Origin",
];
const sportsNames = [
  "Basketball — Rookie Card /99", "Baseball — Vintage 1958",
  "Football — Rookie Patch Auto", "Basketball — Prizm Silver",
  "Baseball — Rookie Auto /50", "Football — Vintage 1972",
  "Basketball — National Treasures /25", "Baseball — Chrome Refractor",
  "Hockey — Young Guns Rookie", "Football — Optic Rated Rookie",
];
const tcgNames = [
  "One Piece TCG — Leader Alt Art", "Magic: The Gathering — Dual Land",
  "Yu-Gi-Oh! — Ghost Rare", "One Piece TCG — Manga Rare",
  "Magic: The Gathering — Foil Mythic", "Digimon TCG — Alt Art Promo",
];
const palettes = ["pal-a", "pal-b", "pal-c", "pal-d", "pal-e", "pal-f", "pal-g", "pal-h"];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const pools = [
  { cat: "Pokémon", names: pokemonNames, tag: "PKM" },
  { cat: "Sports", names: sportsNames, tag: "SPT" },
  { cat: "TCG", names: tcgNames, tag: "TCG" },
];

// Sample catalog. To simulate the full 200–500 card range, bump `total` —
// everything else (filters, sort, pagination) already scales to it.
const total = 60;

for (let i = 0; i < total; i++) {
  const pool = pools[Math.floor(seededRandom(i * 3.1) * pools.length)];
  const name = pool.names[Math.floor(seededRandom(i * 1.7) * pool.names.length)];
  const gradeRoll = seededRandom(i * 5.3);
  const grade =
    gradeRoll > 0.55 ? 10 : gradeRoll > 0.3 ? 9 : gradeRoll > 0.15 ? 8 : gradeRoll > 0.07 ? 7 : Math.floor(seededRandom(i * 9.9) * 5) + 2;
  const basePrice = pool.cat === "Pokémon" ? 22000 : pool.cat === "Sports" ? 18000 : 9000;
  const price = Math.round((basePrice + seededRandom(i * 7.7) * basePrice * 6) * (grade / 10));
  const certNum = String(480000 + Math.floor(seededRandom(i * 11.1) * 19999)).padStart(8, "0");
  const pal = palettes[Math.floor(seededRandom(i * 2.3) * palettes.length)];

  insertCard.run(
    `${name} #${100 + i}`,
    pool.cat, grade, "00" + certNum, price,
    null, pal, pool.tag
  );
}

const count = db.prepare("SELECT COUNT(*) as c FROM cards").get().c;
console.log(`Seeded ${count} cards into ${dbPath}`);
db.close();
