# EU IV Mobile Prototype

**Concept:** "Bit Life meets Europa Universalis" — turn-based country management with event cards and wars on an SVG map.

## Stack
- Vanilla HTML/CSS/JS (no frameworks, no build step)
- Dev server: Python http.server on port 3000 (via `.claude/launch.json`)
- Preview via Claude Preview MCP

## GitHub
- **Repo:** https://github.com/denisytodorov/eu4-mobile-prototype
- **Live:** https://denisytodorov.github.io/eu4-mobile-prototype/

## How to Run
```bash
cd "C:\Claude\EU IV Mobile Prototype"
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -m http.server 3000
```
Open http://localhost:3000

## Game Design

**Player:** France (only playable country in this POC)
**Timeline:** 1444-1544 (100 turns, 1 turn = 1 year)
**Stats:** Military, Gold, Stability (-3 to +3), Legitimacy (0-100)
**Core loop:** Advance year → economy tick → event card popup → make choice → optionally declare war → AI turns → map updates

### File Architecture

| File | Responsibility |
|------|---------------|
| `index.html` | Layout skeleton, script loading |
| `style.css` | Parchment theme, grid layout, card styles |
| `map.svg` | Simplified Europe SVG with 14 provinces |
| `js/constants.js` | All game data: countries, provinces, adjacency, balance numbers |
| `js/game.js` | GameState class: turn logic, war resolution, economy, AI |
| `js/events.js` | Event pool, weighted selection, effect application |
| `js/map.js` | SVG loading, province coloring, click/hover handlers |
| `js/ui.js` | Decision cards, HUD, history log, war dialog, screens |
| `js/main.js` | Init, module wiring, end-turn handler |

### Key Formulas
- **Income:** `sum(baseTax) * stabilityMod - (military * 0.1)` where `stabilityMod = 1 + stability * 0.10`
- **Mil recovery:** `sum(manpower) * 0.5 * legitimacyMod` where `legitimacyMod = 1 + (legitimacy - 50) * 0.01`
- **War:** `attacker = mil * 0.9 * stabMod + d10 * 5` vs `defender = mil * stabMod + d10 * 5` where `stabMod = 1 + stability * 0.05`
- **Win:** Own 10+ of 14 provinces. **Loss:** Own 0 provinces.

### Stability (-3 to +3)
- Drifts 1 step toward 0 each turn (bonuses/penalties are temporary)
- Affects income: `multiplier = 1 + stability * 0.10` (stab -3 = 70% tax, stab +3 = 130%)
- Affects war strength: `multiplier = 1 + stability * 0.05` (stab -3 = 85% mil, stab +3 = 115%)
- Declaring war costs -1 stability
- Losing a war costs -1 stability
- Low stability (≤-2) triggers Peasant Uprising event

### Legitimacy (0-100)
- Drifts 2 points toward 50 each turn (extreme values hard to maintain)
- Affects military recovery: `multiplier = 1 + (legitimacy - 50) * 0.01` (leg 0 = 50%, leg 100 = 150%)
- Winning wars grants +5 legitimacy, losing costs -10
- Low legitimacy (<35) makes AI more aggressive (lowers their required strength ratio by 0.2)
- Low legitimacy (≤30) triggers Pretender to the Throne event
- High stability (≥2) + legitimacy (≥70) triggers Golden Age event
- High stability (≥1) + legitimacy (≥50) triggers Church Blessing event

### AI Countries
England, Castile, Ottoman Empire, Burgundy, HRE, Denmark, Poland, Hungary — AI-controlled, can fight each other and the player.

