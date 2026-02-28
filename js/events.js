// === EVENT SYSTEM ===
const EVENTS = [
    // --- ECONOMY ---
    {
        id: "merchant_guild",
        title: "Merchant Guild Petition",
        description: "The merchants of Paris demand lower tariffs, promising increased trade. Your treasurer warns it may weaken the crown's authority.",
        category: "economy",
        weight: 2,
        choices: [
            { text: "Lower the tariffs", effects: { gold: 20, military: -5, stability: -1 }, outcome: "Trade flourishes, but populist concessions undermine your authority." },
            { text: "Deny their request", effects: { gold: -5, military: 5, legitimacy: 5 }, outcome: "The crown's word is law. Your authority goes unquestioned." }
        ]
    },
    {
        id: "bountiful_harvest",
        title: "Bountiful Harvest",
        description: "The fields overflow with grain this year. A rare abundance that could be put to good use.",
        category: "economy",
        weight: 2,
        choices: [
            { text: "Store grain for winter", effects: { gold: 10, stability: 1 }, outcome: "The granaries are full. Prudent governance earns the people's trust." },
            { text: "Feast for the troops", effects: { military: 10 }, outcome: "The soldiers feast and sing your praises. Morale soars." },
            { text: "Sell the surplus abroad", effects: { gold: 15, military: -5, stability: -1 }, outcome: "Foreign gold fills your coffers, but the people see their grain leaving." }
        ]
    },
    {
        id: "tax_revolt",
        title: "Tax Revolt",
        description: "Peasants in the countryside refuse to pay their dues. They've barricaded the roads and threaten to march on the capital.",
        category: "economy",
        weight: 1,
        choices: [
            { text: "Send troops to collect", effects: { military: -10, gold: 15, stability: -1, legitimacy: -5 }, outcome: "Order is restored by force. The taxes flow, but tyranny breeds resentment." },
            { text: "Lower taxes this year", effects: { gold: -15, military: 5, stability: 1, legitimacy: 5 }, outcome: "The peasants cheer your mercy. Loyalty to the crown strengthens." }
        ]
    },

    // --- MILITARY ---
    {
        id: "mercenary_company",
        title: "Mercenary Company Arrives",
        description: "A band of seasoned sell-swords arrives at court, offering their blades. Their captain has a sharp eye and a sharper price.",
        category: "military",
        weight: 2,
        choices: [
            { text: "Hire them (-25 gold)", effects: { gold: -25, military: 20, legitimacy: -5 }, outcome: "The mercenaries bolster your ranks, but relying on foreigners weakens your image." },
            { text: "Turn them away", effects: {}, outcome: "The mercenaries shrug and ride on. Perhaps another kingdom will pay." },
            { text: "Press them into service", effects: { military: 10, gold: -5, stability: -1 }, outcome: "They serve grudgingly. A few desert in the night — unjust impressment breeds contempt." }
        ]
    },
    {
        id: "border_skirmish",
        title: "Border Skirmish",
        description: "Raiders have been spotted along your frontier. Your border lords demand reinforcements.",
        category: "military",
        weight: 2,
        choices: [
            { text: "Reinforce the border", effects: { gold: -10, military: 10, stability: 1 }, outcome: "The border is secured. Your presence restores order to the frontier." },
            { text: "Ignore the reports", effects: { military: -5, legitimacy: -5 }, outcome: "The raids continue. Your inaction makes the crown look weak." }
        ]
    },
    {
        id: "military_innovation",
        title: "Military Innovation",
        description: "Your generals propose new battlefield tactics inspired by foreign wars. It would require investment to retrain the army.",
        category: "military",
        weight: 1,
        choices: [
            { text: "Fund the reforms", effects: { gold: -15, military: 15, legitimacy: 5 }, outcome: "The army drills with new formations. Progressive leadership earns respect." },
            { text: "Stick with tradition", effects: { gold: 5, stability: 1 }, outcome: "If it was good enough for our fathers, it is good enough for us. No disruption." }
        ]
    },
    {
        id: "desertion_wave",
        title: "Wave of Desertion",
        description: "Soldiers abandon their posts to return to their farms. The sergeants cannot stop the exodus.",
        category: "military",
        weight: 1,
        choices: [
            { text: "Increase pay", effects: { gold: -20, military: 5 }, outcome: "Coin convinces many to stay. The bleeding slows." },
            { text: "Hunt the deserters", effects: { military: -8, stability: -1, legitimacy: -5 }, outcome: "A harsh lesson. Fear keeps the rest in line, but your cruelty is noted." },
            { text: "Let them go", effects: { military: -15, legitimacy: -5 }, outcome: "Your ranks thin. A weak king cannot hold his army together." }
        ]
    },

    // --- DIPLOMACY ---
    {
        id: "royal_marriage",
        title: "Royal Marriage Proposal",
        description: "A neighboring court proposes a marriage alliance. The bride comes with a handsome dowry and promises of friendship.",
        category: "diplomacy",
        weight: 2,
        choices: [
            { text: "Accept the marriage", effects: { gold: 15, legitimacy: 10 }, outcome: "The wedding is a grand affair. Dynastic prestige and gold flow into your court." },
            { text: "Decline politely", effects: { military: 5, stability: 1 }, outcome: "You show independence. Your court admires your resolve. No entanglements." }
        ]
    },
    {
        id: "spy_uncovered",
        title: "Foreign Spy Uncovered",
        description: "Your guards have captured a spy in the palace. Under questioning, he reveals he was sent by a rival court.",
        category: "diplomacy",
        weight: 1,
        choices: [
            { text: "Execute publicly", effects: { military: 5, stability: 1, legitimacy: -5 }, outcome: "A grim spectacle shows strength, but the brutality troubles your nobles." },
            { text: "Turn him as double agent", effects: { gold: 10, legitimacy: 5 }, outcome: "Cunning statecraft. The spy now serves you, and your court is impressed." },
            { text: "Release for goodwill", effects: { gold: 5, military: -3, stability: -1 }, outcome: "A gesture of mercy. The people question why a spy walks free." }
        ]
    },

    // --- DISASTERS ---
    {
        id: "plague",
        title: "The Plague Returns",
        description: "Disease spreads through your port cities. Merchants flee, the sick fill the streets, and fear grips the populace.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Enforce strict quarantine", effects: { gold: -15, military: 5, stability: -1, legitimacy: 5 }, outcome: "Trade suffers and the quarantine is unpopular, but your responsible leadership saves lives." },
            { text: "Keep the ports open", effects: { gold: 10, military: -10, stability: -1 }, outcome: "Gold flows in, but disease ravages your soldiers. Unrest grows." }
        ]
    },
    {
        id: "great_fire",
        title: "The Great Fire",
        description: "A devastating fire has consumed a major quarter of your capital. Thousands are homeless and the damage is immense.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Rebuild with crown funds", effects: { gold: -25, military: 5, stability: 1, legitimacy: 10 }, outcome: "The people praise your generosity. A stronger capital rises from the ashes." },
            { text: "Levy emergency taxes", effects: { gold: 10, military: -10, stability: -1, legitimacy: -10 }, outcome: "Exploiting disaster for profit. The coffers refill but the people curse your name." }
        ]
    },
    {
        id: "succession_crisis",
        title: "Succession Crisis",
        description: "Your designated heir is challenged by a rival claimant. Noble factions form on both sides, threatening civil war.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Support your heir with gold", effects: { gold: -10, military: 5, legitimacy: 10 }, outcome: "Bribes secure loyalty. Your dynasty's claim is reinforced." },
            { text: "Let the council decide", effects: { military: -5, gold: 10, legitimacy: -10, stability: 1 }, outcome: "The council chooses pragmatically. Stability holds, but your dynasty weakens." },
            { text: "Name a new heir entirely", effects: { military: -15, gold: 15, legitimacy: -15 }, outcome: "A bold dynasty break. Old factions crumble but deep resentments form." }
        ]
    },

    // --- CONDITIONAL EVENTS (new) ---
    {
        id: "peasant_uprising",
        title: "Peasant Uprising",
        description: "Years of instability have driven the common folk to take up arms. A host of angry peasants marches on the capital, demanding justice.",
        category: "disaster",
        weight: 3,
        condition: (gs) => gs.getPlayer().stability <= -2,
        choices: [
            { text: "Negotiate their demands", effects: { gold: -20, stability: 1, legitimacy: 5 }, outcome: "You meet the peasant leaders. Concessions are made, but peace is restored." },
            { text: "Crush the rebellion", effects: { military: -15, stability: 1, legitimacy: -10 }, outcome: "The uprising is put down with blood. Order returns, but at a terrible cost to your name." }
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
            { text: "Invest in the economy", effects: { gold: 30, stability: 1 }, outcome: "Trade routes multiply. Your treasury overflows." },
            { text: "Expand the military", effects: { military: 20, legitimacy: 5 }, outcome: "A well-fed, loyal army stands ready. Your enemies take notice." }
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
            { text: "March against the pretender", effects: { military: -10, legitimacy: 10, stability: -1 }, outcome: "The pretender is captured. His followers scatter, but the realm is shaken." },
            { text: "Offer the pretender a title", effects: { legitimacy: -5, stability: 1 }, outcome: "A compromise. The pretender accepts a duchy, but his ambitions may linger." }
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
            { text: "Request a crusade tithe", effects: { gold: 20, legitimacy: 5 }, outcome: "The church opens its coffers. Faith and coin flow into your realm." }
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