# PokémonDB Parity TODO (Detail page first)

Target reference: https://pokemondb.net/pokedex/bulbasaur

## Status snapshot (already in PokePages)
- Hero: name, #, sprite, types ✅
- Flavor text + genus ✅
- Base stats card with bars ✅
- Evolution chain with sprites/arrows ✅
- Moves list (simple filter) ✅ (not grouped like PokémonDB yet)

---

## P0 — Detail page parity (must-have)

### 1) Pokédex data card (match PokémonDB fields)
**Add fields** (with exact labels):
- National № (already shown as #xxxx)
- Type (already)
- Species (genus) (already)
- Height (already)
- Weight (already)
- Abilities (already, but mark hidden ability)

**Acceptance:** looks like PokémonDB “Pokédex data” table; hidden ability shown with “(hidden)”.

### 2) Training section
Add card/section:
- EV yield (from `/pokemon/{name}` stats[].effort)
- Catch rate (species.capture_rate)
- Base friendship (species.base_happiness)
- Base Exp. (pokemon.base_experience)
- Growth Rate (species.growth_rate.name)

**Acceptance:** same data is visible without scrolling past 1–2 cards.

### 3) Breeding section
Add card/section:
- Gender ratio (species.gender_rate) render as % male/female (or “Genderless”)
- Egg groups (species.egg_groups)
- Egg cycles (species.hatch_counter) + approximate steps

**Acceptance:** displays exactly like PokémonDB (human-readable, not raw numbers).

### 4) Location section
Add collapsible section:
- Encounters: `/pokemon/{id}/encounters`
- Filter by version (optional)

**Acceptance:** not overwhelming; default collapsed.

### 5) Moves section (PokémonDB style)
Replace simple move badges with grouped tables:
- Level-up (show level)
- TM/Machine
- Egg
- Tutor

Also:
- Version group selector (default latest)
- Search inside moves

**Acceptance:** user can find “Tackle” quickly and see how it’s learned.

---

## P1 — Detail page polish (very PokémonDB)

### 6) Forms / varieties
From species.varieties:
- show a “Forms” section listing varieties (mega/regional/etc)
- each links to `/pokemon/[name]`

**Acceptance:** Bulbasaur shows only itself; Charizard shows multiple forms.

### 7) Better evolution layout
- render as a horizontal chain per lane
- show evolution triggers (level/item) if available (from evolution-chain details)

### 8) More sprites
- shiny toggle (front_default ↔ front_shiny)
- optionally show female sprites where available

---

## P2 — List page parity (later)
- sticky centered filter bar on scroll
- match PokémonDB column sizing & colors
- keyboard shortcuts (/ to focus search)

