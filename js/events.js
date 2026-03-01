// === EVENT SYSTEM ===
const EVENTS = [
    // --- ECONOMY (gold + stability focus, NO military) ---
    {
        id: "merchant_guild",
        title: "Merchant Guild Petition",
        description: "The merchants of Paris demand lower tariffs, promising increased trade. Your treasurer warns it may weaken the crown's authority.",
        category: "economy",
        weight: 2,
        choices: [
            { text: "Lower the tariffs", effects: { gold: 25, stability: -1 }, outcome: "Trade flourishes, but the concession sets a dangerous precedent." },
            { text: "Deny their request", effects: { stability: 1 }, outcome: "The crown's word is final. The merchants grumble but obey." }
        ]
    },
    {
        id: "bountiful_harvest",
        title: "Bountiful Harvest",
        description: "The fields overflow with grain this year. A rare abundance that could be put to good use.",
        category: "economy",
        weight: 2,
        choices: [
            { text: "Store grain for winter", effects: { gold: 10, stability: 1 }, outcome: "The granaries are full. The people rest easy." },
            { text: "Sell the surplus abroad", effects: { gold: 25, stability: -1 }, outcome: "Foreign gold fills your coffers, but the people see their grain leaving." },
            { text: "Distribute to the poor", effects: { legitimacy: 10 }, outcome: "The hungry are fed. Your generosity strengthens your name among the commons." }
        ]
    },
    {
        id: "tax_revolt",
        title: "Tax Revolt",
        description: "Peasants in the countryside refuse to pay their dues. They have barricaded the roads and threaten violence.",
        category: "economy",
        weight: 1,
        choices: [
            { text: "Send troops to collect", effects: { gold: 20, stability: -2 }, outcome: "Order is restored by force. The taxes flow, but tyranny breeds resentment." },
            { text: "Lower taxes this year", effects: { gold: -15, stability: 1, legitimacy: 5 }, outcome: "The peasants cheer your mercy. Loyalty to the crown strengthens." }
        ]
    },

    // --- MILITARY (the ONLY events with +military, always costs gold or other stats) ---
    {
        id: "mercenary_company",
        title: "Mercenary Company Arrives",
        description: "A band of seasoned sell-swords arrives at court, offering their blades. Their captain has a sharp eye and a sharper price.",
        category: "military",
        weight: 2,
        choices: [
            { text: "Hire them (-30 gold)", effects: { gold: -30, military: 20 }, outcome: "The mercenaries bolster your ranks. Coin well spent, if war comes soon." },
            { text: "Turn them away", effects: {}, outcome: "The mercenaries shrug and ride on. Your treasury remains intact." },
            { text: "Press them into service", effects: { military: 10, stability: -1, legitimacy: -10 }, outcome: "They serve grudgingly. Unjust impressment blackens your name." }
        ]
    },
    {
        id: "border_skirmish",
        title: "Border Skirmish",
        description: "Raiders have been spotted along your frontier. Your border lords demand reinforcements.",
        category: "military",
        weight: 2,
        choices: [
            { text: "Reinforce the border", effects: { gold: -10, military: 10 }, outcome: "The border is secured. Your garrison deters further raids." },
            { text: "Ignore the reports", effects: { stability: -1 }, outcome: "The raids continue. Your inaction troubles the frontier lords." }
        ]
    },
    {
        id: "military_innovation",
        title: "Military Innovation",
        description: "Your generals propose new battlefield tactics inspired by foreign wars. Retraining the army would be costly.",
        category: "military",
        weight: 1,
        choices: [
            { text: "Fund the reforms", effects: { gold: -20, military: 15 }, outcome: "The army drills with new formations. A costly investment in your future." },
            { text: "Stick with tradition", effects: { stability: 1 }, outcome: "If it was good enough for our fathers, it suffices. The treasury is spared." }
        ]
    },
    {
        id: "desertion_wave",
        title: "Wave of Desertion",
        description: "Soldiers abandon their posts to return to their farms. The sergeants cannot stop the exodus.",
        category: "military",
        weight: 1,
        choices: [
            { text: "Increase pay", effects: { gold: -20, military: 5 }, outcome: "Coin convinces many to stay. The bleeding slows, but your coffers suffer." },
            { text: "Hunt the deserters", effects: { military: -10, legitimacy: -10 }, outcome: "A harsh lesson. Fear keeps the rest in line, but your cruelty is noted." },
            { text: "Let them go", effects: { military: -15 }, outcome: "Your ranks thin. Sometimes you cannot hold an army by will alone." }
        ]
    },

    // --- DIPLOMACY (legitimacy + gold focus, NO military) ---
    {
        id: "royal_marriage",
        title: "Royal Marriage Proposal",
        description: "A neighboring court proposes a marriage alliance. The bride comes with a handsome dowry and promises of friendship.",
        category: "diplomacy",
        weight: 2,
        choices: [
            { text: "Accept the marriage", effects: { gold: 15, legitimacy: 10 }, outcome: "The wedding is a grand affair. Dynastic prestige and gold flow into your court." },
            { text: "Decline politely", effects: { stability: 1 }, outcome: "You show independence. No foreign entanglements weaken your sovereignty." }
        ]
    },
    {
        id: "spy_uncovered",
        title: "Foreign Spy Uncovered",
        description: "Your guards have captured a spy in the palace. Under questioning, he reveals he was sent by a rival court.",
        category: "diplomacy",
        weight: 1,
        choices: [
            { text: "Execute publicly", effects: { stability: 1, legitimacy: -5 }, outcome: "A grim spectacle shows strength, but the brutality troubles your nobles." },
            { text: "Turn him as double agent", effects: { gold: 10, legitimacy: 5 }, outcome: "Cunning statecraft. The spy now serves you." },
            { text: "Release for goodwill", effects: { legitimacy: 10, gold: -5 }, outcome: "A gesture of magnanimity. Foreign courts note your mercy." }
        ]
    },

    // --- DISASTERS (negative situations, costly, NO military) ---
    {
        id: "plague",
        title: "The Plague Returns",
        description: "Disease spreads through your port cities. Merchants flee, the sick fill the streets, and fear grips the populace.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Enforce strict quarantine", effects: { gold: -15, stability: 1 }, outcome: "Trade suffers, but your responsible governance saves lives." },
            { text: "Keep the ports open", effects: { gold: 10, stability: -2 }, outcome: "Gold flows in, but disease spreads unchecked. The people curse your greed." }
        ]
    },
    {
        id: "great_fire",
        title: "The Great Fire",
        description: "A devastating fire has consumed a major quarter of your capital. Thousands are homeless.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Rebuild with crown funds", effects: { gold: -25, legitimacy: 10, stability: 1 }, outcome: "The people praise your generosity. A stronger capital rises from the ashes." },
            { text: "Levy emergency taxes", effects: { gold: 10, legitimacy: -10, stability: -1 }, outcome: "Exploiting disaster for profit. The coffers refill but your name is cursed." }
        ]
    },
    {
        id: "succession_crisis",
        title: "Succession Crisis",
        description: "Your designated heir is challenged by a rival claimant. Noble factions form on both sides, threatening civil war.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Support your heir with gold", effects: { gold: -15, legitimacy: 15 }, outcome: "Bribes secure loyalty. Your dynasty's claim is reinforced." },
            { text: "Let the council decide", effects: { legitimacy: -10, stability: 1 }, outcome: "The council chooses pragmatically. Your dynasty weakens but order holds." },
            { text: "Name a new heir entirely", effects: { gold: 15, legitimacy: -15 }, outcome: "A bold dynasty break. Old alliances crumble but new gold flows in." }
        ]
    },

    // --- CONDITIONAL EVENTS ---
    {
        id: "peasant_uprising",
        title: "Peasant Uprising",
        description: "Years of instability have driven the common folk to take up arms. A host of angry peasants marches on the capital, demanding justice.",
        category: "disaster",
        weight: 3,
        condition: (gs) => gs.getPlayer().stability <= -2,
        choices: [
            { text: "Negotiate their demands", effects: { gold: -20, stability: 2 }, outcome: "Concessions are costly, but peace returns to the realm." },
            { text: "Crush the rebellion", effects: { military: -15, stability: 1, legitimacy: -10 }, outcome: "Blood restores order, but at terrible cost to your army and your name." }
        ]
    },
    {
        id: "golden_age",
        title: "A Golden Age Dawns",
        description: "Stability and strong rule have brought prosperity. Scholars, artists, and merchants flock to your court. This is an age of greatness.",
        category: "economy",
        weight: 2,
        condition: (gs) => gs.getPlayer().stability >= 2 && gs.getPlayer().legitimacy >= 70,
        choices: [
            { text: "Patronize the arts", effects: { gold: -10, legitimacy: 10, stability: 1 }, outcome: "Your court becomes the envy of Europe. Poets write of your greatness." },
            { text: "Invest in the economy", effects: { gold: 30 }, outcome: "Trade routes multiply. Your treasury overflows." },
            { text: "Expand the military", effects: { military: 20, gold: -15 }, outcome: "A loyal army stands ready. But greatness has a price." }
        ]
    },
    {
        id: "pretender_claimant",
        title: "Pretender to the Throne",
        description: "A distant relative has declared himself the rightful ruler. Several powerful nobles have rallied to his banner.",
        category: "disaster",
        weight: 3,
        condition: (gs) => gs.getPlayer().legitimacy <= 30,
        choices: [
            { text: "Bribe the nobles back", effects: { gold: -30, legitimacy: 15 }, outcome: "Gold speaks louder than blood. The nobles return, the pretender flees." },
            { text: "March against the pretender", effects: { military: -10, legitimacy: 10, stability: -1 }, outcome: "The pretender falls, but the realm is shaken." },
            { text: "Offer the pretender a title", effects: { legitimacy: -5, stability: 1 }, outcome: "A compromise. His ambitions may linger." }
        ]
    },
    {
        id: "church_blessing",
        title: "Blessing of the Church",
        description: "The Pope acknowledges your just rule and sends a papal legate bearing gifts and blessings.",
        category: "diplomacy",
        weight: 2,
        condition: (gs) => gs.getPlayer().stability >= 1 && gs.getPlayer().legitimacy >= 50,
        choices: [
            { text: "Accept the blessing humbly", effects: { legitimacy: 10, stability: 1 }, outcome: "The church's endorsement strengthens your claim. The people rejoice." },
            { text: "Request a crusade tithe", effects: { gold: 20, legitimacy: -5 }, outcome: "The church opens its coffers, but questions your piety." }
        ]
    }
];

