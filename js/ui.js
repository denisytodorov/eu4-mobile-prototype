// === UI CONTROLLER ===
const UI = {
    updateHUD(gameState) {
        const player = gameState.getPlayer();
        const income = gameState.calcIncome(PLAYER_COUNTRY);
        const provCount = gameState.getPlayerProvinces().length;

        document.getElementById("hud-year").textContent = `Year: ${gameState.currentYear}`;
        document.getElementById("hud-military").textContent = Math.floor(player.military);
        document.getElementById("hud-gold").textContent = Math.floor(player.gold);
        document.getElementById("hud-income").textContent = `${income >= 0 ? "+" : ""}${income}/yr | ${provCount} prov.`;
    },

    showDelta(stat, value) {
        const el = document.getElementById(`delta-${stat}`);
        if (!el || value === 0) return;
        el.textContent = value > 0 ? `+${value}` : `${value}`;
        el.className = `stat-delta show ${value > 0 ? "positive" : "negative"}`;
        setTimeout(() => { el.className = "stat-delta"; }, 2000);
    },

    // === DECISION CARD ===
    showDecisionCard(event) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("decision-overlay");
            document.getElementById("card-category").textContent = event.category.toUpperCase();
            document.getElementById("card-title").textContent = event.title;
            document.getElementById("card-description").textContent = event.description;

            const choicesDiv = document.getElementById("card-choices");
            choicesDiv.innerHTML = "";

            event.choices.forEach((choice, i) => {
                const btn = document.createElement("button");
                btn.className = "choice-btn";
                const effectsText = this.formatEffects(choice.effects);
                btn.innerHTML = `
                    <span class="choice-key">${i + 1}</span>
                    ${choice.text}
                    <div class="choice-effects">${effectsText}</div>
                `;
                btn.addEventListener("click", () => {
                    overlay.style.display = "none";
                    this._decisionKeyHandler = null;
                    resolve(i);
                });
                choicesDiv.appendChild(btn);
            });

            overlay.style.display = "flex";

            // Keyboard support
            this._decisionKeyHandler = (e) => {
                const num = parseInt(e.key);
                if (num >= 1 && num <= event.choices.length) {
                    overlay.style.display = "none";
                    this._decisionKeyHandler = null;
                    resolve(num - 1);
                }
            };
        });
    },

    formatEffects(effects) {
        if (!effects || Object.keys(effects).length === 0) return "No effect";
        const parts = [];
        if (effects.gold) {
            const sign = effects.gold > 0 ? "+" : "";
            parts.push(`Gold: ${sign}${effects.gold}`);
        }
        if (effects.military) {
            const sign = effects.military > 0 ? "+" : "";
            parts.push(`Military: ${sign}${effects.military}`);
        }
        return parts.join(" | ");
    },

    // === WAR CONFIRMATION ===
    showWarConfirmation(attackerId, defenderId, provinceId, gameState) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("war-overlay");
            const attacker = gameState.countries[attackerId];
            const defender = gameState.countries[defenderId];
            const provName = PROVINCES[provinceId].name;

            document.getElementById("war-comparison").innerHTML = `
                <div class="war-side">
                    <div class="war-side-name">${attacker.name || COUNTRIES[attackerId].name}</div>
                    <div class="war-side-mil" style="color:var(--military-color)">&#9876; ${Math.floor(attacker.military)}</div>
                    <div style="font-size:12px;color:var(--text-light)">x0.9 (attacker)</div>
                </div>
                <div class="war-vs">VS</div>
                <div class="war-side">
                    <div class="war-side-name">${COUNTRIES[defenderId].name}</div>
                    <div class="war-side-mil" style="color:var(--military-color)">&#9876; ${Math.floor(defender.military)}</div>
                    <div style="font-size:12px;color:var(--text-light)">defending ${provName}</div>
                </div>
            `;

            overlay.style.display = "flex";

            const confirmBtn = document.getElementById("war-confirm");
            const cancelBtn = document.getElementById("war-cancel");

            const cleanup = () => {
                overlay.style.display = "none";
                confirmBtn.replaceWith(confirmBtn.cloneNode(true));
                cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            };

            document.getElementById("war-confirm").addEventListener("click", () => {
                cleanup();
                resolve(true);
            });
            document.getElementById("war-cancel").addEventListener("click", () => {
                cleanup();
                resolve(false);
            });
        });
    },

    // === WAR RESULT ===
    showWarResult(result, attackerName, defenderName) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("war-result-overlay");
            const card = overlay.querySelector(".war-result-card");
            const title = document.getElementById("war-result-title");
            const text = document.getElementById("war-result-text");

            if (result.attackerWins) {
                card.className = "war-result-card victory";
                title.textContent = "Victory!";
                text.innerHTML = `
                    ${attackerName} defeats ${defenderName}!<br>
                    <strong>${result.provinceName}</strong> is now yours.<br><br>
                    <span style="font-size:12px;color:var(--text-light)">
                        Your roll: ${result.attackerRoll} (total: ${result.attackerTotal}) vs
                        Their roll: ${result.defenderRoll} (total: ${result.defenderTotal})
                    </span>
                `;
            } else {
                card.className = "war-result-card defeat";
                title.textContent = "Defeat!";
                text.innerHTML = `
                    ${defenderName} repels ${attackerName}!<br>
                    The attack on <strong>${result.provinceName}</strong> has failed.<br><br>
                    <span style="font-size:12px;color:var(--text-light)">
                        Your roll: ${result.attackerRoll} (total: ${result.attackerTotal}) vs
                        Their roll: ${result.defenderRoll} (total: ${result.defenderTotal})
                    </span>
                `;
            }

            overlay.style.display = "flex";

            const btn = document.getElementById("war-result-ok");
            const newBtn = btn.cloneNode(true);
            btn.replaceWith(newBtn);
            newBtn.addEventListener("click", () => {
                overlay.style.display = "none";
                resolve();
            });
        });
    },

    // === HISTORY LOG ===
    addHistory(year, text, type = "info") {
        const log = document.getElementById("history-log");
        const entry = document.createElement("div");
        entry.className = `history-entry history-${type}`;
        entry.innerHTML = `<span class="history-year">${year}</span> — ${text}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    },

    // === GAME OVER ===
    showEndScreen(gameState) {
        const overlay = document.getElementById("end-overlay");
        const card = overlay.querySelector(".end-card");
        const title = document.getElementById("end-title");
        const text = document.getElementById("end-text");
        const stats = document.getElementById("end-stats");

        const provCount = gameState.getPlayerProvinces().length;
        const player = gameState.getPlayer();

        if (gameState.playerWon) {
            card.className = "end-card victory";
            title.textContent = "Glorious Victory!";
            text.textContent = provCount >= VICTORY_PROVINCE_COUNT
                ? "The Kingdom of France dominates Europe! Your name shall echo through the ages."
                : "The hundred years have passed. France stands strong among the nations of Europe.";
        } else {
            card.className = "end-card defeat";
            title.textContent = "The Kingdom Falls";
            text.textContent = provCount === 0
                ? "France has been consumed by its enemies. The fleur-de-lis flies no more."
                : "The century ends with France diminished. History will judge harshly.";
        }

        stats.innerHTML = `
            <strong>Final Year:</strong> ${gameState.currentYear}<br>
            <strong>Provinces:</strong> ${provCount} of 14<br>
            <strong>Military:</strong> ${Math.floor(player.military)}<br>
            <strong>Gold:</strong> ${Math.floor(player.gold)}<br>
            <strong>Years Played:</strong> ${gameState.currentYear - START_YEAR}
        `;

        overlay.style.display = "flex";

        const btn = document.getElementById("end-restart");
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        newBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            window.startGame();
        });
    },

    setEndTurnEnabled(enabled) {
        const btn = document.getElementById("end-turn-btn");
        btn.disabled = !enabled;
        if (enabled) {
            btn.classList.add("pulse");
        } else {
            btn.classList.remove("pulse");
        }
    }
};