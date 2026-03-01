// === MAIN ===
window.game = null;
let turnInProgress = false;

async function startGame() {
    document.getElementById("start-overlay").style.display = "none";
    window.game = new GameState();
    window.game.init();
    MapController.updateColors(window.game);
    UI.updateHUD(window.game);
    UI.setEndTurnEnabled(true);
    document.getElementById("history-log").innerHTML = "";
    UI.addHistory(START_YEAR, `The year is ${START_YEAR}. You rule the <strong>Kingdom of France</strong>. Expand your realm and secure your legacy.`, "info");
    turnInProgress = false;
}

// Snapshot all 4 player stats
function snapshotPlayer(gs) {
    const p = gs.getPlayer();
    return {
        mil: Math.floor(p.military),
        gold: Math.floor(p.gold),
        stab: p.stability,
        leg: Math.floor(p.legitimacy)
    };
}

// Show deltas for all stats that changed
function showAllDeltas(before, after) {
    UI.showDelta("military", after.mil - before.mil);
    UI.showDelta("gold", after.gold - before.gold);
    UI.showDelta("stability", after.stab - before.stab);
    UI.showDelta("legitimacy", after.leg - before.leg);
}

async function endTurn() {
    if (turnInProgress || !window.game || window.game.gameOver) return;
    turnInProgress = true;
    UI.setEndTurnEnabled(false);

    const gs = window.game;
    const beforeEcon = snapshotPlayer(gs);

    // 1. Advance year
    gs.currentYear++;

    // 2. Economy tick (gold, military recovery, stability/legitimacy drift)
    gs.tickEconomy();

    const afterEcon = snapshotPlayer(gs);
    showAllDeltas(beforeEcon, afterEcon);
    UI.updateHUD(gs);

    // 3. Player event
    const event = EventSystem.selectEvent(gs);
    const choiceIndex = await UI.showDecisionCard(event);
    const result = EventSystem.applyChoice(gs, event, choiceIndex);

    // Show deltas from event effects
    if (result.effects.military) UI.showDelta("military", result.effects.military);
    if (result.effects.gold) UI.showDelta("gold", result.effects.gold);
    if (result.effects.stability) UI.showDelta("stability", result.effects.stability);
    if (result.effects.legitimacy) UI.showDelta("legitimacy", result.effects.legitimacy);
    UI.updateHUD(gs);

    const effectStr = UI.formatEffects(result.effects);
    UI.addHistory(gs.currentYear, `<strong>${event.title}:</strong> ${result.outcome} (${effectStr})`, event.category);

    // 4. AI turns
    const beforeAI = snapshotPlayer(gs);
    const aiResults = gs.runAI();
    for (const r of aiResults) {
        const aName = COUNTRIES[r.attacker].name;
        const dName = COUNTRIES[r.defender].name;
        if (r.attackerWins) {
            UI.addHistory(gs.currentYear, `${aName} conquered <strong>${r.provinceName}</strong> from ${dName}.`, "war");
        } else {
            UI.addHistory(gs.currentYear, `${aName} attacked ${dName} for ${r.provinceName} but was repelled.`, "war");
        }
        MapController.updateColors(gs);
        if (r.attackerWins) MapController.flashProvince(r.province);
    }
    // Show any deltas from AI wars affecting the player
    const afterAI = snapshotPlayer(gs);
    showAllDeltas(beforeAI, afterAI);

    // 5. Check game over
    const endResult = gs.checkGameOver();
    MapController.updateColors(gs);
    UI.updateHUD(gs);

    if (endResult) {
        UI.addHistory(gs.currentYear, endResult.includes("victory") ? "France has triumphed!" : "France has fallen.", "info");
        UI.showEndScreen(gs);
    } else {
        UI.setEndTurnEnabled(true);
    }

    turnInProgress = false;
}

// === PROVINCE CLICK HANDLER ===
MapController.onProvinceClick = async (provId) => {
    if (turnInProgress || !window.game || window.game.gameOver) return;

    const gs = window.game;
    const owner = gs.getProvinceOwner(provId);

    // Can't attack own provinces
    if (owner === PLAYER_COUNTRY) return;

    // Check if we can attack this province
    if (!gs.canAttackProvince(PLAYER_COUNTRY, provId)) return;

    // Show war confirmation
    const confirmed = await UI.showWarConfirmation(PLAYER_COUNTRY, owner, provId, gs);
    if (!confirmed) return;

    turnInProgress = true;
    UI.setEndTurnEnabled(false);

    const beforeWar = snapshotPlayer(gs);

    // Player pays stability cost for declaring war
    gs.applyWarDeclarationCost(PLAYER_COUNTRY);

    const result = gs.resolveWar(PLAYER_COUNTRY, owner, provId);

    await UI.showWarResult(result, COUNTRIES[PLAYER_COUNTRY].name, COUNTRIES[owner].name);

    const afterWar = snapshotPlayer(gs);
    showAllDeltas(beforeWar, afterWar);

    MapController.updateColors(gs);
    UI.updateHUD(gs);

    if (result.attackerWins) {
        MapController.flashProvince(provId);
        UI.addHistory(gs.currentYear, `You conquered <strong>${result.provinceName}</strong>!`, "war");
    } else {
        UI.addHistory(gs.currentYear, `Your attack on <strong>${result.provinceName}</strong> was repelled.`, "war");
    }

    // Check game over after war
    const endResult = gs.checkGameOver();
    if (endResult) {
        UI.showEndScreen(gs);
    } else {
        UI.setEndTurnEnabled(true);
    }

    turnInProgress = false;
};

// === KEYBOARD HANDLER ===
document.addEventListener("keydown", (e) => {
    // Decision card keyboard support
    if (UI._decisionKeyHandler) {
        UI._decisionKeyHandler(e);
        return;
    }

    // End turn on Enter or Space
    if ((e.key === "Enter" || e.key === " ") && !turnInProgress) {
        e.preventDefault();
        endTurn();
    }

    // Escape to close overlays
    if (e.key === "Escape") {
        document.getElementById("war-overlay").style.display = "none";
    }
});

// === END TURN BUTTON ===
document.getElementById("end-turn-btn").addEventListener("click", endTurn);

// === INIT ===
(async function init() {
    await MapController.init();
    await UI.showStartScreen();
    startGame();
})();