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
            { text: "Lower the tariffs", effects: { gold: 20, military: -5 }, outcome: "Trade flourishes, but your soldiers grumble at the merchants' influence." },
            { text: "Deny their request", effects: { gold: -5, military: 5 }, outcome: "The merchants sulk, but your authority goes unquestioned." }
        ]
    },
    {
        id: "bountiful_harvest",
        title: "Bountiful Harvest",
        description: "The fields overflow with grain this year. A rare abundance that could be put to good use.",
        category: "economy",
        weight: 2,
        choices: [
            { text: "Store grain for winter", effects: { gold: 10 }, outcome: "The granaries are full. A wise investment for lean times." },
            { text: "Feast for the troops", effects: { military: 10 }, outcome: "The soldiers feast and sing your praises. Morale soars." },
            { text: "Sell the surplus abroad", effects: { gold: 15, military: -5 }, outcome: "Foreign gold fills your coffers, but the soldiers eye their thin rations." }
        ]
    },
    {
        id: "tax_revolt",
        title: "Tax Revolt",
        description: "Peasants in the countryside refuse to pay their dues. They've barricaded the roads and threaten to march on the capital.",
        category: "economy",
        weight: 1,
        choices: [
            { text: "Send troops to collect", effects: { military: -10, gold: 15 }, outcome: "Order is restored by force. The taxes flow, but resentment festers." },
            { text: "Lower taxes this year", effects: { gold: -15, military: 5 }, outcome: "The peasants cheer your mercy. Loyalty to the crown strengthens." }
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
            { text: "Hire them (-25 gold)", effects: { gold: -25, military: 20 }, outcome: "The mercenaries bolster your ranks. Their skill is worth every coin." },
            { text: "Turn them away", effects: {}, outcome: "The mercenaries shrug and ride on. Perhaps another kingdom will pay." },
            { text: "Press them into service", effects: { military: 10, gold: -5 }, outcome: "They serve, but grudgingly. A few desert in the night with your silver." }
        ]
    },
    {
        id: "border_skirmish",
        title: "Border Skirmish",
        description: "Raiders have been spotted along your frontier. Your border lords demand reinforcements.",
        category: "military",
        weight: 2,
        choices: [
            { text: "Reinforce the border", effects: { gold: -10, military: 10 }, outcome: "The border is secured. Your presence deters further incursions." },
            { text: "Ignore the reports", effects: { military: -5 }, outcome: "The raids continue. Morale among your border troops drops." }
        ]
    },
    {
        id: "military_innovation",
        title: "Military Innovation",
        description: "Your generals propose new battlefield tactics inspired by foreign wars. It would require investment to retrain the army.",
        category: "military",
        weight: 1,
        choices: [
            { text: "Fund the reforms", effects: { gold: -15, military: 15 }, outcome: "The army drills with new formations. Your officers are confident." },
            { text: "Stick with tradition", effects: { gold: 5 }, outcome: "If it was good enough for our fathers, it is good enough for us." }
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
            { text: "Hunt the deserters", effects: { military: -8 }, outcome: "A harsh lesson, but fear keeps the rest in line." },
            { text: "Let them go", effects: { military: -15 }, outcome: "Your ranks thin. You must rely on quality over quantity now." }
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
            { text: "Accept the marriage", effects: { gold: 15 }, outcome: "The wedding is a grand affair. Gold and goodwill flow into your court." },
            { text: "Decline politely", effects: { military: 5 }, outcome: "You show independence. Your court admires your resolve." }
        ]
    },
    {
        id: "spy_uncovered",
        title: "Foreign Spy Uncovered",
        description: "Your guards have captured a spy in the palace. Under questioning, he reveals he was sent by a rival court.",
        category: "diplomacy",
        weight: 1,
        choices: [
            { text: "Execute publicly", effects: { military: 5 }, outcome: "A grim spectacle, but it sends a clear message to your enemies." },
            { text: "Turn him as double agent", effects: { gold: 10 }, outcome: "The spy now serves two masters. His intelligence proves valuable." },
            { text: "Release for goodwill", effects: { gold: 5, military: -3 }, outcome: "A gesture of mercy. Whether it is returned remains to be seen." }
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
            { text: "Enforce strict quarantine", effects: { gold: -15, military: 5 }, outcome: "Trade suffers, but your armies remain strong and healthy." },
            { text: "Keep the ports open", effects: { gold: 10, military: -10 }, outcome: "Gold flows in, but disease ravages your soldiers and workers." }
        ]
    },
    {
        id: "great_fire",
        title: "The Great Fire",
        description: "A devastating fire has consumed a major quarter of your capital. Thousands are homeless and the damage is immense.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Rebuild with crown funds", effects: { gold: -25, military: 5 }, outcome: "The rebuilding effort employs many. The people are grateful." },
            { text: "Levy emergency taxes", effects: { gold: 10, military: -10 }, outcome: "The coffers refill, but the people curse your name." }
        ]
    },
    {
        id: "succession_crisis",
        title: "Succession Crisis",
        description: "Your designated heir is challenged by a rival claimant. Noble factions form on both sides, threatening civil war.",
        category: "disaster",
        weight: 1,
        choices: [
            { text: "Support your heir with gold", effects: { gold: -10, military: 5 }, outcome: "Bribes secure loyalty. Your heir's claim is reinforced." },
            { text: "Let the council decide", effects: { military: -5, gold: 10 }, outcome: "The council chooses pragmatically. Some nobles are displeased." },
            { text: "Name a new heir entirely", effects: { military: -15, gold: 15 }, outcome: "A bold move. Old factions crumble but new resentments form." }
        ]
    }
];

// === EVENT SELECTION ===
const EventSystem = {
    recentEventIds: [],

    selectEvent(gameState) {
        // Filter out recently shown events
        const available = EVENTS.filter(e => !this.recentEventIds.includes(e.id));
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

        return {
            outcome: choice.outcome,
            effects: effects
        };
    }
};