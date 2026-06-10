const event = (
  quarryId,
  title,
  loreParagraphs,
  settlementEffects,
  unlocksInnovationIds,
  unlocksBuildingIds,
  historyText
) => ({
  quarryId,
  title,
  loreParagraphs,
  settlementEffects,
  unlocksInnovationIds,
  unlocksBuildingIds,
  unlocksRecipeIds: [`tag:${quarryId}`],
  historyText
});

export const quarryDiscoveryEvents = {
  paleHuntLion: event(
    'paleHuntLion', 'The First White Shape',
    [
      'The survivors return with claw marks in their shields and pale hair caught in their teeth.',
      'Children gather around the trophy scraps and learn a new fear: some beasts do not simply kill. They study.',
      'The settlement hangs the first pale mane where everyone can see it.'
    ],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'rumour', text: 'Pale shapes circle beyond the lanternlight, testing every open guard.' }],
    ['clawLore'], ['lionTrophyHall'],
    'The settlement learned to read the shape of a predator.'
  ),
  wailingAntelope: event(
    'wailingAntelope', 'The Animal That Would Not Stop Eating',
    [
      'The carcass stinks of sour grass and impossible hunger.',
      'The survivors cut it open and find that its body is less a body than a warning: everything can be consumed, even fear.'
    ],
    [{ type: 'resourceOrMemory', resourceId: 'organ', amount: 1 }, { type: 'rumour', text: 'Hoofbeats continue beneath the ground after the meat is stored.' }],
    ['stomachLore'], ['antelopeLarder'],
    'The settlement learned that hunger could be studied.'
  ),
  ashPhoenix: event(
    'ashPhoenix', 'Ashes That Remember',
    [
      'The feathers do not cool. They whisper names no survivor spoke aloud.',
      'The settlement watches the ash curl into shapes like hands, clocks, and broken faces.'
    ],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'nextHuntModifier', id: 'ashMemory', text: 'Draw 1 extra card on the first turn of the next hunt.', effects: { extraFirstTurnDraw: 1 } }],
    ['ashRitual', 'timeKeeping'], ['phoenixPyre'],
    'The settlement learned that time could leave bones behind.'
  ),
  bloatedGodling: event(
    'bloatedGodling', 'Thunder Beneath the Skin',
    ['The dead thing twitches long after it stops breathing.', 'Every cut spills heat, static, and the smell of storms trapped in meat.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'rumour', text: 'Thunder answers from clear skies whenever dense organs are opened.' }],
    ['stormShrine'], ['stormShrine'],
    'The settlement learned to listen for storms beneath living skin.'
  ),
  crimsonCrocodile: event(
    'crimsonCrocodile', 'The Red Water Dream',
    ['The survivors find mud in their boots, though no river runs near the settlement.', "The beast's scales hold the memory of drowning."],
    [{ type: 'resourceOrResource', resourceIds: ['hide', 'bone'], amount: 1 }, { type: 'rumour', text: 'Some nights, red water gathers in footprints and vanishes before dawn.' }],
    ['riverRites'], ['redTannery'],
    'The settlement learned that water could remember a death.'
  ),
  frogdog: event(
    'frogdog', 'The Thing That Leapt Wrong',
    ['The children laugh first, then stop.', 'The body is ridiculous until it is opened, and then no one laughs at its teeth.'],
    [{ type: 'resource', resourceId: 'organ', amount: 1 }, { type: 'rumour', text: 'Wet impacts sound beyond the walls whenever the lanterns dim.' }],
    ['toxinLessons'], ['wetYard'],
    'The settlement learned to distrust familiar shapes.'
  ),
  silkMatriarch: event(
    'silkMatriarch', 'The Thread Nest',
    ['The survivors return trailing silk that clings to every doorway.', 'By morning, the settlement has learned that a home can also be a trap.'],
    [{ type: 'resourceOrResource', resourceIds: ['sinew', 'silkGland'], amount: 1 }, { type: 'rumour', text: 'New threads appear between empty doorways each morning.' }],
    ['silkLoom'], ['silkLoom'],
    'The settlement learned that shelter and snare could share a shape.'
  ),
  bloomKnight: event(
    'bloomKnight', 'The Duelist Flower',
    ['The monster dies kneeling, as if accepting applause.', 'The petals around it are sharp enough to shave bone.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'nextHuntModifier', id: 'perfectStep', text: 'Begin the next combat with +2 block.', effects: { startingBlock: 2 } }],
    ['duelistGarden'], ['duelistGarden'],
    'The settlement learned that grace could be sharpened.'
  ),
  smogSingers: event(
    'smogSingers', 'The Chorus in the Lung',
    ['The survivors cough black notes into their hands.', 'Someone hums in their sleep, and three others answer without waking.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'rumour', text: 'A chorus answers any lone voice raised beyond the walls.' }],
    ['sootChorus'], ['smogKiln'],
    'The settlement learned to hear danger in shared breath.'
  ),
  chitinCrusader: event(
    'chitinCrusader', 'The Armour That Crawled',
    ['The shell keeps moving after the meat is gone.', 'The settlement learns that protection can have instincts.'],
    [{ type: 'resourceOrResource', resourceIds: ['scrap', 'chitinPlate'], amount: 1 }, { type: 'rumour', text: 'Empty plates turn toward impacts no one else can hear.' }],
    ['armourDoctrine'], ['chitinFoundry'],
    'The settlement learned that protection could remember its purpose.'
  ),
  drakeEmperor: event(
    'drakeEmperor', 'The Imperial Ember',
    ['The teeth glow like coals under glass.', 'The settlement warms itself around the carcass and dreams of crowns made from flame.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'nextHuntModifier', id: 'imperialEmber', text: 'Gain +1 strength in the first combat of the next hunt.', effects: { firstCombatStrength: 1 } }],
    ['fireRite'], ['crystalForge'],
    'The settlement learned to carry authority as heat.'
  ),
  sunSovereign: event(
    'sunSovereign', 'The Shell of Noon',
    ['No one can look at the trophy directly.', 'The settlement places it beneath cloth, and still the cloth glows.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'rumour', text: 'A covered trophy casts a shadow even when every lantern is dark.' }],
    ['sunMirror'], ['shellSanctum'],
    'The settlement learned to shape light without looking into it.'
  ),
  prideKing: event(
    'prideKing', 'The Beast That Judged',
    ['The trophy does not feel dead.', 'The settlement stands taller around it, then quieter, as if waiting to be measured.'],
    [{ type: 'settlementMemory', amount: 1 }, { type: 'nextHuntModifier', id: 'measuredPride', text: 'Begin the next combat with +1 survival.', effects: { startingSurvival: 1 } }],
    ['judgementRite'], ['prideHall'],
    'The settlement learned to name the weight of judgement.'
  )
};

export const quarryDiscoveryEventList = Object.values(quarryDiscoveryEvents);

export function getQuarryDiscoveryEvent(quarryId) {
  return quarryDiscoveryEvents[quarryId] || null;
}
