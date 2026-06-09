const entry = (lanternYear, id, name, description, type, effects = {}, options = {}) => ({
  lanternYear, id, name, description, type, effects,
  choices: options.choices || [],
  unlocksInnovationIds: options.unlocksInnovationIds || [],
  unlocksQuarryRumours: options.unlocksQuarryRumours || []
});

export const lanternTimeline = [
  entry(1, 'firstNight', 'First Night', 'The first night tests every promise made beneath {settlementName} lanterns.', 'fixed',
    { gainSettlementMemory: 1 }, { unlocksInnovationIds: ['language'] }),
  entry(2, 'sharedHunger', 'Shared Hunger', 'The settlement learns how hunger changes a crowd.', 'pressure', {},
    { choices: [
      { id: 'ration', text: 'Ration carefully', effects: { randomSurvivorSurvival: 1 } },
      { id: 'feast', text: 'Feast dangerously', effects: { spendFoodResource: 1, healAll: 1 } }
    ] }),
  entry(3, 'deadCounted', 'The Dead Are Counted', 'Every empty place is named.', 'fixed', { memoryIfNoDeaths: 1 },
    { unlocksInnovationIds: ['graves'] }),
  entry(4, 'whiteSmoke', 'White Smoke', 'Harsh white smoke curls from the settlement refuse.', 'discovery', {},
    { choices: [
      { id: 'study', text: 'Study it', effects: { addInnovationIds: ['ammonia'] } },
      { id: 'avoid', text: 'Avoid it', effects: { healOne: 1 } }
    ] }),
  entry(5, 'strangerDark', 'Stranger in the Dark', 'A stranger waits beyond the last familiar face.', 'discovery',
    { populationChance: 0.5 }, { unlocksQuarryRumours: ['crimsonCrocodile'] }),
  entry(6, 'childrenListen', 'The Children Listen', 'Children repeat warnings with unsettling accuracy.', 'fixed',
    { memoryIfLowPopulation: 1 }, { unlocksInnovationIds: ['oralTradition', 'sharedWarnings'] }),
  entry(8, 'huntCallsBack', 'The Hunt Calls Back', 'An old trail appears fresh beside the settlement.', 'pressure',
    { nextRunMonsterBonusHp: 3 }, { unlocksQuarryRumours: ['silkMatriarch'] }),
  entry(10, 'nemesisShadow', 'Nemesis Shadow', 'A deliberate shadow begins following settlement history.', 'nemesis',
    {}, { unlocksQuarryRumours: ['cruelCollector'] }),
  entry(12, 'settlementSchism', 'Settlement Schism', 'The settlement divides over which memories deserve to survive.', 'pressure', {},
    { choices: [
      { id: 'preserve', text: 'Preserve memory', effects: { gainSettlementMemory: 2 } },
      { id: 'burn', text: 'Burn old ways', effects: { forgetPanic: 1 } }
    ] }),
  entry(15, 'longDark', 'The Long Dark', 'Light fails for long enough that something is lost.', 'pressure',
    {}, { choices: [
      { id: 'spend', text: 'Spend 3 basic resources to keep the lights alive', effects: { preventPopulationLossCost: 3, populationLoss: 1 } },
      { id: 'lose', text: 'Accept the loss', effects: { populationLoss: 1 } }
    ] }),
  entry(20, 'watchingDark', 'The Watching Dark', 'Something beyond the campaign has learned the settlement name.', 'nemesis',
    {}, { unlocksQuarryRumours: ['watcherInspired'] })
];

export const randomLanternYearEvents = [
  entry(null, 'quietYear', 'A Quiet Year', 'Nothing arrives except work and weather.', 'random', { gainSettlementMemory: 1 }),
  entry(null, 'resourceMemory', 'Useful Remains', 'Old stores reveal one forgotten resource.', 'random', { gainBasicResource: 1 }),
  entry(null, 'newRumour', 'Distant Tracks', 'Scouts return with an incomplete quarry rumour.', 'random', {}, { unlocksQuarryRumours: ['frogdog'] })
];

export function getTimelineEntry(year) {
  return lanternTimeline.find(item => item.lanternYear === year) || null;
}

export function getNextTimelineMilestone(year) {
  return lanternTimeline.find(item => item.lanternYear > year) || null;
}