// === EVENT SELECTION ===
const EventSystem = {
    recentEventIds: [],

    selectEvent(gameState) {
        // Filter out recently shown events and those whose conditions aren't met
        const available = EVENTS.filter(e => {
            if (this.recentEventIds.includes(e.id)) return false;
            if (e.condition && !e.condition(gameState)) return false;
            return true;
        });
        if (available.length === 0) {
            this.recentEventIds = [];
            return this.selectEvent(gameState);
        }

        // Weighted random selection
        const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;
        for (const event of available) {
            roll -= event.weight;
            if (roll <= 0) {
                this.recentEventIds.push(event.id);
                if (this.recentEventIds.length > 5) {
                    this.recentEventIds.shift();
                }
                return event;
            }
        }
        return available[0]; // fallback
    },

    applyChoice(gameState, event, choiceIndex) {
        const choice = event.choices[choiceIndex];
        const player = gameState.getPlayer();
        const effects = choice.effects || {};

        if (effects.gold) player.gold = Math.max(0, player.gold + effects.gold);
        if (effects.military) player.military = Math.max(1, player.military + effects.military);
        if (effects.stability) {
            player.stability = Math.max(STABILITY_MIN, Math.min(STABILITY_MAX, player.stability + effects.stability));
        }
        if (effects.legitimacy) {
            player.legitimacy = Math.max(LEGITIMACY_MIN, Math.min(LEGITIMACY_MAX, player.legitimacy + effects.legitimacy));
        }

        return {
            outcome: choice.outcome,
            effects: effects
        };
    }
};