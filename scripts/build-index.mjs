#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const API = "https://pokeapi.co/api/v2";
const OUT = path.resolve("public/pokedex-index.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

function pickStats(detail) {
  const get = (name) => detail.stats?.find((s) => s.stat.name === name)?.base_stat ?? 0;
  const hp = get("hp");
  const atk = get("attack");
  const def = get("defense");
  const spa = get("special-attack");
  const spd = get("special-defense");
  const spe = get("speed");
  const total = hp + atk + def + spa + spd + spe;
  return { total, hp, atk, def, spa, spd, spe };
}

async function main() {
  console.log("Building pokedex index...");
  const list = await fetchJSON(`${API}/pokemon?limit=20000&offset=0`);
  const items = list.results;
  console.log(`Total pokemon in API list: ${items.length}`);

  // Concurrency limiter
  const CONCURRENCY = 25;
  let i = 0;
  const out = [];

  async function worker(workerId) {
    while (i < items.length) {
      const idx = i++;
      const it = items[idx];
      try {
        const detail = await fetchJSON(`${API}/pokemon/${it.name}`);
        out.push({
          id: detail.id,
          name: detail.name,
          sprite: detail.sprites?.front_default ?? null,
          types: (detail.types ?? []).map((t) => t.type.name),
          stats: pickStats(detail),
        });

        if (idx % 50 === 0) {
          console.log(`[${workerId}] ${idx}/${items.length}`);
          // small pause to be nice
          await sleep(50);
        }
      } catch (e) {
        console.error(`Failed: ${it.name}`, e.message);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, w) => worker(w + 1)));

  out.sort((a, b) => a.id - b.id);

  const payload = {
    generatedAt: new Date().toISOString(),
    count: out.length,
    items: out,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(payload));
  console.log(`Wrote ${OUT} (${out.length} entries)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
