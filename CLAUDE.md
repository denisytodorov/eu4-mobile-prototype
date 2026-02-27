# EU IV Mobile Prototype

**Concept:** "Bit Life meets Europa Universalis" — turn-based country management with event cards and wars on an SVG map.

## Stack
- Vanilla HTML/CSS/JS (no frameworks, no build step)
- Dev server: `npx serve -l 3000`
- Preview via Claude Preview MCP

## How to Run
```bash
cd "C:\Claude\EU IV Mobile Prototype"
npx serve -l 3000
```
Open http://localhost:3000

## Game Design

**Player:** France (only playable country in this POC)
**Timeline:** 1444-1544 (100 turns, 1 turn = 1 year)
**Stats:** Military + Gold
**Core loop:** Advance year → event card popup → make choice → optionally declare war → map updates

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
- **Income:** `sum(baseTax of owned provinces) - (military * 0.1)`
- **Mil recovery:** `sum(manpower of owned provinces) * 0.5`
- **War:** `attacker = mil * 0.9 + d10 * 5` vs `defender = mil + d10 * 5`
- **Win:** Own 10+ of 14 provinces. **Loss:** Own 0 provinces.

### AI Countries
England, Castile, Ottoman Empire, Burgundy, HRE — AI-controlled, can fight each other and the player.

### 14 Provinces
england, scotland, france, burgundy, castile, aragon, hre, italy, denmark, poland, lithuania, hungary, balkans, anatolia

### Theme
Parchment/medieval: `#f4e4c1` background, `#8b4513` accents, serif fonts (Georgia/Palatino)
