# PokePages → PokémonDB parity: PokeAPI data map

Goal: replicate PokémonDB’s **detail page** information architecture (A–E: Pokédex data, Training, Breeding, Location, Moves).

## Core endpoints

### 1) Pokémon (stats, types, abilities, moves)
- `GET https://pokeapi.co/api/v2/pokemon/{nameOrId}`

Use for:
- **Hero**: `id`, `name`, `sprites.front_default` (+ other sprites if you want), `types[]`
- **Base stats**: `stats[]` → hp/atk/def/spA/spD/spe
- **Abilities**: `abilities[]`
- **Moves**: `moves[]` (learn methods + version groups)
- **Pokédex data**: `height`, `weight`, `base_experience`

### 2) Species (flavor text, breeding, capture, varieties)
- `GET https://pokeapi.co/api/v2/pokemon-species/{nameOrId}`

Use for:
- **Species label / genus**: `genera[] (language=en)`
- **Flavor text**: `flavor_text_entries[] (language=en)`
- **Training**:
  - Catch rate: `capture_rate`
  - Base friendship: `base_happiness`
  - Growth rate: `growth_rate.name`
- **Breeding**:
  - Gender ratio: `gender_rate` (0–8; -1 genderless)
  - Egg groups: `egg_groups[].name`
  - Hatch counter: `hatch_counter`
- **Forms/varieties**:
  - `varieties[]` → each has `pokemon.name` you can link to
- **Evolution chain pointer**: `evolution_chain.url`

### 3) Evolution chain
- from species: `evolution_chain.url` → `GET .../evolution-chain/{id}`

Use for:
- **Evolution chain tree**: `chain` structure (`species.name`, `evolves_to[]`)
- To render sprites/types for each node: fetch `/pokemon/{name}` for each node (cache!)

## Moves (PokémonDB-style grouping)
From `pokemon/{name}`:
- `moves[]` entries include:
  - `move.name`
  - `version_group_details[]` with:
    - `level_learned_at`
    - `move_learn_method.name` (e.g. `level-up`, `machine`, `egg`, `tutor`)
    - `version_group.name`

Implementation notes:
- PokémonDB shows **per game/version group** filters; pick a default (latest gen) + allow switching.
- Create derived groups:
  - Level-up: sort by `level_learned_at`
  - Machine: list move names (optionally map to TM numbers — not in PokeAPI directly)
  - Egg moves
  - Tutor

## Location
PokeAPI provides encounters:
- `GET https://pokeapi.co/api/v2/pokemon/{id}/encounters`

This is game/version specific and can be noisy. For “PokémonDB-like” you likely want:
- show a collapsed section “Encounters (game-specific)”
- optionally filter by version.

## Derived fields (match PokémonDB labels)

### Gender ratio (from `species.gender_rate`)
- `-1` → Genderless
- `0..8` → female = rate/8, male = 1 - female

### Egg cycles (from `species.hatch_counter`)
- PokémonDB’s “Egg cycles” is usually `hatch_counter + 1` (game mechanic); you can display both:
  - Hatch counter
  - Approx steps: `255 * (hatch_counter + 1)`

### EV yield
From `pokemon/{name}`:
- Each stat object has `effort` (EV yield). Summarize non-zero.

### Catch rate
From species: `capture_rate` (0–255)

### Base friendship
From species: `base_happiness`

### Growth rate
From species: `growth_rate.name`

## Caching strategy
- **List page**: use generated `public/pokedex-index.json` (global sort/filter) → no runtime PokeAPI calls.
- **Detail page**:
  - Fetch `pokemon/{name}` + `pokemon-species/{name}` + `evolution-chain`.
  - Cache per-pokemon detail in-memory (client) and/or Next revalidate (server) ~ 1 hour.
  - Evolution chain node cards should use cached `pokemon/{node}` calls.