| Country | Military | Gold | Stability | Legitimacy | Starting Provinces | Color |
|---------|----------|------|-----------|------------|--------------------|-------|
| England | 50 | 80 | 0 | 40 | england | `#c0392b` |
| Castile | 45 | 70 | 0 | 55 | castile, aragon | `#d4a017` |
| Ottoman Empire | 70 | 90 | 0 | 80 | balkans, anatolia | `#27ae60` |
| Burgundy | 35 | 50 | 0 | 65 | burgundy | `#8e44ad` |
| HRE | 55 | 85 | 0 | 50 | hre, italy | `#f39c12` |
| Denmark | 30 | 45 | 0 | 45 | denmark, scotland | `#2980b9` |
| Poland | 45 | 65 | 0 | 70 | poland, lithuania | `#e74c3c` |
| Hungary | 35 | 50 | 0 | 50 | hungary | `#1abc9c` |

### 14 Provinces

| Province | baseTax | Manpower | Starting Owner |
|----------|---------|----------|----------------|
| england | 12 | 8 | England |
| scotland | 4 | 3 | Denmark |
| france | 15 | 12 | France |
| burgundy | 10 | 6 | Burgundy |
| castile | 10 | 7 | Castile |
| aragon | 6 | 4 | Castile |
| hre | 14 | 10 | HRE |
| italy | 16 | 5 | HRE |
| denmark | 6 | 4 | Denmark |
| poland | 8 | 8 | Poland |
| lithuania | 5 | 6 | Poland |
| hungary | 8 | 7 | Hungary |
| balkans | 7 | 5 | Ottoman |
| anatolia | 9 | 6 | Ottoman |

### Economy
- `GOLD_PER_PROVINCE_TAX = 1` — income multiplier per baseTax
- `MILITARY_UPKEEP_RATE = 0.1` — gold cost = military * 0.1 per turn
- `MILITARY_RECOVERY_MULT = 0.5` — recovery = sum(manpower) * 0.5 per turn
- `STABILITY_INCOME_MULT = 0.10` — tax income modified by stability (±10% per point)
- `LEGITIMACY_RECOVERY_MULT = 0.01` — military recovery modified by legitimacy distance from 50
- `WAR_WINNER_GOLD_LOSS = 10`, `WAR_LOSER_GOLD_LOSS = 20`

### Events
- 12 base events across 4 categories: economy (3), military (4), diplomacy (2), disaster (3)
- 4 conditional events triggered by stat thresholds: peasant uprising, golden age, pretender claimant, church blessing
- Weighted random selection with 5-event recent-avoidance buffer
- All events have stability/legitimacy effects creating meaningful trade-offs

### UI System
- **Keyboard:** 1-3 to pick event choices, Enter/Space to end turn, Esc to close overlays
- **Map interaction:** Hover province for tooltip (name, owner, tax, manpower). Click enemy adjacent province to declare war.
- **Layout:** CSS grid — 280px history panel (left) | map (right). Responsive: stacks vertically under 768px.
- **Turn flow:** End Year → economy tick → event card (async pause) → AI turns → check win/loss → update map/HUD

### Theme
Parchment/medieval: `#f4e4c1` background, `#8b4513` accents, serif fonts (Georgia/Palatino)

### Key Design Decisions
- **SVG injection:** `map.svg` fetched via `fetch()`, injected as innerHTML so JS can manipulate province elements directly
- **Async turn flow:** `UI.showDecisionCard()` returns a Promise that resolves when player clicks a choice, pausing turn resolution mid-sequence
- **Event listener cleanup:** Dialog buttons use `cloneNode(true)` + `replaceWith` to prevent stacking listeners on reuse
- **AI war logic:** 10% chance per AI per turn (`AI_WAR_CHANCE`), only attacks if military > target * 1.2 (`AI_WAR_STRENGTH_RATIO`). AI avoids war when own stability < 0, and is more aggressive vs targets with legitimacy < 35 (threshold lowered by 0.2)
- **Stat drift:** Stability drifts toward 0 (1/turn), legitimacy drifts toward 50 (2/turn) — extreme values are temporary
- **Conditional events:** Event pool filters by gamestate conditions (e.g., peasant uprising only fires at stability ≤ -2)
- **Timeline end scoring:** At 1544, 7+ provinces = partial victory, <7 = defeat
- **Dev server:** `npx serve` fails with ENOENT in Preview MCP; Python http.server works reliably
