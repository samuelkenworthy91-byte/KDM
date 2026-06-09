import { cards } from './cards.js';

function recipe(id, name, buildingId, cost, description, cardPackage, passiveText, slot = 'gear') {
  return { id, name, buildingId, requiresInnovation: buildingId, cost, description, cardPackage, passiveText, slot };
}

export const equipment = {
  boneBlade: recipe('boneBlade', 'Bone Blade', 'boneSmith', { bone: 1, sinew: 1 }, 'A reliable cutting weapon.', ['hack', 'hack', 'carve'], 'Adds direct attack cards.', 'weapon'),
  boneHammer: recipe('boneHammer', 'Bone Hammer', 'boneSmith', { bone: 2, hide: 1 }, 'A heavy weapon for cracking defenses.', ['skullCrack', 'skullCrack', 'guardBreak'], 'Heavy block-breaking package.', 'weapon'),
  boneDarts: recipe('boneDarts', 'Bone Darts', 'boneSmith', { bone: 1, sinew: 1 }, 'Light throwing weapons.', ['boneDart', 'boneDart', 'quickToss'], 'Fast ranged attack package.', 'weapon'),
  hideWraps: recipe('hideWraps', 'Hide Wraps', 'skinnery', { hide: 2 }, 'Simple layers of cured hide.', ['brace', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'),
  rawhideHood: recipe('rawhideHood', 'Rawhide Hood', 'skinnery', { hide: 1, sinew: 1 }, 'A hood that narrows attention to the hunt.', ['readTheBeast', 'rawhideDodge'], 'Improves early defense.', 'armor'),
  rawhideVest: recipe('rawhideVest', 'Rawhide Vest', 'skinnery', { hide: 2, bone: 1 }, 'A fitted vest reinforced with bone toggles.', ['rawhideDodge', 'slipAway'], 'Start combat with +2 max HP.', 'armor'),
  monsterGrease: recipe('monsterGrease', 'Monster Grease', 'organGrinder', { organ: 1, hide: 1 }, 'Rendered fat protects exposed skin.', ['slipAway'], 'Start combat with +2 block.', 'consumable'),
  clawCharm: recipe('clawCharm', 'Claw Charm', 'organGrinder', { claw: 1, organ: 1 }, 'A trophy charm that encourages aggression.', ['clawStrike', 'ripOpen'], '+1 strength in combat.', 'trinket'),
  strangeEyeAmulet: recipe('strangeEyeAmulet', 'Strange Eye Amulet', 'organGrinder', { strangeEye: 1, organ: 1 }, 'An amulet that catches patterns hidden in panic.', ['strangeGlimpse', 'seeThePattern'], 'Adds deck filtering and dangerous insight.', 'trinket'),
  bloodPaint: recipe('bloodPaint', 'Blood Paint', 'organGrinder', { organ: 1, bone: 1 }, 'Ritual paint for committing to the first blow.', ['bloodRush', 'clawStrike'], '+1 strength in the first combat.', 'consumable'),

  lionFangKatar: recipe('lionFangKatar', 'Lion Fang Katar', 'lionTrophyHall', { paleLionClaw: 1, paleLionSinew: 1, bone: 1 }, 'A fast punching blade modeled after the lion claw.', ['clawStrike', 'savageFollowUp', 'ripOpen'], 'Fast marked attack identity.', 'weapon'),
  maneCloak: recipe('maneCloak', 'Mane Cloak', 'lionTrophyHall', { paleLionMane: 1, paleLionHide: 1 }, 'A crackling cloak made from a mature lion mane.', ['duckAndRoll', 'rawhideDodge'], 'Start combat with +1 survival and +3 block.', 'armor'),
  catEyeCharm: recipe('catEyeCharm', 'Cat Eye Charm', 'lionTrophyHall', { paleLionEye: 1, strangeEye: 1 }, 'A charm that reveals the opening in every fight.', ['strangeGlimpse', 'readTheBeast'], 'Draw 1 extra card on the first turn.', 'trinket'),

  wailingHornBow: recipe('wailingHornBow', 'Wailing Horn Bow', 'antelopeLarder', { wailingHorn: 1, screamingSinew: 1, bone: 1 }, 'A resonant bow with a screaming sinew string.', ['hornShot', 'hornShot', 'quickToss'], 'Ranged and draw identity.', 'weapon'),
  hornMaul: recipe('hornMaul', 'Horn Maul', 'antelopeLarder', { wailingHorn: 1, bone: 2, screamingSinew: 1 }, 'A massive horn-headed maul built to break guarded prey.', ['boneFlurry', 'goringSwing', 'braceMaul'], 'Heavy multi-hit and defensive attacks.', 'weapon'),
  stomachStoneCharm: recipe('stomachStoneCharm', 'Stomach Stone Charm', 'antelopeLarder', { stomachStone: 1, organ: 1 }, 'A grounding charm worn close to the heart.', ['settle', 'brace'], 'Recover after Panic.', 'trinket'),
  trampleBoots: recipe('trampleBoots', 'Trample Boots', 'antelopeLarder', { wailingHide: 1, horn: 1 }, 'Hard boots made for carrying momentum through a target.', ['trample', 'braceMaul'], 'Charge attacks reduce block.', 'armor'),

  ashFeatherMantle: recipe('ashFeatherMantle', 'Ash Feather Mantle', 'phoenixPyre', { ashFeather: 1, phoenixAsh: 1 }, 'A warm mantle that sheds distressing memories.', ['ashCycle', 'settle'], 'Supports Panic avoidance.', 'armor'),
  timeBoneBlade: recipe('timeBoneBlade', 'Time Bone Blade', 'phoenixPyre', { timeBone: 1, bone: 1, sinew: 1 }, 'A blade whose strike arrives twice.', ['delayedCut', 'delayedCut', 'quickToss'], 'Can grant extra energy.', 'weapon'),
  memoryGlassEye: recipe('memoryGlassEye', 'Memory Glass Eye', 'phoenixPyre', { memoryGlass: 1, strangeEye: 1 }, 'A lens for selecting which memories remain.', ['memoryFilter', 'seeThePattern'], 'Improves deck filtering and Panic control.', 'trinket')
};

export const equipmentList = Object.values(equipment);

export function validateEquipmentCardPackages() {
  const missingCardIds = [];
  const equipmentWithNoCardPackage = [];
  let cardPackageCount = 0;

  equipmentList.forEach(item => {
    if (!Array.isArray(item.cardPackage) || item.cardPackage.length === 0) {
      equipmentWithNoCardPackage.push(item.id);
      return;
    }
    cardPackageCount += item.cardPackage.length;
    item.cardPackage.forEach(cardId => {
      if (!cards[cardId]) missingCardIds.push({ equipmentId: item.id, cardId });
    });
  });

  return { missingCardIds, equipmentWithNoCardPackage, cardPackageCount };
}

export function getMissingCardIdsFromEquipment() {
  return validateEquipmentCardPackages().missingCardIds;
}

const validation = validateEquipmentCardPackages();
if (validation.missingCardIds.length || validation.equipmentWithNoCardPackage.length) {
  console.warn('Equipment card package validation failed.', validation);
}
