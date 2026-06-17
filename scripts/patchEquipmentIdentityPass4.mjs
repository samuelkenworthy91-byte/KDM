import fs from 'fs';

const ALL_DECK_CARDS_PATH = 'all_deck_cards.json';
const GEAR_MASTER_OVERHAUL_PATH = 'gear_master_overhaul.json';

function patchCards(cards) {
  const patchMap = {
    // Group #1: block 5 + nextPartyMember block 1 (Reaction cost 1)
    "phoenixCrownFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 5 damage. Aura: all survivors deal +1 damage. Gain Panic 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the head slot. Aura: all survivors deal +1 damage until end of combat. Gain Panic 1. If played as your second card this turn, reduce your next card cost by 1.";
      delete card.partyBlock;
      card.aura = { type: "globalDamageBonus", amount: 1, duration: "combat" };
      card.panicGain = 1;
    },
    "hideTreadsFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 4 damage. Target Avoidance 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage with the legs slot. Gain Target Avoidance 2. The quarry targets this survivor next unless another card redirects it.";
      card.block = 4;
      delete card.partyBlock;
      card.targetAvoidance = 2;
    },
    "oxidizedLanternCrownFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 4 damage. Aura: all Block cards gain +1 block. Exhaust.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage with the head slot. Aura: all Block cards gain +1 block until end of combat. Exhaust this card.";
      card.block = 4;
      delete card.partyBlock;
      card.aura = { type: "globalBlockCardBonus", amount: 1, duration: "combat" };
      card.exhaust = "True";
    },
    "paleHunterSkirtFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 5 damage. Next survivor deals +2 damage.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the waist slot. The next survivor gains +2 damage on their next attack. If the quarry is Marked, draw 1 then discard 1.";
      delete card.partyBlock;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
    },
    "stitchedHideGlovesFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 5 damage. Give next ally Guarded 2. Prepared 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the arms slot. Then the next ally gains Guarded 2. Gain Prepared 1. If the quarry is Marked, add +1 damage.";
      card.partyBlock = 2;
      card.prepared = 1;
    },

    // Group #2: block 6 + nextPartyMember block 1 (Reaction cost 2)
    "phoenixGauntletFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 6 damage. Prepared 1. Next survivor deals +2 damage.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage. Gain Prepared 1. The next survivor deals +2 damage with their next attack.";
      delete card.partyBlock;
      card.prepared = 1;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
    },
    "furWebsilkCuffsFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 4 damage. Target Avoidance 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage with the arms slot. Gain Target Avoidance 2.";
      card.block = 4;
      delete card.partyBlock;
      card.targetAvoidance = 2;
    },
    "lanternGreavesFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 6 damage. Consequence Reduction 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage with the legs slot. Gain Consequence Reduction 1.";
      delete card.partyBlock;
      card.consequenceReduction = 1;
    },
    "lanternMailFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 8 damage. Aura: block does not decay. Exhaust.";
      card.fullEffect = "After incoming damage is previewed, prevent 8 damage with the body slot. Aura: block does not decay until the end of the next monster turn. Exhaust this card.";
      card.block = 8;
      delete card.partyBlock;
      card.aura = { type: "blockPersistsUntilRoundEnd", amount: 1, duration: "nextMonsterTurn" };
      card.exhaust = "True";
    },
    "paleHunterGlovesFittedPlate": card => {
      card.shortEffect = "After damage is previewed, prevent 5 damage. Mark the quarry.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the arms slot. Apply Marked 1 to the quarry.";
      card.block = 5;
      delete card.partyBlock;
      card.statusApplied = { "Marked": 1 };
    },

    // Group #3: block 3 + guardSelf 1 (Skill cost 1) - Brace
    "clothBracersBrace": card => {
      card.shortEffect = "Brace: gain 2 block, Target Avoidance 1, Prepared 1.";
      card.fullEffect = "Brace with Cloth Bracers: gain 2 block, Target Avoidance 1, and Prepared 1.";
      card.block = 2;
      card.targetAvoidance = 1;
      card.prepared = 1;
      delete card.guarded;
      card.statusApplied = {};
    },
    "furLegWarmersBrace": card => {
      card.shortEffect = "Brace: gain 3 block, Target Avoidance 1, Consequence Reduction 1.";
      card.fullEffect = "Brace with Fur Leg Warmers: gain 3 block, Target Avoidance 1, and Consequence Reduction 1.";
      card.targetAvoidance = 1;
      card.consequenceReduction = 1;
      delete card.guarded;
      card.statusApplied = {};
    },
    "paleHunterSkirtBrace": card => {
      card.shortEffect = "Brace: gain 3 block, Mark 1.";
      card.fullEffect = "Brace with Pale Hunter Skirt: gain 3 block and apply Marked 1.";
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
    },
    "stitchedHideHeadbandBrace": card => {
      card.shortEffect = "Brace: gain 2 block. Aura: next survivor deals +1 damage.";
      card.fullEffect = "Brace with Stitched Hide Headband: gain 2 block. Aura: the next survivor deals +1 damage on their next attack.";
      card.block = 2;
      delete card.guarded;
      card.statusApplied = {};
      card.aura = { type: "nextSurvivorDamageBonus", amount: 1, duration: "nextUse" };
    },
    "websilkenArmorSetBrace": card => {
      card.shortEffect = "Brace: gain 3 block. Aura: DoT damage x2. Exhaust.";
      card.fullEffect = "Brace with Websilken Armor Set: gain 3 block. Aura: Bleed, Burn and Poison deal double damage until end of combat. Exhaust this card.";
      delete card.guarded;
      card.statusApplied = {};
      card.aura = { type: "dotDamageMultiplier", amount: 2, duration: "combat" };
      card.exhaust = "True";
    },

    // Group #5: guardSelf 1 + addPanic 1 (Skill cost 0) - Omens
    "blueCharmOmen": card => {
      card.shortEffect = "Omen: blue aura. Next survivor gains +2 block. Gain Panic 1.";
      card.fullEffect = "Until used, the next survivor gains +2 block on their next Block card. Gain Panic 1.";
      delete card.guarded;
      card.statusApplied = {};
      card.aura = { type: "nextSurvivorBlockBonus", amount: 2, duration: "nextUse" };
      card.panicGain = 1;
    },
    "crestCrownOmen": card => {
      card.shortEffect = "Omen: crown insight. Mark 1 and reveal tell. Gain Panic 1.";
      card.fullEffect = "Apply Marked 1 and reveal the quarry's next intent. Gain Panic 1.";
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
      card.reveal = 1;
      card.panicGain = 1;
    },
    "greenRingOmen": card => {
      card.shortEffect = "Omen: green light. Next survivor gains Target Avoidance 2. Gain Panic 1.";
      card.fullEffect = "Until used, the next survivor gains Target Avoidance 2. Gain Panic 1.";
      delete card.guarded;
      card.statusApplied = {};
      card.aura = { type: "nextSurvivorTargetAvoidance", amount: 2, duration: "nextUse" };
      card.panicGain = 1;
    },
    "manVisageOmen": card => {
      card.shortEffect = "Omen: man's stoicism. Consequence Reduction 2. Gain Panic 1.";
      card.fullEffect = "Gain Consequence Reduction 2 for the rest of the turn. Gain Panic 1.";
      delete card.guarded;
      card.statusApplied = {};
      card.consequenceReduction = 2;
      card.panicGain = 1;
    },
    "scarabCircletOmen": card => {
      card.shortEffect = "Omen: scarab buzz. Prepared 2. Gain Panic 1.";
      card.fullEffect = "Gain Prepared 2. Gain Panic 1.";
      delete card.guarded;
      card.statusApplied = {};
      card.prepared = 2;
      card.panicGain = 1;
    },

    // Group #6: block 2 + guardSelf 1 (Skill cost 1) - Techniques/Braces
    "clawHeadArrowTechnique": card => {
      card.shortEffect = "Technique: Mark 1 and queue +2 damage for the next survivor.";
      card.fullEffect = "Apply Marked 1 and the next survivor gains +2 damage on their next attack.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
    },
    "heavySkullCrownBrace": card => {
      card.shortEffect = "Brace: gain 4 block and Consequence Reduction 1.";
      card.fullEffect = "Brace with Heavy Skull Crown: gain 4 block and Consequence Reduction 1.";
      card.block = 4;
      delete card.guarded;
      card.statusApplied = {};
      card.consequenceReduction = 1;
    },
    "oxidizedRingWhipTechnique": card => {
      card.shortEffect = "Technique: Snare 1 and Target Avoidance 2.";
      card.fullEffect = "Apply Snared 1 to the quarry. Gain Target Avoidance 2.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Snared": 1 };
      card.targetAvoidance = 2;
    },
    "scrapBladeTechnique": card => {
      card.shortEffect = "Technique: Bleed 1 and Prepared 1.";
      card.fullEffect = "Apply Bleed 1 to the quarry. Gain Prepared 1.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Bleed": 1 };
      card.prepared = 1;
    },
    "skullcapHammerTechnique": card => {
      card.shortEffect = "Technique: Stagger 1, Vulnerable 1. Gain Panic 1.";
      card.fullEffect = "Apply Staggered 1 and Vulnerable 1 to the quarry. Gain Panic 1.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Staggered": 1, "Vulnerable": 1 };
      card.panicGain = 1;
    },

    // Additional Splitting - Pass 2
    "phoenixGreavesBrace": card => {
      card.shortEffect = "Brace: gain 2 block, Target Avoidance 1. Aura: next survivor deals +1 damage.";
      card.fullEffect = "Brace with Ash Phoenix Greaves: gain 2 block, Target Avoidance 1. Aura: the next survivor deals +1 damage on their next attack.";
      card.block = 2;
      card.targetAvoidance = 1;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 1, duration: "nextUse" };
      delete card.consequenceReduction;
    },
    "paleHunterTreadsBrace": card => {
      card.shortEffect = "Brace: gain 3 block, Target Avoidance 2, Mark 1.";
      card.fullEffect = "Brace with Pale Hunter Treads: gain 3 block, Target Avoidance 2, and apply Marked 1.";
      card.targetAvoidance = 2;
      card.statusApplied = { "Marked": 1 };
      delete card.consequenceReduction;
    },
    "wailingLegWarmersBrace": card => {
      card.shortEffect = "Brace: gain 4 block and Consequence Reduction 1.";
      card.fullEffect = "Brace with Wailing Leg Warmers: gain 4 block and Consequence Reduction 1.";
      card.block = 4;
      card.consequenceReduction = 1;
      delete card.targetAvoidance;
    },
    "websilkTreadsBrace": card => {
      card.shortEffect = "Brace: gain 2 block, Target Avoidance 2, Snare 1.";
      card.fullEffect = "Brace with Websilk Treads: gain 2 block, Target Avoidance 2, and apply Snared 1.";
      card.block = 2;
      card.targetAvoidance = 2;
      card.statusApplied = { "Snared": 1 };
      delete card.consequenceReduction;
    },

    "phoenixGreavesFittedPlate": card => {
      card.shortEffect = "After damage: prevent 7 damage. Aura: next survivor deals +2 damage. Gain Panic 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 7 damage. Aura: the next survivor deals +2 damage on their next attack. Gain Panic 1.";
      delete card.partyBlock;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
      card.panicGain = 1;
    },
    "duskHunterArmorSetSetline": card => {
      card.shortEffect = "After damage: prevent 8 damage. Consequence Reduction 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 8 damage with the set slot. Gain Consequence Reduction 1.";
      card.block = 8;
      delete card.partyBlock;
      card.consequenceReduction = 1;
    },
    "hideBracersFittedPlate": card => {
      card.shortEffect = "After damage: prevent 5 damage. Give next ally Guarded 2. Prepared 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the arms slot. Then the next ally gains Guarded 2. Gain Prepared 1.";
      card.block = 5;
      card.partyBlock = 2;
      card.prepared = 1;
    },
    "lanternCuirassFittedPlate": card => {
      card.shortEffect = "After damage: prevent 7 damage. Aura: block does not decay. Exhaust.";
      card.fullEffect = "After incoming damage is previewed, prevent 7 damage with the body slot. Aura: block does not decay until the end of the next monster turn. Exhaust this card.";
      delete card.partyBlock;
      card.aura = { type: "blockPersistsUntilRoundEnd", amount: 1, duration: "nextMonsterTurn" };
      card.exhaust = "True";
    },
    "paleHunterTreadsFittedPlate": card => {
      card.shortEffect = "After damage: prevent 6 damage. Target Avoidance 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage with the legs slot. Gain Target Avoidance 2.";
      card.block = 6;
      delete card.partyBlock;
      card.targetAvoidance = 2;
    },

    "gormentTreadsBrace": card => {
      card.shortEffect = "Brace: gain 6 block and Consequence Reduction 1.";
      card.fullEffect = "Brace with Godling Stormhide Treads: gain 6 block and Consequence Reduction 1.";
      card.block = 6;
      card.consequenceReduction = 1;
      delete card.guarded;
      card.statusApplied = {};
    },
    "greenKnightArmorSetBrace": card => {
      card.shortEffect = "Brace: gain 5 block. Aura: all Block cards gain +1 block. Exhaust.";
      card.fullEffect = "Brace with Green Knight Armor Set: gain 5 block. Aura: all Block cards gain +1 block until end of combat. Exhaust this card.";
      card.aura = { type: "globalBlockCardBonus", amount: 1, duration: "combat" };
      card.exhaust = "True";
      delete card.guarded;
      card.statusApplied = {};
    },
    "lanternCuirassBrace": card => {
      card.shortEffect = "Brace: gain 4 block and Guarded 2.";
      card.fullEffect = "Brace with Lantern Cuirass: gain 4 block and Guarded 2.";
      card.block = 4;
      card.statusApplied = { "Guarded": 2 };
      delete card.guarded;
    },
    "skullCrownBrace": card => {
      card.shortEffect = "Brace: gain 3 block. Mark 1 and reveal tell.";
      card.fullEffect = "Brace with Skull Crown: gain 3 block. Apply Marked 1 and reveal the quarry's next intent.";
      card.block = 3;
      card.statusApplied = { "Marked": 1 };
      card.reveal = 1;
      delete card.guarded;
    },

    "phoenixArmorSetBrace": card => {
      card.shortEffect = "Brace: gain 4 block. Aura: DoT damage x2. Exhaust.";
      card.fullEffect = "Brace with Ash Phoenix Armor Set: gain 4 block. Aura: Bleed, Burn and Poison deal double damage until end of combat. Exhaust this card.";
      card.aura = { type: "dotDamageMultiplier", amount: 2, duration: "combat" };
      card.exhaust = "True";
      delete card.consequenceReduction;
      delete card.guarded;
      card.statusApplied = {};
    },
    "gormentSuitBrace": card => {
      card.shortEffect = "Brace: gain 5 block and Consequence Reduction 2.";
      card.fullEffect = "Brace with Godling Stormhide Suit: gain 5 block and Consequence Reduction 2.";
      card.block = 5;
      card.consequenceReduction = 2;
      delete card.guarded;
      card.statusApplied = {};
    },
    "hardBreastplateBrace": card => {
      card.shortEffect = "Brace: gain 6 block and Guarded 1.";
      card.fullEffect = "Brace with Hard Breastplate: gain 6 block and Guarded 1.";
      card.block = 6;
      card.statusApplied = { "Guarded": 1 };
      delete card.consequenceReduction;
      delete card.guarded;
    },
    "tabardBrace": card => {
      card.shortEffect = "Brace: gain 4 block. Aura: all survivors deal +1 damage. Exhaust.";
      card.fullEffect = "Brace with Tabard: gain 4 block. Aura: all survivors deal +1 damage until end of combat. Exhaust this card.";
      card.aura = { type: "globalDamageBonus", amount: 1, duration: "combat" };
      card.exhaust = "True";
      delete card.consequenceReduction;
      delete card.guarded;
      card.statusApplied = {};
    },

    // Techniques - Pass 3
    "calcifiedGramberBladeTechnique": card => {
      card.shortEffect = "Technique: Bleed 1 and Prepared 1. Queue +1 damage for next survivor.";
      card.fullEffect = "Apply Bleed 1 to the quarry. Gain Prepared 1. The next survivor gains +1 damage on their next attack.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Bleed": 1 };
      card.prepared = 1;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 1, duration: "nextUse" };
    },
    "inkBloodBowTechnique": card => {
      card.shortEffect = "Technique: Mark 1 and queue +2 damage for the next survivor.";
      card.fullEffect = "Apply Marked 1 and the next survivor gains +2 damage on their next attack.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
    },
    "switchPoleaxeTechnique": card => {
      card.shortEffect = "Technique: +2 break damage, Mark 1. Queue +1 damage for next survivor.";
      card.fullEffect = "Gain +2 break damage and apply Marked 1. The next survivor gains +1 damage on their next attack.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
      card.breakDamage = 2; // Wait, check if breakDamage is used
      card.aura = { type: "nextSurvivorDamageBonus", amount: 1, duration: "nextUse" };
    },
    "hollowBladeTechnique": card => {
      card.shortEffect = "Technique: Poison 1 and Target Avoidance 1.";
      card.fullEffect = "Apply Poison 1 to the quarry. Gain Target Avoidance 1.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Poison": 1 };
      card.targetAvoidance = 1;
    },
    "oxidizedLanternGlaiveTechnique": card => {
      card.shortEffect = "Technique: Mark 1 and Vulnerable 1.";
      card.fullEffect = "Apply Marked 1 and Vulnerable 1 to the quarry.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Marked": 1, "Vulnerable": 1 };
    },
    "phaseAxeTechnique": card => {
      card.shortEffect = "Technique: Stagger 1 and +1 break damage.";
      card.fullEffect = "Apply Staggered 1 to the quarry and gain +1 break damage.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Staggered": 1 };
      card.breakDamage = 1;
    },

    // Omens - Pass 3
    "bluePowerCoreOmen": card => {
      card.shortEffect = "Omen: blue core. Aura: all Block cards gain +1 block. Gain Panic 2.";
      card.fullEffect = "Until end of combat, all Block cards gain +1 block. Gain Panic 2.";
      delete card.guarded;
      card.aura = { type: "globalBlockCardBonus", amount: 1, duration: "combat" };
      card.panicGain = 2;
    },
    "quiverAndNoonStringOmen": card => {
      card.shortEffect = "Omen: noon string. Queue +2 damage for the next survivor. Gain Panic 1.";
      card.fullEffect = "The next survivor deals +2 damage with their next attack. Gain Panic 1.";
      delete card.guarded;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
      card.panicGain = 1;
    },
    "redPowerCoreOmen": card => {
      card.shortEffect = "Omen: red core. Aura: all survivors deal +1 damage. Gain Panic 2.";
      card.fullEffect = "Until end of combat, all survivors deal +1 damage. Gain Panic 2.";
      delete card.guarded;
      card.aura = { type: "globalDamageBonus", amount: 1, duration: "combat" };
      card.panicGain = 2;
    },

    // Final Fixes - Pass 4
    "clawHeadArrowTechnique": card => {
      card.shortEffect = "Technique: Mark 1, Prepared 1. Queue +2 damage for next survivor.";
      card.fullEffect = "Apply Marked 1 and gain Prepared 1. The next survivor gains +2 damage on their next attack.";
      card.block = 0;
      delete card.guarded;
      card.statusApplied = { "Marked": 1 };
      card.prepared = 1;
      card.aura = { type: "nextSurvivorDamageBonus", amount: 2, duration: "nextUse" };
    },
    "hideSkirtFittedPlate": card => {
      card.shortEffect = "After damage: prevent 6 damage. Give next ally Guarded 1. Prepared 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage with the waist slot. Then the next ally gains Guarded 1. Gain Prepared 1.";
      card.block = 6;
      card.partyBlock = 1;
      card.prepared = 1;
    },
    "shadowFurCrownFittedPlate": card => {
      card.shortEffect = "After damage: prevent 5 damage. Mark 1. Give next ally Guarded 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage with the head slot. Apply Marked 1 to the quarry. Then the next ally gains Guarded 1.";
      card.block = 5;
      card.partyBlock = 1;
      card.statusApplied = { "Marked": 1 };
    },
    "spectralHunterCloakFittedPlate": card => {
      card.shortEffect = "After damage: prevent 6 damage. Target Avoidance 1.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage with the body slot. Gain Target Avoidance 1.";
      card.block = 6;
      delete card.partyBlock;
      card.targetAvoidance = 1;
    },

    // Final Fixes - Pass 5 (Groups #1 and #3)
    "armorSpikesFittedPlate": card => {
      card.shortEffect = "After damage: prevent 4 damage. Give next ally Guarded 3.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage. Then the next ally gains Guarded 3.";
      card.block = 4;
      card.partyBlock = 3;
    },
    "calcifiedGreavesFittedPlate": card => {
      card.shortEffect = "After damage: prevent 3 damage. Consequence Reduction 1. Give next ally Guarded 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 3 damage with the legs slot. Gain Consequence Reduction 1. Then the next ally gains Guarded 2.";
      card.block = 3;
      card.consequenceReduction = 1;
      card.partyBlock = 2;
    },
    "clothBracersFittedPlate": card => {
      card.shortEffect = "After damage: prevent 4 damage. Prepared 1. Give next ally Guarded 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage with the arms slot. Gain Prepared 1. Then the next ally gains Guarded 2.";
      card.block = 4;
      card.prepared = 1;
      card.partyBlock = 2;
    },
    "websilkenArmorSetSetline": card => {
      card.shortEffect = "After damage: prevent 4 damage. Give next ally Guarded 2. Aura: DoT damage x2. Exhaust.";
      card.fullEffect = "After incoming damage is previewed, prevent 4 damage with the set slot. Then the next ally gains Guarded 2. Aura: Bleed, Burn and Poison deal double damage until end of combat. Exhaust this card.";
      card.block = 4;
      card.partyBlock = 2;
      card.aura = { type: "dotDamageMultiplier", amount: 2, duration: "combat" };
      card.exhaust = "True";
    },

    "centuryShoulderPadsFittedPlate": card => {
      card.shortEffect = "After damage: prevent 6 damage. Give next ally Guarded 3.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage. Then the next ally gains Guarded 3.";
      card.block = 6;
      card.partyBlock = 3;
    },
    "gormentTreadsFittedPlate": card => {
      card.shortEffect = "After damage: prevent 5 damage. Consequence Reduction 1. Give next ally Guarded 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 5 damage. Gain Consequence Reduction 1. Then the next ally gains Guarded 2.";
      card.block = 5;
      card.consequenceReduction = 1;
      card.partyBlock = 2;
    },
    "websilkSashFittedPlate": card => {
      card.shortEffect = "After damage: prevent 6 damage. Target Avoidance 1. Give next ally Guarded 2.";
      card.fullEffect = "After incoming damage is previewed, prevent 6 damage with the waist slot. Gain Target Avoidance 1. Then the next ally gains Guarded 2.";
      card.block = 6;
      card.targetAvoidance = 1;
      card.partyBlock = 2;
    }
  };

  cards.forEach(card => {
    if (patchMap[card.cardId]) {
      patchMap[card.cardId](card);
    }
  });
}

// Read and patch all_deck_cards.json
const cardsData = JSON.parse(fs.readFileSync(ALL_DECK_CARDS_PATH, 'utf8'));
patchCards(cardsData);
fs.writeFileSync(ALL_DECK_CARDS_PATH, JSON.stringify(cardsData, null, 2));
console.log(`Patched ${ALL_DECK_CARDS_PATH}`);

// Read and patch gear_master_overhaul.json
const gearData = JSON.parse(fs.readFileSync(GEAR_MASTER_OVERHAUL_PATH, 'utf8'));
gearData.forEach(gear => {
  if (gear.ourCardPackage) {
    try {
      const packageCards = JSON.parse(gear.ourCardPackage);
      patchCards(packageCards);
      gear.ourCardPackage = JSON.stringify(packageCards);
    } catch (e) {
      console.error(`Failed to parse card package for ${gear.gearName}`);
    }
  }
});
fs.writeFileSync(GEAR_MASTER_OVERHAUL_PATH, JSON.stringify(gearData, null, 2));
console.log(`Patched ${GEAR_MASTER_OVERHAUL_PATH}`);
