import { disorders } from '../data/disorders.js';
import { injuries } from '../data/injuries.js';
import { scars } from '../data/scars.js';

const MINOR_INJURY_IDS = ['crackedRibs', 'twistedAnkle', 'deepCut'];
const INJURY_IDS = Object.keys(injuries);
const QUARRY_SCARS = {
  paleHuntLion: 'lionScar',
  wailingAntelope: 'hornBruise',
  ashPhoenix: 'ashMarked'
};

function pickAvailable(ids, owned = [], random = Math.random) {
  const available = ids.filter(id => !owned.includes(id));
  if (!available.length) return null;
  return available[Math.floor(random() * available.length)];
}

export function addUniqueCondition(survivor, type, conditionId) {
  if (!conditionId || !survivor) return survivor;
  const current = Array.isArray(survivor[type]) ? survivor[type] : [];
  if (current.includes(conditionId)) return survivor;
  if (type === 'scars' && conditionId === 'boneSetWrong') {
    return {
      ...survivor,
      maxHp: survivor.maxHp + 1,
      [type]: [...current, conditionId],
      permanentModifiers: {
        ...(survivor.permanentModifiers || {}),
        boneSetWrongApplied: true
      }
    };
  }
  return { ...survivor, [type]: [...current, conditionId] };
}

export function rollLowHpCondition(survivor, random = Math.random) {
  if (!survivor || survivor.hp <= 0) return null;
  const ratio = survivor.hp / survivor.maxHp;
  let chance = 0;
  let pool = MINOR_INJURY_IDS;

  if (survivor.hp === 1) {
    chance = 1;
    pool = INJURY_IDS;
  } else if (ratio <= 0.25) {
    chance = 0.5;
    pool = INJURY_IDS;
  } else if (ratio <= 0.5) {
    chance = 0.25;
  }

  if (random() >= chance) return null;
  return pickAvailable(pool, survivor.injuries, random);
}

export function rollBossScar(survivor, quarryId, random = Math.random) {
  if (!survivor || survivor.hp >= survivor.maxHp / 2 || random() >= 0.25) return null;
  const scarId = QUARRY_SCARS[quarryId];
  return scarId && !survivor.scars?.includes(scarId) ? scarId : null;
}

export function getCondition(type, conditionId) {
  if (type === 'injuries') return injuries[conditionId];
  if (type === 'scars') return scars[conditionId];
  if (type === 'disorders') return disorders[conditionId];
  return null;
}

export function getConditionName(type, conditionId) {
  return getCondition(type, conditionId)?.name || conditionId;
}
