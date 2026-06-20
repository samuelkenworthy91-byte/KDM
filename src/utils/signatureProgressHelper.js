function getRepresentativeProgress(itemId, level, counters = {}) {
  if (itemId === 'palechord_cleaver') {
    if (level === 1) return `${counters.bleed_4_fights_won || 0}/3`;
    if (level === 2) return `${counters.max_bleed_in_one_fight || 0}/10`;
  }
  if (itemId === 'gorge_fist_knucklers') {
    if (level === 1) return `${counters.max_consumables_in_hunt || 0}/5`;
    if (level === 2) return `${counters.max_diff_consumables_in_fight || 0}/3`;
  }
  if (itemId === 'ash_second_spear') {
    if (level === 1) return `${counters.max_same_attack_plays || 0}/3`;
    if (level === 2) return counters.reshuffled_and_won ? 'Completed' : '0/1';
  }
  if (itemId === 'stormglass_lantern') {
    if (level === 1) return `${counters.total_charge_spent || 0}/12`;
    if (level === 2) return `${counters.total_damage_blocked || 0}/20`;
  }
  if (itemId === 'carapace_katars') {
    if (level === 1) return `${counters.played_2_katars_in_turn || 0}/5`;
  }
  if (itemId === 'noon_shell_bulwark') {
    if (level === 1) return `${counters.misses_redirects_caused || 0}/3`;
  }
  if (itemId === 'judgement_crown_helm') {
    if (level === 1) return `${counters.targeted_and_survived || 0}/6`;
  }

  return 'not yet tracked';
}

export function getMilestoneProgressText(item, progress) {
  if (!item) return null;

  if (!progress) {
    return {
      requirement: item.evolutionMilestones?.[0]?.unlock || 'Complete milestone to unlock',
      progressText: 'not yet tracked',
      nextMilestone: 'Unlock (Level 1)'
    };
  }

  const currentLevel = progress.level || 0;
  const isUnlocked = Boolean(progress.unlocked);

  if (!isUnlocked) {
    const nextMilestone = 'Unlock (Level 1)';
    const requirement = item.evolutionMilestones?.[0]?.unlock || 'Complete milestone to unlock';
    const progressText = getRepresentativeProgress(item.id, 1, progress.counters);
    return {
      requirement,
      progressText,
      nextMilestone
    };
  }

  if (currentLevel >= 3) {
    return {
      requirement: 'Fully evolved!',
      progressText: 'Max Level',
      nextMilestone: 'None'
    };
  }

  const nextLevel = currentLevel + 1;
  const nextMilestone = `Level ${nextLevel}`;
  const milestone = item.evolutionMilestones?.[nextLevel - 1];
  const requirement = milestone ? milestone.unlock : 'Complete next milestone';
  const progressText = getRepresentativeProgress(item.id, nextLevel, progress.counters);

  return {
    requirement,
    progressText,
    nextMilestone
  };
}
