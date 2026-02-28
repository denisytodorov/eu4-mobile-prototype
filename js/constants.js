// === GAME CONSTANTS ===
const START_YEAR = 1444;
const END_YEAR = 1544;
const PLAYER_COUNTRY = "france";

// === ECONOMY ===
const GOLD_PER_PROVINCE_TAX = 1;       // income multiplier per baseTax
const MILITARY_UPKEEP_RATE = 0.1;      // gold cost = military * this
const MILITARY_RECOVERY_MULT = 0.5;    // recovery = sum(manpower) * this

// === WAR ===
const WAR_DICE_SIDES = 10;
const WAR_DICE_MULT = 5;
const WAR_ATTACKER_PENALTY = 0.9;
const WAR_WINNER_MIL_LOSS = 0.3;
const WAR_LOSER_MIL_LOSS = 0.5;
const WAR_WINNER_GOLD_LOSS = 10;
const WAR_LOSER_GOLD_LOSS = 20;

// === AI ===
const AI_WAR_CHANCE = 0.10;
const AI_WAR_STRENGTH_RATIO = 1.2;     // AI attacks if mil > target * this

// === STABILITY (-3 to +3) ===
const STABILITY_MIN = -3;
const STABILITY_MAX = 3;
const STABILITY_DECAY_RATE = 1;           // drifts 1 step toward 0 per turn
const STABILITY_INCOME_MULT = 0.10;       // income modifier per stability point
const STABILITY_WAR_MULT = 0.05;          // war strength modifier per stability point
const STABILITY_WAR_DECLARE_COST = -1;    // declaring war costs this much stability
const STABILITY_WAR_LOSS_COST = -1;       // losing a war costs this much stability

// === LEGITIMACY (0-100) ===
const LEGITIMACY_MIN = 0;
const LEGITIMACY_MAX = 100;
const LEGITIMACY_DRIFT_RATE = 2;          // drifts 2 points toward 50 per turn
const LEGITIMACY_DRIFT_TARGET = 50;
const LEGITIMACY_RECOVERY_MULT = 0.01;    // recovery modifier per legitimacy point above/below 50
const LEGITIMACY_WAR_WIN_BONUS = 5;
const LEGITIMACY_WAR_LOSS_PENALTY = -10;
const AI_LEGITIMACY_WEAKNESS_THRESHOLD = 35;

// === WIN/LOSS ===
const VICTORY_PROVINCE_COUNT = 10;

// === COUNTRIES ===
const COUNTRIES = {
    france: {
        name: "Kingdom of France",
        ruler: "Charles VII",
        startProvinces: ["france"],
        startMilitary: 60,
        startGold: 100,
        startStability: 0,
        startLegitimacy: 60,
        color: "#3b5998"
    },
    england: {
        name: "Kingdom of England",
        ruler: "Henry VI",
        startProvinces: ["england"],
        startMilitary: 50,
        startGold: 80,
        startStability: 0,
        startLegitimacy: 40,
        color: "#c0392b"
    },
    castile: {
        name: "Crown of Castile",
        ruler: "John II",
        startProvinces: ["castile", "aragon"],
        startMilitary: 45,
        startGold: 70,
        startStability: 0,
        startLegitimacy: 55,
        color: "#d4a017"
    },
    ottoman: {
        name: "Ottoman Empire",
        ruler: "Murad II",
        startProvinces: ["balkans", "anatolia"],
        startMilitary: 70,
        startGold: 90,
        startStability: 0,
        startLegitimacy: 80,
        color: "#27ae60"
    },
    burgundy: {
        name: "Duchy of Burgundy",
        ruler: "Philip the Good",
        startProvinces: ["burgundy"],
        startMilitary: 35,
        startGold: 50,
        startStability: 0,
        startLegitimacy: 65,
        color: "#8e44ad"
    },
    hre: {
        name: "Holy Roman Empire",
        ruler: "Frederick III",
        startProvinces: ["hre", "italy"],
        startMilitary: 55,
        startGold: 85,
        startStability: 0,
        startLegitimacy: 50,
        color: "#f39c12"
    },
    denmark: {
        name: "Kingdom of Denmark",
        ruler: "Christopher III",
        startProvinces: ["denmark", "scotland"],
        startMilitary: 30,
        startGold: 45,
        startStability: 0,
        startLegitimacy: 45,
        color: "#2980b9"
    },
    poland: {
        name: "Kingdom of Poland",
        ruler: "Wladyslaw III",
        startProvinces: ["poland", "lithuania"],
        startMilitary: 45,
        startGold: 65,
        startStability: 0,
        startLegitimacy: 70,
        color: "#e74c3c"
    },
    hungary: {
        name: "Kingdom of Hungary",
        ruler: "Wladyslaw I",
        startProvinces: ["hungary"],
        startMilitary: 35,
        startGold: 50,
        startStability: 0,
        startLegitimacy: 50,
        color: "#1abc9c"
    }
};

// === PROVINCES ===
const PROVINCES = {
    england:   { name: "England",              baseTax: 12, manpower: 8 },
    scotland:  { name: "Scotland",             baseTax: 4,  manpower: 3 },
    france:    { name: "France",               baseTax: 15, manpower: 12 },
    burgundy:  { name: "Burgundy",             baseTax: 10, manpower: 6 },
    castile:   { name: "Castile",              baseTax: 10, manpower: 7 },
    aragon:    { name: "Aragon",               baseTax: 6,  manpower: 4 },
    hre:       { name: "Holy Roman Empire",    baseTax: 14, manpower: 10 },
    italy:     { name: "Italy",                baseTax: 16, manpower: 5 },
    denmark:   { name: "Denmark",              baseTax: 6,  manpower: 4 },
    poland:    { name: "Poland",               baseTax: 8,  manpower: 8 },
    lithuania: { name: "Lithuania",            baseTax: 5,  manpower: 6 },
    hungary:   { name: "Hungary",              baseTax: 8,  manpower: 7 },
    balkans:   { name: "Balkans",              baseTax: 7,  manpower: 5 },
    anatolia:  { name: "Anatolia",             baseTax: 9,  manpower: 6 }
};

// === ADJACENCY (bidirectional) ===
const ADJACENCY = {
    england:   ["scotland", "france"],
    scotland:  ["england"],
    france:    ["england", "burgundy", "castile", "aragon", "hre", "italy"],
    burgundy:  ["france", "hre"],
    castile:   ["aragon", "france"],
    aragon:    ["castile", "france", "italy"],
    hre:       ["france", "burgundy", "denmark", "poland", "hungary", "italy"],
    italy:     ["france", "aragon", "hre", "balkans"],
    denmark:   ["hre", "poland", "scotland"],
    poland:    ["hre", "denmark", "lithuania", "hungary"],
    lithuania: ["poland"],
    hungary:   ["hre", "poland", "balkans"],
    balkans:   ["hungary", "italy", "anatolia"],
    anatolia:  ["balkans"]
};

// === NEUTRAL COLOR ===
const NEUTRAL_COLOR = "#bdc3c7";