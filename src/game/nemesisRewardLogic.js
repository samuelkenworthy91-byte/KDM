import { fightingArts } from '../data/fightingArts.js';
import { resources } from '../data/resources.js';

export function createNemesisVictoryReward(encounter, survivor, options = {}) {
  const uniqueResourceId = encounter?.rewards?.uniqueResourceId || null;
  const artId = encounter?.rewards?.mirrorArtId || null;
  const art = fightingArts[artId];
  const resource = resources[uniqueResourceId];
  const artOwned = Boolean(artId && survivor?.fightingArts?.includes(artId));
  const rewardEventId = options.rewardEventId ||
    `nemesis-reward-${encounter?.id || 'legacy'}-${Date.now()}`;
  const rewardChoices = [];

  if (art && !artOwned) {
    rewardChoices.push({
      id: 'learnArt',
      type: 'fightingArt',
      artId,
      name: art.name,
      description: art.description
    });
  }
  if (uniqueResourceId && resource) {
    rewardChoices.push({
      id: 'takeExtraTrophy',
      type: 'resource',
      resourceId: uniqueResourceId,
      name: `Take another ${resource.name}`,
      description: artOwned
        ? `${art?.name || 'This nemesis art'} is already known, so take an additional trophy.`
        : 'Take a second unique trophy instead of learning the art.'
    });
  }

  return {
    rewardEventId,
    uniqueResourceId,
    uniqueResourceName: resource?.name || 'Unknown / Legacy',
    artId: art?.id || null,
    artName: art?.name || 'Unknown / Legacy',
    artDescription: art?.description || 'This older reward has no current description.',
    artOwned,
    rewardChoices,
    rewardClaimed: rewardChoices.length === 0,
    chosenRewardId: rewardChoices.length === 0 ? 'none' : null,
    learningText: encounter?.rewards?.learningText ||
      'The survivor carried an unnamed lesson home.'
  };
}

export function getNemesisRewardChoice(reward, choiceId) {
  return reward?.rewardChoices?.find(choice => choice.id === choiceId) || null;
}
