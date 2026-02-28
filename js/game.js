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
                stability: data.startStability,
                legitimacy: data.startLegitimacy,
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

    // Calculate gold income for a country (stability affects tax)
    calcIncome(countryId) {
        const country = this.countries[countryId];
        const provs = this.getCountryProvinces(countryId);
        const tax = provs.reduce((sum, p) => sum + PROVINCES[p].baseTax, 0);
        const stabilityMod = 1 + (country.stability * STABILITY_INCOME_MULT);
        const upkeep = Math.floor(country.military * MILITARY_UPKEEP_RATE);
        return Math.floor(tax * GOLD_PER_PROVINCE_TAX * stabilityMod) - upkeep;
    }

    // Calculate military recovery for a country (legitimacy affects recovery)
    calcRecovery(countryId) {
        const country = this.countries[countryId];
        const provs = this.getCountryProvinces(countryId);
        const manpower = provs.reduce((sum, p) => sum + PROVINCES[p].manpower, 0);
        const legitimacyMod = 1 + (country.legitimacy - LEGITIMACY_DRIFT_TARGET) * LEGITIMACY_RECOVERY_MULT;
        return Math.floor(manpower * MILITARY_RECOVERY_MULT * legitimacyMod);
    }

    // Apply income, recovery, and stat drift for all countries
    tickEconomy() {
        for (const [id, country] of Object.entries(this.countries)) {
            if (!country.alive) continue;

            // Gold income
            const income = this.calcIncome(id);
            country.gold = Math.max(0, country.gold + income);

            // Military recovery
            const recovery = this.calcRecovery(id);
            country.military += recovery;

            // Stability drift toward 0
            if (country.stability > 0) {
                country.stability = Math.max(0, country.stability - STABILITY_DECAY_RATE);
            } else if (country.stability < 0) {
                country.stability = Math.min(0, country.stability + STABILITY_DECAY_RATE);
            }

            // Legitimacy drift toward 50
            if (country.legitimacy > LEGITIMACY_DRIFT_TARGET) {
                country.legitimacy = Math.max(LEGITIMACY_DRIFT_TARGET, country.legitimacy - LEGITIMACY_DRIFT_RATE);
            } else if (country.legitimacy < LEGITIMACY_DRIFT_TARGET) {
                country.legitimacy = Math.min(LEGITIMACY_DRIFT_TARGET, country.legitimacy + LEGITIMACY_DRIFT_RATE);
            }
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

    // Pay stability cost for declaring war
    applyWarDeclarationCost(countryId) {
        const country = this.countries[countryId];
        country.stability = Math.max(STABILITY_MIN, country.stability + STABILITY_WAR_DECLARE_COST);
    }

    // Resolve a war battle (stability modifies combat strength)
    resolveWar(attackerId, defenderId, targetProvId) {
        const attacker = this.countries[attackerId];
        const defender = this.countries[defenderId];

        const attackerRoll = 1 + Math.floor(Math.random() * WAR_DICE_SIDES);
        const defenderRoll = 1 + Math.floor(Math.random() * WAR_DICE_SIDES);

        // Stability modifies effective military strength
        const atkStabMod = 1 + (attacker.stability * STABILITY_WAR_MULT);
        const defStabMod = 1 + (defender.stability * STABILITY_WAR_MULT);

        const attackerTotal = (attacker.military * WAR_ATTACKER_PENALTY * atkStabMod) + (attackerRoll * WAR_DICE_MULT);
        const defenderTotal = (defender.military * defStabMod) + (defenderRoll * WAR_DICE_MULT);

        const attackerWins = attackerTotal > defenderTotal;

        if (attackerWins) {
            attacker.military = Math.max(1, Math.floor(attacker.military * (1 - WAR_WINNER_MIL_LOSS)));
            defender.military = Math.max(1, Math.floor(defender.military * (1 - WAR_LOSER_MIL_LOSS)));
            attacker.gold = Math.max(0, attacker.gold - WAR_WINNER_GOLD_LOSS);
            defender.gold = Math.max(0, defender.gold - WAR_LOSER_GOLD_LOSS);
            this.provinceOwners[targetProvId] = attackerId;

            // Winner: legitimacy boost
            attacker.legitimacy = Math.min(LEGITIMACY_MAX, attacker.legitimacy + LEGITIMACY_WAR_WIN_BONUS);
            // Loser: legitimacy and stability penalties
            defender.legitimacy = Math.max(LEGITIMACY_MIN, defender.legitimacy + LEGITIMACY_WAR_LOSS_PENALTY);
            defender.stability = Math.max(STABILITY_MIN, defender.stability + STABILITY_WAR_LOSS_COST);
        } else {
            attacker.military = Math.max(1, Math.floor(attacker.military * (1 - WAR_LOSER_MIL_LOSS)));
            defender.military = Math.max(1, Math.floor(defender.military * (1 - WAR_WINNER_MIL_LOSS)));
            attacker.gold = Math.max(0, attacker.gold - WAR_LOSER_GOLD_LOSS);
            defender.gold = Math.max(0, defender.gold - WAR_WINNER_GOLD_LOSS);

            // Defender wins: legitimacy boost
            defender.legitimacy = Math.min(LEGITIMACY_MAX, defender.legitimacy + LEGITIMACY_WAR_WIN_BONUS);
            // Attacker loses: legitimacy and stability penalties
            attacker.legitimacy = Math.max(LEGITIMACY_MIN, attacker.legitimacy + LEGITIMACY_WAR_LOSS_PENALTY);
            attacker.stability = Math.max(STABILITY_MIN, attacker.stability + STABILITY_WAR_LOSS_COST);
        }

        // Check if either side lost all provinces
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

            // AI war chance modified by own stability
            let effectiveChance = AI_WAR_CHANCE;
            if (country.stability < 0) {
                effectiveChance -= 0.05 * Math.abs(country.stability);
            }
            effectiveChance = Math.max(0, effectiveChance);
            if (Math.random() > effectiveChance) continue;

            // Find adjacent provinces owned by others
            const myProvs = this.getCountryProvinces(id);
            const targets = [];
            for (const myProv of myProvs) {
                for (const adj of (ADJACENCY[myProv] || [])) {
                    const adjOwner = this.provinceOwners[adj];
                    if (adjOwner && adjOwner !== id && this.countries[adjOwner] && this.countries[adjOwner].alive) {
                        // Low legitimacy targets look weaker to AI
                        let requiredRatio = AI_WAR_STRENGTH_RATIO;
                        if (this.countries[adjOwner].legitimacy < AI_LEGITIMACY_WEAKNESS_THRESHOLD) {
                            requiredRatio -= 0.2;
                        }
                        if (country.military > this.countries[adjOwner].military * requiredRatio) {
                            targets.push({ province: adj, defender: adjOwner });
                        }
                    }
                }
            }

            if (targets.length === 0) continue;

            // AI pays stability cost for declaring war
            this.applyWarDeclarationCost(id);

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