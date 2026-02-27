// === GAME STATE ===
class GameState {
    constructor() {
        this.currentYear = START_YEAR;
        this.countries = {};
        this.provinceOwners = {};
        this.history = [];
        this.gameOver = false;
        this.playerWon = false;
        this.waitingForDecision = false;
    }

    init() {
        // Initialize countries from constants
        for (const [id, data] of Object.entries(COUNTRIES)) {
            this.countries[id] = {
                id: id,
                name: data.name,
                military: data.startMilitary,
                gold: data.startGold,
                alive: true
            };
        }

        // Assign starting provinces
        for (const [countryId, data] of Object.entries(COUNTRIES)) {
            for (const provId of data.startProvinces) {
                this.provinceOwners[provId] = countryId;
            }
        }
    }

    getPlayer() {
        return this.countries[PLAYER_COUNTRY];
    }

    getPlayerProvinces() {
        return Object.entries(this.provinceOwners)
            .filter(([_, owner]) => owner === PLAYER_COUNTRY)
            .map(([provId]) => provId);
    }

    getCountryProvinces(countryId) {
        return Object.entries(this.provinceOwners)
            .filter(([_, owner]) => owner === countryId)
            .map(([provId]) => provId);
    }

    getProvinceOwner(provId) {
        return this.provinceOwners[provId] || null;
    }

    // Calculate gold income for a country
    calcIncome(countryId) {
        const provs = this.getCountryProvinces(countryId);
        const tax = provs.reduce((sum, p) => sum + PROVINCES[p].baseTax, 0);
        const upkeep = Math.floor(this.countries[countryId].military * MILITARY_UPKEEP_RATE);
        return (tax * GOLD_PER_PROVINCE_TAX) - upkeep;
    }

    // Calculate military recovery for a country
    calcRecovery(countryId) {
        const provs = this.getCountryProvinces(countryId);
        const manpower = provs.reduce((sum, p) => sum + PROVINCES[p].manpower, 0);
        return Math.floor(manpower * MILITARY_RECOVERY_MULT);
    }

    // Apply income and recovery for all countries
    tickEconomy() {
        for (const [id, country] of Object.entries(this.countries)) {
            if (!country.alive) continue;
            const income = this.calcIncome(id);
            country.gold = Math.max(0, country.gold + income);
            const recovery = this.calcRecovery(id);
            country.military += recovery;
        }
    }

    // Check if attacker can attack target province
    canAttackProvince(attackerCountryId, targetProvId) {
        const targetOwner = this.provinceOwners[targetProvId];
        if (!targetOwner || targetOwner === attackerCountryId) return false;

        // Check adjacency: attacker must own a province adjacent to target
        const attackerProvs = this.getCountryProvinces(attackerCountryId);
        for (const ownedProv of attackerProvs) {
            if (ADJACENCY[ownedProv] && ADJACENCY[ownedProv].includes(targetProvId)) {
                return true;
            }
        }
        return false;
    }

    // Resolve a war battle
    resolveWar(attackerId, defenderId, targetProvId) {
        const attacker = this.countries[attackerId];
        const defender = this.countries[defenderId];

        const attackerRoll = 1 + Math.floor(Math.random() * WAR_DICE_SIDES);
        const defenderRoll = 1 + Math.floor(Math.random() * WAR_DICE_SIDES);

        const attackerTotal = (attacker.military * WAR_ATTACKER_PENALTY) + (attackerRoll * WAR_DICE_MULT);
        const defenderTotal = defender.military + (defenderRoll * WAR_DICE_MULT);

        const attackerWins = attackerTotal > defenderTotal;

        if (attackerWins) {
            attacker.military = Math.max(1, Math.floor(attacker.military * (1 - WAR_WINNER_MIL_LOSS)));
            defender.military = Math.max(1, Math.floor(defender.military * (1 - WAR_LOSER_MIL_LOSS)));
            attacker.gold = Math.max(0, attacker.gold - WAR_WINNER_GOLD_LOSS);
            defender.gold = Math.max(0, defender.gold - WAR_LOSER_GOLD_LOSS);
            this.provinceOwners[targetProvId] = attackerId;
        } else {
            attacker.military = Math.max(1, Math.floor(attacker.military * (1 - WAR_LOSER_MIL_LOSS)));
            defender.military = Math.max(1, Math.floor(defender.military * (1 - WAR_WINNER_MIL_LOSS)));
            attacker.gold = Math.max(0, attacker.gold - WAR_LOSER_GOLD_LOSS);
            defender.gold = Math.max(0, defender.gold - WAR_WINNER_GOLD_LOSS);
        }

        // Check if defender lost all provinces
        this.checkCountryAlive(defenderId);
        this.checkCountryAlive(attackerId);

        return {
            attackerWins,
            attackerRoll,
            defenderRoll,
            attackerTotal: Math.floor(attackerTotal),
            defenderTotal: Math.floor(defenderTotal),
            provinceName: PROVINCES[targetProvId].name
        };
    }

    checkCountryAlive(countryId) {
        const provs = this.getCountryProvinces(countryId);
        if (provs.length === 0) {
            this.countries[countryId].alive = false;
        }
    }

    // AI turn: each AI country may declare war
    runAI() {
        const results = [];
        for (const [id, country] of Object.entries(this.countries)) {
            if (id === PLAYER_COUNTRY || !country.alive) continue;
            if (Math.random() > AI_WAR_CHANCE) continue;

            // Find adjacent provinces owned by others
            const myProvs = this.getCountryProvinces(id);
            const targets = [];
            for (const myProv of myProvs) {
                for (const adj of (ADJACENCY[myProv] || [])) {
                    const adjOwner = this.provinceOwners[adj];
                    if (adjOwner && adjOwner !== id && this.countries[adjOwner] && this.countries[adjOwner].alive) {
                        if (country.military > this.countries[adjOwner].military * AI_WAR_STRENGTH_RATIO) {
                            targets.push({ province: adj, defender: adjOwner });
                        }
                    }
                }
            }

            if (targets.length === 0) continue;

            // Pick a random target
            const target = targets[Math.floor(Math.random() * targets.length)];
            const result = this.resolveWar(id, target.defender, target.province);
            results.push({
                attacker: id,
                defender: target.defender,
                province: target.province,
                ...result
            });
        }
        return results;
    }

    // Check win/loss conditions
    checkGameOver() {
        const playerProvs = this.getPlayerProvinces();
        if (playerProvs.length >= VICTORY_PROVINCE_COUNT) {
            this.gameOver = true;
            this.playerWon = true;
            return "victory";
        }
        if (playerProvs.length === 0) {
            this.gameOver = true;
            this.playerWon = false;
            return "defeat";
        }
        if (this.currentYear >= END_YEAR) {
            this.gameOver = true;
            this.playerWon = playerProvs.length >= 7; // partial victory threshold
            return this.playerWon ? "time_victory" : "time_defeat";
        }
        return null;
    }
}