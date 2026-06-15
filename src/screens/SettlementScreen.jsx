import React, { useEffect, useMemo, useState } from 'react';
import { cards, starterCardIds, trainingCardIds } from '../data/cards.js';
import { childTraits, normalizeChildTraitId } from '../data/childTraits.js';
import {
  equipmentCatalogList,
  equipmentList,
  getEquipment
} from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { innovationCards } from '../data/innovationCards.js';
import { injuries } from '../data/injuries.js';
import { getNextTimelineMilestone } from '../data/lanternTimeline.js';
import { nemesisEncounters, nemesisList } from '../data/nemesisEncounters.js';
import { innovationList, innovations } from '../data/innovations.js';
import {
  memoryInnovationList,
  startingTraits
} from '../data/memoryInnovations.js';
import { disorders } from '../data/disorders.js';
import { scars } from '../data/scars.js';
import { getSurvivorModifiers } from '../data/survivorModifiers.js';
import {
  calculateAvailableQuarryTiers,
  getAvailableQuarryLevel,
  getHighestDefeatedQuarryLevel,
  getQuarryTierProgress,
  getQuarryBehaviourLabel,
  getQuarryBehaviourNote,
  isQuarryUnlocked,
  quarries,
  quarryList
} from '../data/quarries.js';
import { resources } from '../data/resources.js';
import {
  getActiveProficiencyPassive,
  weaponProficiencyDefinitions,
  weaponTypes
} from '../data/weaponProficiency.js';
import {
  canAffordCost,
  canBuildUnlocked,
  formatCostWithMissing,
  getMissingResources
} from '../game/craftingLogic.js';
import {
  getGearDisplayName,
  getGearUnlockState,
  groupGearByArmouryTab
} from '../utils/gearNormalization.js';
import { calculateIntimacyProjections } from '../game/eventLogic.js';
import { getPersonalCardId } from '../game/deckLogic.js';
import {
  EARLY_FORGETTING_COST,
  getCardForgetEligibility,
  hasEarlyForgettingAccess
} from '../game/cardForgetting.js';
import {
  getLegacyDescription,
  getLegacyDisplayName
} from '../game/legacyContent.js';
import {
  isMemoryActionUsed
} from '../game/memoryInnovationLogic.js';
import {
  getDrawableInnovationIdsForSettlement,
  getInnovationDeckEntries
} from '../game/innovationLogic.js';
import { getInnovationDefinition } from '../game/innovationModel.js';
import {
  formatEffectsForDisplay,
  formatHistoryDetail,
  formatModifierEffect,
  formatValueForDisplay
} from '../utils/formatters.js';
import {
  getSurvivorDisplayName,
  getSurvivorGenerationText
} from '../game/survivorIdentity.js';
import { canSpendMemories, getMemoryBalance } from '../game/memoryEconomy.js';

const tabs = ['overview', 'survivors', 'armory', 'innovations', 'population', 'graveyard', 'quarries'];
function CostList({ cost, stash }) {
  const entries = formatCostWithMissing(cost, stash);
  if (!entries.length) return <p className="muted-text">Cost: None</p>;

  return (
    <div className="cost-list">
      <strong>Cost:</strong>
      {entries.map(entry => {
        const source = resources[entry.resourceId]?.creatureId;
        const sourceName = quarries[source]?.name;
        return (
          <span className={entry.missing ? 'missing' : 'met'} key={entry.resourceId}>
            {formatValueForDisplay(entry.text)}
            {entry.missing && sourceName ? ` - hunt ${sourceName}` : ''}
          </span>
        );
      })}
    </div>
  );
}

function Stash({ stash }) {
  const entries = Object.entries(stash).filter(([, count]) => count > 0);
  return (
    <div className="stash-grid">
      {entries.map(([resourceId, count]) => (
        <span key={resourceId}>{resources[resourceId]?.name || resourceId}: {count}</span>
      ))}
      {!entries.length && <p>No resources stored.</p>}
    </div>
  );
}

function HuntHints({ settlement, recipes }) {
  const creatureIds = new Set();
  recipes.forEach(recipe => {
    getMissingResources(recipe.cost, settlement.stash).forEach(({ resourceId }) => {
      if (resources[resourceId]?.creatureId) creatureIds.add(resources[resourceId].creatureId);
    });
  });
  if (!creatureIds.size) return null;

  return (
    <aside className="hunt-hints">
      <h3>What should I hunt next?</h3>
      {[...creatureIds].map(creatureId => (
        <p key={creatureId}>Hunt {quarries[creatureId]?.name || creatureId} for missing creature resources.</p>
      ))}
    </aside>
  );
}

function ConditionList({ label, ids, catalog }) {
  return (
    <p>
      <strong>{label}:</strong>{' '}
      {ids?.length ? ids.map(id => getLegacyDisplayName(catalog, id, label)).join(', ') : 'None'}
    </p>
  );
}

function ModifierSection({ label, ids, type }) {
  const modifiers = getSurvivorModifiers(ids || [], type);
  return (
    <details className="survivor-modifier-section">
      <summary>{label} ({modifiers.length})</summary>
      {modifiers.length ? modifiers.map(modifier => (
        <div className="survivor-modifier-entry" key={`${type}-${modifier.id}`}>
          <strong>{modifier.name}</strong>
          <small>
            {formatValueForDisplay(modifier.type)} | {formatValueForDisplay(modifier.rarity)} |{' '}
            {formatValueForDisplay(modifier.tags)}
          </small>
          <span>{formatValueForDisplay(modifier.shortDescription)}</span>
          <span className="effect-text">
            {formatModifierEffect(
              modifier.mechanicalEffectText ||
              modifier.mechanicalEffect ||
              modifier.passiveEffects ||
              modifier.effects
            )}
          </span>
          {modifier.source && <small>Source: {formatValueForDisplay(modifier.source)}</small>}
        </div>
      )) : <p className="muted-text">None</p>}
    </details>
  );
}

function DeckCardDetails({ cardId, source, suffix = '' }) {
  const card = cards[cardId];
  return (
    <span>
      <strong>{getLegacyDisplayName(cards, cardId, 'card')}</strong>{suffix}
      <br />
      <small>
        Cost: {Number.isFinite(card?.cost) ? card.cost : '-'} | Type: {card?.type || 'Unknown'} |{' '}
        Source: {source}
      </small>
      <br />
      <span>{getLegacyDescription(cards, cardId)}</span>
      <br />
      <small>Tags: {card?.tags?.join(', ') || 'None'}</small>
    </span>
  );
}

function SurvivorCard({
  survivor,
  active,
  settlement,
  onSelect,
  onStartHunt,
  onRestSurvivor,
  onTreatInjury,
  onForgetCard,
  onMemoryCardRemoval,
  onWeaponDrill,
  onPainLesson,
  onShrineOfNames
}) {
  const treatmentUsed = settlement.lastInjuryTreatmentLanternYear === settlement.lanternYear;
  const canPayTreatment = (settlement.stash.organ || 0) > 0 || (settlement.stash.hide || 0) > 0;
  const memoryBuilt = innovationId => settlement.builtMemoryInnovations.includes(innovationId);
  const forgotten = new Set(survivor.forgottenCardIds || []);
  const profileEntries = [
    ...starterCardIds.map(cardId => ({ cardId, source: 'Starter' })),
    ...(survivor.personalDeckAdditions || []).map(addition => ({
      cardId: getPersonalCardId(addition),
      source: addition.sourceType || 'Personal',
      reason: addition.reason,
      locked: Boolean(addition.locked),
      addition
    })),
    ...(survivor.permanentNegativeCards || []).map(addition => ({
      cardId: getPersonalCardId(addition),
      source: 'Permanent negative',
      addition
    }))
  ].filter(entry => entry.cardId);
  const uniqueProfileEntries = [...new Map(
    profileEntries.map(entry => [entry.cardId, entry])
  ).values()];
  const gearEntries = (survivor.boundGear || []).flatMap(gear => {
    const item = getEquipment(gear.equipmentId);
    return (item?.cardPackage || []).map(cardId => ({
      cardId,
      source: `Gear: ${item.name}`,
      eligible: false
    }));
  });
  const activeProficiencyType = survivor.activeProficiencyType || 'fistAndTooth';
  const activeProficiency = survivor.weaponProficiency?.[activeProficiencyType] || {
    xp: 0,
    level: 0,
    mastered: false
  };
  const monsterBanes = (survivor.fightingArts || [])
    .filter(id => id.startsWith('monsterBane_'))
    .map(id => ({ id, art: fightingArts[id], quarryId: id.replace('monsterBane_', '') }));
  const regularArts = (survivor.fightingArts || []).filter(id => !id.startsWith('monsterBane_'));
  const buildTags = [...new Set(regularArts.flatMap(id => fightingArts[id]?.tags || []))]
    .filter(tag => !['rare', 'party'].includes(tag))
    .slice(0, 4);
  const confirmForget = (cardName, action) => {
    if (window.confirm(`Forget ${cardName}? This permanently removes it from this survivor’s personal deck.`)) {
      action();
    }
  };

  return (
    <article className={`item-card ${active ? 'built' : ''}`}>
      <h4>{getSurvivorDisplayName(survivor)}</h4>
      <p className="muted-text survivor-identity-note">{getSurvivorGenerationText(survivor)}</p>
      <p>
        {survivor.gender || 'Unspecified'} | HP {survivor.hp}/{survivor.maxHp} | Survival{' '}
        {survivor.survival || 0}/{survivor.maxSurvival || 3}
      </p>
      <p><strong>Completed runs:</strong> {survivor.completedRuns || 0}</p>
      <p><strong>Build tags:</strong> {buildTags.join(', ') || 'Unformed'}</p>
      <p><strong>Equipped gear:</strong> {survivor.boundGear?.length || 0} pieces</p>
      <ConditionList label="Injuries" ids={survivor.injuries} catalog={injuries} />
      <ConditionList label="Scars" ids={survivor.scars} catalog={scars} />
      <ConditionList label="Disorders" ids={survivor.disorders} catalog={disorders} />
      {Object.entries(survivor.hitLocations || {}).some(([, wound]) => wound.wounded) && (
        <p>
          <strong>Hit locations:</strong>{' '}
          {Object.entries(survivor.hitLocations)
            .filter(([, wound]) => wound.wounded)
            .map(([location, wound]) =>
              `${location} (${wound.severe ? 'serious' : 'light'}: ${formatHistoryDetail(wound.penalty)})`
            )
            .join('; ')}
        </p>
      )}
      {!!survivor.treatmentNotes?.length && (
        <p><strong>Treatment notes:</strong> {survivor.treatmentNotes.slice(-3).join(' ')}</p>
      )}
      <details className="survivor-details">
        <summary>Survivor details</summary>
        <ModifierSection label="Traits" ids={survivor.traits} type="trait" />
        {survivor.appearance && <p><strong>Appearance:</strong> {survivor.appearance}</p>}
        <ModifierSection label="Fighting Arts" ids={regularArts} type="fightingArt" />
        <ModifierSection label="Disorders" ids={survivor.disorders} type="disorder" />
        <ModifierSection label="Injuries" ids={survivor.injuries} type="injury" />
        <ModifierSection label="Scars" ids={survivor.scars} type="scar" />
        <ModifierSection
          label="Monster Bane"
          ids={monsterBanes.map(entry => entry.id)}
          type="monsterBane"
        />
        <div className="personal-card-list">
          <strong>Weapon Proficiency</strong>
          <p>
            <strong>Active Proficiency: {weaponProficiencyDefinitions[activeProficiencyType]?.name}</strong>
            <br />
            {activeProficiency.xp}/8 XP, Level {activeProficiency.level}
            {activeProficiency.mastered ? ' (Mastered)' : ''}
            <br />
            <span className="muted-text">
              {getActiveProficiencyPassive(survivor.weaponProficiency, activeProficiencyType)}
            </span>
          </p>
          <p className="muted-text">Inactive proficiencies are retained but do not grant cards or passives.</p>
          {weaponTypes.filter(type => type !== activeProficiencyType).map(type => {
            const progress = survivor.weaponProficiency?.[type] || { xp: 0, level: 0, mastered: false };
            const definition = weaponProficiencyDefinitions[type];
            return (
              <p key={type}>
                <strong>{definition.name}:</strong> {progress.xp}/8 XP, Level {progress.level}
                {progress.mastered ? ' (Mastered)' : ''}
              </p>
            );
          })}
        </div>
        <div className="personal-card-list">
          <strong>Personal Cards</strong>
          <p className="muted-text">
            Gear cards come from equipped gear. Remove the gear to remove these cards.
            Removing bound gear destroys it.
          </p>
          <p className="muted-text">
            Guided Reflection is available through the Lantern Hearth. Spend 1 Memory to forget
            one eligible personal or basic card per survivor each Lantern Year. Rite of Forgetting
            remains a later formal route to the same action.
          </p>
          <h4>Personal Deck</h4>
          {uniqueProfileEntries.length ? uniqueProfileEntries.map(entry => {
            const cardId = entry.cardId;
            const personalCard = cards[cardId];
            const isPanic = cardId === 'panic' || personalCard?.type === 'curse';
            const isLocked = entry.locked || personalCard?.locked || personalCard?.unforgettable;
            const isForgotten = forgotten.has(cardId);
            const eligibility = getCardForgetEligibility({
              settlement,
              survivor,
              cardId,
              card: personalCard,
              addition: entry.addition
            });

            return (
              <div className="personal-card-row" key={cardId}>
                <DeckCardDetails
                  cardId={cardId}
                  source={entry.source}
                  suffix={`${isForgotten ? ' - Forgotten' : ''}${
                    cardId === 'foundingStone' ? ' - Single-use starter' : ''
                  }${isLocked ? ' - Locked' : ' - Forgettable'}`}
                />
                {entry.reason && <small>Learned from: {entry.reason}</small>}
                {!isPanic && (
                  <button
                    type="button"
                    disabled={!eligibility.eligible}
                    title={eligibility.reason}
                    onClick={() => confirmForget(
                      personalCard?.name || cardId,
                      () => onForgetCard(survivor.id, cardId)
                    )}
                  >
                    Forget
                  </button>
                )}
                {isPanic && (
                  <>
                    <button
                      type="button"
                      disabled={
                        !memoryBuilt('quietNight') ||
                        isMemoryActionUsed(settlement, 'quietNight') ||
                        settlement.settlementMemory < 1
                      }
                      title={!memoryBuilt('quietNight')
                        ? 'Requires Quiet Night'
                        : isMemoryActionUsed(settlement, 'quietNight')
                          ? 'Already used this Lantern Year'
                          : settlement.settlementMemory < 1
                            ? 'Not enough settlementMemory'
                            : ''}
                      onClick={() => confirmForget(
                        personalCard?.name || cardId,
                        () => onMemoryCardRemoval('quietNight', survivor.id, cardId)
                      )}
                    >
                      Quiet Night
                    </button>
                    <button
                      type="button"
                      disabled={
                        !memoryBuilt('taboo') ||
                        isMemoryActionUsed(settlement, 'taboo') ||
                        settlement.settlementMemory < 2
                      }
                      title={!memoryBuilt('taboo')
                        ? 'Requires Taboo'
                        : isMemoryActionUsed(settlement, 'taboo')
                          ? 'Already used this Lantern Year'
                          : settlement.settlementMemory < 2
                            ? 'Not enough settlementMemory'
                            : ''}
                      onClick={() => confirmForget(
                        personalCard?.name || cardId,
                        () => onMemoryCardRemoval('taboo', survivor.id, cardId)
                      )}
                    >
                      Taboo
                    </button>
                  </>
                )}
                {eligibility.reason && !eligibility.eligible && !isPanic && (
                  <small>{eligibility.reason}</small>
                )}
              </div>
            );
          }) : <p className="muted-text">No future cards.</p>}
          <h4>Gear Cards</h4>
          {gearEntries.length ? gearEntries.map((entry, index) => (
            <div className="personal-card-row" key={`${entry.source}-${entry.cardId}-${index}`}>
              <DeckCardDetails cardId={entry.cardId} source={entry.source} />
              <button type="button" disabled title="Gear card: unequip item to remove">Gear card</button>
              <small>Gear card: unequip item to remove</small>
            </div>
          )) : <p className="muted-text">No bound gear cards.</p>}
          <h4>Active Proficiency Cards</h4>
          <p className="muted-text">
            {weaponProficiencyDefinitions[activeProficiencyType]?.name} is active. No proficiency
            cards are granted at the current level; only its passive applies.
          </p>
          <h4>Trauma / Panic / Disorder Cards</h4>
          <p className="muted-text">
            {[
              ...(survivor.permanentNegativeCards || []),
              ...(survivor.personalDeckAdditions || []).filter(addition =>
                getPersonalCardId(addition) === 'panic'
              )
            ].length
              ? 'These cards are listed in the Personal Deck above with their burden source.'
              : 'No trauma or Panic cards.'}
            {(survivor.disorders || []).length
              ? ` Disorders: ${survivor.disorders.map(id => disorders[id]?.name || id).join(', ')}.`
              : ''}
          </p>
          <h4>Locked / Unforgettable Cards</h4>
          {monsterBanes.length ? monsterBanes.map(({ id, art, quarryId }) => (
            <article className="item-card" key={id}>
              <strong>{art?.name || id}</strong>
              <p>Quarry: {quarries[quarryId]?.name || quarryId}</p>
                <p>{formatValueForDisplay(
                  art?.description ||
                  art?.effectText ||
                  art?.mechanicalEffect ||
                  'Reveals exact quarry intent and weak-point knowledge.'
                )}</p>
              <p className="effect-text">Locked: Monster Bane. Cannot be forgotten or replaced.</p>
            </article>
          )) : <p className="muted-text">No locked Monster Bane.</p>}
          {!!survivor.forgottenCardsLog?.length && (
            <details>
              <summary>Forgotten Card Log</summary>
              {survivor.forgottenCardsLog.map((entry, index) => (
                <p key={`${entry.cardId}-${entry.lanternYear}-${index}`}>
                  {entry.cardName} | Year {entry.lanternYear} | {entry.method}
                  {entry.wasStarterCard ? ' | Starter' : ''}
                  {entry.wasNegative ? ' | Negative' : ''}
                </p>
              ))}
            </details>
          )}
        </div>
        <details>
          <summary>Reward History ({survivor.recentRewardOfferIds?.length || 0})</summary>
          <p className="muted-text">
            Recent offers are avoided for the next several successful hunts when alternatives exist.
          </p>
          <p>{survivor.recentRewardOfferIds?.slice().reverse().join(', ') || 'No reward offers recorded.'}</p>
        </details>
        <p><strong>Bound gear:</strong> {survivor.boundGear?.length
          ? survivor.boundGear.map(gear => getEquipment(gear.equipmentId).name).join(', ')
          : 'None'}</p>
        {[...(survivor.injuries || []), ...(survivor.scars || []), ...(survivor.disorders || [])].map(id => {
          const condition = injuries[id] || scars[id] || disorders[id];
          if (!condition) return null;
          if (disorders[id]) {
            return (
              <div className="muted-text" key={id}>
                <p><strong>{condition.name}:</strong> {formatValueForDisplay(condition.description)}</p>
                <p><strong>Downside:</strong> {formatValueForDisplay(condition.downside)}</p>
                <p><strong>Upside:</strong> {formatValueForDisplay(condition.upside)}</p>
                <p><strong>Trigger:</strong> {formatValueForDisplay(condition.trigger)}</p>
              </div>
            );
          }
          return (
            <p className="muted-text" key={id}>
              <strong>{condition.name}:</strong> {formatModifierEffect(condition.effect)}
            </p>
          );
        })}
      </details>
      <button type="button" disabled={active} onClick={() => onSelect(survivor.id)}>
        {active ? 'Active Hunter' : 'Select Hunter'}
      </button>
      {onStartHunt && <button type="button" onClick={() => onStartHunt(survivor.id)}>Start Hunt</button>}
      <button
        type="button"
        disabled={survivor.hp >= survivor.maxHp || settlement.settlementMemory < 1}
        onClick={() => onRestSurvivor(survivor.id)}
      >
        Rest This Survivor (1 Memory)
      </button>
      {survivor.injuries?.length > 0 && (
        settlement.builtInnovations.includes('firstAidTent') ? (
          <div className="treatment-actions">
            <strong>Treat injury:</strong>
            {survivor.injuries.map(injuryId => (
              <button
                type="button"
                key={injuryId}
                disabled={treatmentUsed || !canPayTreatment}
                onClick={() => onTreatInjury(survivor.id, injuryId)}
              >
                {injuries[injuryId]?.name || injuryId}
              </button>
            ))}
            {treatmentUsed && <p className="muted-text">Treatment already used this Lantern Year.</p>}
            {!canPayTreatment && <p className="muted-text">Treatment needs 1 organ or 1 hide.</p>}
          </div>
        ) : <p className="muted-text">Build First Aid Tent to treat injuries.</p>
      )}
      {memoryBuilt('painLessons') && survivor.injuries?.length > 0 && (
        <div className="memory-action-row">
          <strong>Pain Lessons:</strong>
          {survivor.injuries.map(injuryId => (
            <button
              type="button"
              key={injuryId}
              disabled={isMemoryActionUsed(settlement, 'painLessons')}
              title={isMemoryActionUsed(settlement, 'painLessons')
                ? 'Already used this Lantern Year'
                : ''}
              onClick={() => onPainLesson(survivor.id, injuryId)}
            >
              Turn {injuries[injuryId]?.name || injuryId} into a scar
            </button>
          ))}
        </div>
      )}
      {memoryBuilt('weaponDrills') && (
        <div className="memory-action-row">
          <strong>Weapon Drills (1 Memory):</strong>
          {trainingCardIds.map(cardId => (
            <button
              type="button"
              key={cardId}
              disabled={
                isMemoryActionUsed(settlement, 'weaponDrills') ||
                settlement.settlementMemory < 1
              }
              title={isMemoryActionUsed(settlement, 'weaponDrills')
                ? 'Already used this Lantern Year'
                : settlement.settlementMemory < 1
                  ? 'Not enough settlementMemory'
                  : ''}
              onClick={() => onWeaponDrill(survivor.id, cardId)}
            >
              Learn {cards[cardId].name}
            </button>
          ))}
        </div>
      )}
      {memoryBuilt('shrineOfNames') && (
        <div className="memory-action-row">
          <button
            type="button"
            disabled={
              isMemoryActionUsed(settlement, 'shrineOfNames') ||
              settlement.settlementMemory < 2
            }
            title={isMemoryActionUsed(settlement, 'shrineOfNames')
              ? 'Already used this Lantern Year'
              : settlement.settlementMemory < 2
                ? 'Not enough settlementMemory'
                : ''}
            onClick={() => onShrineOfNames(survivor.id)}
          >
            Shrine of Names: +1 max HP (2 Memory)
          </button>
        </div>
      )}
    </article>
  );
}

export default function SettlementScreen({
  settlement,
  activeSlot,
  selectedQuarry,
  selectedLevel,
  onSelectQuarry,
  onSelectLevel,
  onBeginHunt,
  onBuild,
  onCraft,
  onAttemptInnovation,
  onTimelineChoice,
  onCreateSurvivor,
  onSelectSurvivor,
  onStartHunt,
  onAttemptIntimacy,
  onResolveDeath,
  onRestSurvivor,
  onTreatInjury,
  onForgetCard,
  onMemoryCardRemoval,
  onWeaponDrill,
  onPainLesson,
  onShrineOfNames,
  onReturnToTitle
}) {
  const [tab, setTab] = useState('overview');
  const [showLockedGear, setShowLockedGear] = useState(false);
  const [showLegacyGear, setShowLegacyGear] = useState(false);
  const [activeArmouryTab, setActiveArmouryTab] = useState('Stored Gear');
  const [survivorName, setSurvivorName] = useState('');
  const [survivorGender, setSurvivorGender] = useState('other');
  const [survivorAppearance, setSurvivorAppearance] = useState('');
  const [useSpecialTrait, setUseSpecialTrait] = useState(false);
  const [startingTrait, setStartingTrait] = useState('');
  const [intimacyMaleId, setIntimacyMaleId] = useState('');
  const [intimacyFemaleId, setIntimacyFemaleId] = useState('');
  const [spendMemoryOnIntimacy, setSpendMemoryOnIntimacy] = useState(false);
  const [timelineNomineeId, setTimelineNomineeId] = useState('');
  const [showDeckInspection, setShowDeckInspection] = useState(false);
  const settlementStructures = innovationList.filter(item => !innovationCards[item.id]);
  const buildableInnovations = settlementStructures.filter(item =>
    !settlement.builtInnovations.includes(item.id) && canBuildUnlocked(item, settlement)
  );
  const builtInnovations = settlementStructures.filter(item =>
    settlement.builtInnovations.includes(item.id)
  );
  const rumouredInnovations = settlementStructures.filter(item =>
    !settlement.builtInnovations.includes(item.id) && !canBuildUnlocked(item, settlement)
  );
  const builtMemoryInnovations = memoryInnovationList.filter(item =>
    settlement.builtMemoryInnovations.includes(item.id)
  );
  const innovationDeckEntries = getInnovationDeckEntries(settlement);
  const drawableInnovationIds = getDrawableInnovationIdsForSettlement(settlement);
  const ownedInnovationIds = settlement.innovationDeckState?.builtInnovationIds || [];
  const ownedInnovationEntries = ownedInnovationIds.map(id =>
    getInnovationDefinition(innovationCards, id)
  );
  const basicResourceCount = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw']
    .reduce((total, resourceId) => total + (settlement.stash[resourceId] || 0), 0);
  const canAttemptInnovation =
    settlement.settlementMemory >= 1 &&
    basicResourceCount >= 3 &&
    drawableInnovationIds.length > 0;
  const nextTimelineMilestone = getNextTimelineMilestone(settlement.lanternYear);
  const armouryData = useMemo(() => {
    return groupGearByArmouryTab(showLegacyGear ? equipmentCatalogList : equipmentList, settlement, {
      includeLocked: showLockedGear,
      includeHidden: showLegacyGear
    });
  }, [settlement, showLockedGear, showLegacyGear]);

  const recipeTabs = useMemo(() => Object.keys(armouryData).sort((a, b) => {
    const priority = ['Starting / Basic', 'Lantern Hoard', 'Bone Smith', 'Organ Grinder', 'Skinnery'];
    const aPriority = priority.indexOf(a);
    const bPriority = priority.indexOf(b);
    if (aPriority !== -1 || bPriority !== -1) {
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    }
    return a.localeCompare(b);
  }), [armouryData]);
  const armouryTabs = useMemo(
    () => ['Stored Gear', 'Bound Gear', ...recipeTabs],
    [recipeTabs]
  );

  useEffect(() => {
    if (armouryTabs.length > 0 && (!activeArmouryTab || !armouryTabs.includes(activeArmouryTab))) {
      setActiveArmouryTab(armouryTabs[0]);
    }
  }, [armouryTabs, activeArmouryTab]);

  const visibleRecipes = useMemo(() => {
    if (activeArmouryTab === 'Stored Gear' || activeArmouryTab === 'Bound Gear') return [];
    if (!activeArmouryTab || !armouryData[activeArmouryTab]) return [];
    return Object.values(armouryData[activeArmouryTab]).flat();
  }, [armouryData, activeArmouryTab]);
  const livingSurvivors = settlement.survivors.filter(survivor => survivor.alive !== false);
  const livingMales = livingSurvivors.filter(survivor => survivor.gender === 'male');
  const livingFemales = livingSurvivors.filter(survivor => survivor.gender === 'female');
  const intimacyUsedThisYear = settlement.lastIntimacyLanternYear === settlement.lanternYear;
  const memoryBalance = getMemoryBalance(settlement);
  const validMaleParticipant = livingMales.some(survivor => survivor.id === intimacyMaleId);
  const validFemaleParticipant = livingFemales.some(survivor => survivor.id === intimacyFemaleId);
  const activeSurvivor = livingSurvivors.find(survivor => survivor.id === settlement.activeSurvivorId);
  const discoveredQuarries = quarryList.filter(quarry =>
    quarry.role === 'quarry' &&
    (settlement.discoveredQuarries.includes(quarry.id) || isQuarryUnlocked(quarry, settlement))
  );
  const unlockedHuntableQuarries = discoveredQuarries.filter(quarry =>
    quarry.role === 'quarry' && quarry.huntable
  );
  const rumouredQuarries = quarryList.filter(quarry =>
    quarry.huntable &&
    quarry.role === 'quarry' &&
    !settlement.discoveredQuarries.includes(quarry.id)
  );
  const lockedArchiveQuarries = quarryList.filter(quarry =>
    quarry.role === 'quarry' &&
    !unlockedHuntableQuarries.includes(quarry) && !rumouredQuarries.includes(quarry)
  );
  const revealedNemeses = settlement.revealedNemesisIds
    .map(id => nemesisEncounters[id])
    .filter(Boolean);
  const unknownThreatCount = Math.max(0, nemesisList.length - revealedNemeses.length);
  const hasPersonalCard = livingSurvivors.some(survivor =>
    starterCardIds.some(cardId => !survivor.forgottenCardIds?.includes(cardId)) ||
    survivor.personalDeckAdditions.some(addition => {
      const cardId = getPersonalCardId(addition);
      return cardId && cardId !== 'panic' && !survivor.forgottenCardIds?.includes(cardId);
    })
  );
  const hasPanic = livingSurvivors.some(survivor =>
    [...survivor.personalDeckAdditions, ...(survivor.permanentNegativeCards || [])]
      .some(addition =>
        getPersonalCardId(addition) === 'panic' &&
        !survivor.forgottenCardIds?.includes('panic')
      )
  );
  const hasInjury = livingSurvivors.some(survivor => survivor.injuries.length > 0);

  const getMemoryActionStatus = actionId => {
    if (actionId === 'forgetCard') {
      if (!hasEarlyForgettingAccess(settlement)) return 'Requires the Lantern Hearth';
      if (!hasPersonalCard) return 'No eligible personal cards';
      if (livingSurvivors.every(survivor => survivor.lastForgetLanternYear === settlement.lanternYear)) {
        return 'Already used for every survivor this Lantern Year';
      }
      if (settlement.settlementMemory < EARLY_FORGETTING_COST) return 'Not enough Memory';
      return 'Available in survivor details';
    }
    if (['quietNight', 'taboo'].includes(actionId) && !hasPanic) return 'No eligible Panic cards';
    if (actionId === 'painLessons' && !hasInjury) return 'No injuries to transform';
    if (isMemoryActionUsed(settlement, actionId)) return 'Already used this Lantern Year';
    const memoryCost = {
      quietNight: 1,
      weaponDrills: 1,
      taboo: 2,
      shrineOfNames: 2
    }[actionId] || 0;
    if (settlement.settlementMemory < memoryCost) return 'Not enough settlementMemory';
    return 'Available in survivor details';
  };

  const submitSurvivor = event => {
    event.preventDefault();
    onCreateSurvivor(survivorName, survivorGender, {
      appearance: survivorAppearance,
      useSpecialTrait,
      startingTrait
    });
    setSurvivorName('');
    setSurvivorAppearance('');
    setUseSpecialTrait(false);
    setStartingTrait('');
  };

  const huntButton = (
    <button
      type="button"
      className="primary-action"
      disabled={!activeSurvivor || settlement.population <= 0 || Boolean(settlement.pendingTimelineEvent)}
      onClick={onBeginHunt}
    >
      {settlement.pendingTimelineEvent
        ? 'Resolve the Lantern Year decision before hunting'
        : `Hunt ${quarries[selectedQuarry]?.name} Level ${selectedLevel} with ${activeSurvivor ? getSurvivorDisplayName(activeSurvivor) : 'no survivor'}`}
    </button>
  );

  return (
    <section className="settlement-hub">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Settlement</p>
          <h2>{settlement.settlementName || 'Unnamed Settlement'}</h2>
        </div>
        <div className="settlement-stats">
          <span>Population: {settlement.population}</span>
          <span>Hunt party slots: {settlement.maxHuntPartySize}/4</span>
          <span title="Gain Memory from successful intimacy, living hunt returns, hunt events, and burial. Spend it on innovation, rest, training, newborn development, and intimacy protection.">
            Memories: {memoryBalance}
          </span>
          <span>Lantern Year: {settlement.lanternYear}</span>
          <span>Save Slot {activeSlot}</span>
        </div>
        <button type="button" className="secondary-button" onClick={onReturnToTitle}>Return to Title</button>
      </header>

      <nav className="settlement-tabs" aria-label="Settlement sections">
        {tabs.map(tabId => (
          <button type="button" key={tabId} className={tab === tabId ? 'active' : ''} onClick={() => setTab(tabId)}>
            {tabId}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="settlement-panel">
          <div className="summary-stat-grid">
            <span><strong>Settlement</strong>{settlement.settlementName}</span>
            <span><strong>Save Slot</strong>{activeSlot}</span>
            <span><strong>Population</strong>{settlement.population}</span>
            <span><strong>Living Survivors</strong>{livingSurvivors.length}</span>
            <span><strong>Total Runs</strong>{settlement.totalRuns}</span>
            <span><strong>Dead Survivors</strong>{settlement.deadSurvivors}</span>
            <span><strong>Lantern Year</strong>{settlement.lanternYear}</span>
            <span>
              <strong>Memory Actions Available</strong>
              {settlement.builtMemoryInnovations
                .flatMap(id => memoryInnovationList.find(item => item.id === id)?.actionUnlocks || [])
                .filter(actionId => getMemoryActionStatus(actionId) === 'Available in survivor details').length}
            </span>
          </div>
          <details className="memory-ledger">
            <summary>Memory Ledger ({settlement.memoryHistory?.length || 0} transactions)</summary>
            <p className="muted-text">
              Gain: successful intimacy, living hunt returns, hunt events, and burial.
              Spend: innovation, rest, training, newborn development, and intimacy protection.
            </p>
            {(settlement.memoryHistory || []).slice(0, 20).map(entry => (
              <p key={entry.id || entry.timestamp}>
                <strong>{entry.amount > 0 ? '+' : ''}{entry.amount}</strong>{' '}
                {formatValueForDisplay(entry.source)}: {entry.description}
                <small> Balance {entry.balance}</small>
              </p>
            ))}
            {!settlement.memoryHistory?.length && <p>No Memory transactions recorded.</p>}
          </details>
          <HuntHints settlement={settlement} recipes={visibleRecipes} />
          <section className="rumours-section">
            <h3>Lantern Year Timeline</h3>
            <p>Current Lantern Year: {settlement.lanternYear}</p>
            <p>Campaign pressure: {settlement.campaignPressure || 0}</p>
            <p>
              Last event: {settlement.lastTimelineEvent
                ? `${formatValueForDisplay(settlement.lastTimelineEvent.name)} - ${formatHistoryDetail(settlement.lastTimelineEvent.description)}`
                : 'No yearly event recorded yet.'}
            </p>
            {nextTimelineMilestone && (
              <p>Next known milestone: Year {nextTimelineMilestone.lanternYear}</p>
            )}
            {settlement.pendingTimelineEvent && (
              <article className="item-card">
                <p className="eyebrow">Decision Required</p>
                <h4>Lantern Year {settlement.pendingTimelineEvent.lanternYear}: {settlement.pendingTimelineEvent.title}</h4>
                <p>{formatHistoryDetail(settlement.pendingTimelineEvent.description)}</p>
                {(settlement.pendingTimelineEvent.storyParagraphs || []).map((paragraph, index) => (
                  <p key={`${settlement.pendingTimelineEvent.id}-story-${index}`}>
                    {paragraph}
                  </p>
                ))}
                {settlement.pendingTimelineEvent.choices.map(choice => (
                  <div className="event-choice-card" key={choice.id}>
                    <h4>{choice.label}</h4>
                    <p>{formatHistoryDetail(choice.storyText)}</p>
                    <p className="muted-text">{formatHistoryDetail(choice.preview)}</p>
                    {choice.requiresNomination && (
                      <label>
                        Nominate survivor
                        <select
                          value={timelineNomineeId}
                          onChange={event => setTimelineNomineeId(event.target.value)}
                        >
                          <option value="">Choose a living survivor</option>
                          {livingSurvivors.map(survivor => (
                            <option value={survivor.id} key={`${choice.id}-${survivor.id}`}>
                              {getSurvivorDisplayName(survivor)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <button
                      type="button"
                      disabled={choice.requiresNomination && !timelineNomineeId}
                      onClick={() => {
                        onTimelineChoice(
                          choice.id,
                          choice.requiresNomination ? [timelineNomineeId] : []
                        );
                        setTimelineNomineeId('');
                      }}
                    >
                      Choose: {choice.label}
                    </button>
                  </div>
                ))}
              </article>
            )}
            {!settlement.pendingTimelineEvent && settlement.lastTimelineResult && (
              <article className="item-card">
                <p className="eyebrow">Timeline Result</p>
                <h4>{settlement.lastTimelineResult.title}: {settlement.lastTimelineResult.choiceLabel}</h4>
                <p>{settlement.lastTimelineResult.storyText}</p>
                {!!settlement.lastTimelineResult.nominatedSurvivorNames?.length && (
                  <p>Nominated: {settlement.lastTimelineResult.nominatedSurvivorNames.join(', ')}</p>
                )}
                <ul>
                  {settlement.lastTimelineResult.appliedEffects.map((effect, index) => (
                    <li key={`timeline-effect-${index}`}>{formatHistoryDetail(effect)}</li>
                  ))}
                </ul>
              </article>
            )}
            <details>
              <summary>Settlement Timeline History ({settlement.timelineHistory.length})</summary>
              {settlement.timelineHistory.slice().reverse().map(entry => (
                <p key={`${entry.lanternYear}-${entry.id}`}>
                  Year {entry.lanternYear}: <strong>{formatValueForDisplay(entry.name)}</strong>
                  {' - '}{formatHistoryDetail(entry.description)}
                  {entry.choiceText ? ` Choice: ${formatHistoryDetail(entry.choiceText)}.` : ''}
                </p>
              ))}
            </details>
            <h4>Timeline Threats</h4>
            {revealedNemeses.length ? revealedNemeses.map(nemesis => (
              <p key={nemesis.id}>
                <strong>{formatValueForDisplay(nemesis.displayName)}</strong>
                {' - '}{formatHistoryDetail(nemesis.description)}
              </p>
            )) : <p>No timeline threat has entered the lanternlight.</p>}
            {unknownThreatCount > 0 && (
              <p>Something watches from beyond the lanternlight. ({unknownThreatCount} unknown threats)</p>
            )}
            {settlement.lastNemesisResult && (
              <p>
                Latest nemesis result: <strong>{settlement.lastNemesisResult.nemesisName}</strong>{' '}
                - {settlement.lastNemesisResult.result}
              </p>
            )}
          </section>
          <h3>Current Hunter</h3>
          {activeSurvivor ? (
            <SurvivorCard
              survivor={activeSurvivor}
              active
              settlement={settlement}
              onSelect={onSelectSurvivor}
              onStartHunt={onStartHunt}
              onRestSurvivor={onRestSurvivor}
              onTreatInjury={onTreatInjury}
              onForgetCard={onForgetCard}
              onMemoryCardRemoval={onMemoryCardRemoval}
              onWeaponDrill={onWeaponDrill}
              onPainLesson={onPainLesson}
              onShrineOfNames={onShrineOfNames}
            />
          ) : <p>No living survivor selected.</p>}
          {huntButton}
        </div>
      )}

      {tab === 'survivors' && (
        <div className="settlement-panel">
          <h3>Create Survivor</h3>
          <form className="survivor-form" onSubmit={submitSurvivor}>
            <input value={survivorName} placeholder="Founder name" onChange={event => setSurvivorName(event.target.value)} />
            <select value={survivorGender} onChange={event => setSurvivorGender(event.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              value={survivorAppearance}
              placeholder="Appearance (optional)"
              onChange={event => setSurvivorAppearance(event.target.value)}
            />
            {settlement.pendingSpecialChildTrait && (
              <div className="item-card">
                <label>
                  <input
                    type="checkbox"
                    checked={useSpecialTrait}
                    onChange={event => setUseSpecialTrait(event.target.checked)}
                  />
                  Use pending special child trait
                </label>
                <strong>
                  {childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.name ||
                    settlement.pendingSpecialChildTrait}
                </strong>
                <p>
                  {formatValueForDisplay(
                    childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.description
                  )}
                </p>
                <p className="effect-text">
                  {formatModifierEffect(
                    childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.effectText ||
                    childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.mechanicalEffect
                  )}
                </p>
              </div>
            )}
            {settlement.builtMemoryInnovations.includes('trialNames') && (
              <select value={startingTrait} onChange={event => setStartingTrait(event.target.value)}>
                <option value="">No Trial Name trait</option>
                {Object.values(startingTraits).map(trait => (
                  <option value={trait.id} key={trait.id}>
                    {trait.name}: {formatModifierEffect(trait.effect)}
                  </option>
                ))}
              </select>
            )}
            <button type="submit" disabled={livingSurvivors.length >= settlement.population}>Create Survivor</button>
          </form>
          <p className="muted-text">
            Founders keep one name. Children born through intimacy receive a given name and family name.
          </p>
          {livingSurvivors.length >= settlement.population && (
            <p className="muted-text">Named survivors already match the settlement population.</p>
          )}
          <h3>Living Survivors</h3>
          <section className="memory-actions-panel">
            <h3>Memory Actions</h3>
            {hasEarlyForgettingAccess(settlement) && (
              <p>
                <strong>Guided Reflection ({EARLY_FORGETTING_COST} Memory):</strong>{' '}
                {getMemoryActionStatus('forgetCard')}. Open a survivor&apos;s details and use
                Forget beside an eligible personal or basic card.
              </p>
            )}
            {settlement.builtMemoryInnovations.flatMap(id => {
              const innovation = memoryInnovationList.find(item => item.id === id);
              if (id === 'riteOfForgetting') return [];
              return (innovation?.actionUnlocks || []).map(actionId => (
                <p key={actionId}>
                  <strong>{innovation.name}:</strong>{' '}
                  {getMemoryActionStatus(actionId)}
                </p>
              ));
            })}
            {!hasEarlyForgettingAccess(settlement) && !settlement.builtMemoryInnovations.some(id =>
              memoryInnovationList.find(item => item.id === id)?.actionUnlocks?.length
            ) && <p className="muted-text">Build a memory innovation to unlock survivor actions.</p>}
          </section>
          <div className="item-grid">
            {livingSurvivors.map(survivor => (
              <SurvivorCard
                key={survivor.id}
                survivor={survivor}
                active={survivor.id === settlement.activeSurvivorId}
                settlement={settlement}
                onSelect={onSelectSurvivor}
                onStartHunt={onStartHunt}
                onRestSurvivor={onRestSurvivor}
                onTreatInjury={onTreatInjury}
                onForgetCard={onForgetCard}
                onMemoryCardRemoval={onMemoryCardRemoval}
                onWeaponDrill={onWeaponDrill}
                onPainLesson={onPainLesson}
                onShrineOfNames={onShrineOfNames}
              />
            ))}
          </div>
          {huntButton}
        </div>
      )}

      {tab === 'armory' && (
        <div className="settlement-panel">
          <h3>Settlement Stash</h3>
          <Stash stash={settlement.stash} />
          <HuntHints settlement={settlement} recipes={visibleRecipes} />

          <div className="armoury-header">
            <h3>Settlement Armoury</h3>
            <div className="button-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showLockedGear}
                  onChange={e => setShowLockedGear(e.target.checked)}
                />
                Show locked gear
              </label>
              {import.meta.env.DEV && (
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showLegacyGear}
                    onChange={e => setShowLegacyGear(e.target.checked)}
                  />
                  Show legacy / hidden review
                </label>
              )}
            </div>
          </div>

          <div className="sub-tabs">
            {armouryTabs.map(tabId => (
              <button
                key={tabId}
                type="button"
                className={`tab-button ${activeArmouryTab === tabId ? 'active' : ''}`}
                onClick={() => setActiveArmouryTab(tabId)}
              >
                {tabId}
              </button>
            ))}
          </div>

          {activeArmouryTab === 'Stored Gear' && (
            <>
              <h3>Stored Gear</h3>
              <div className="item-grid">
                {settlement.armory.map(gear => {
                  const recipe = getEquipment(gear.equipmentId);
                  return (
                    <article className="item-card" key={gear.instanceId}>
                      <p className="eyebrow">{recipe.slot || 'gear'}</p>
                      <h4>{recipe.name}</h4>
                      {(recipe.deprecated || recipe.hiddenFromCrafting) && (
                        <p className="locked-badge">Legacy gear retained from an older save.</p>
                      )}
                      <p>{formatValueForDisplay(recipe.passiveText)}</p>
                      <p className="muted-text">Assign it from the pre-hunt Loadout screen.</p>
                    </article>
                  );
                })}
              </div>
              {!settlement.armory.length && <p>No unbound gear is stored in the Armoury.</p>}
            </>
          )}

          {activeArmouryTab === 'Bound Gear' && (
            <>
              <h3>{activeSurvivor?.name || 'Active survivor'} Bound Gear</h3>
              <div className="item-grid">
                {(activeSurvivor?.boundGear || []).map(gear => {
                  const recipe = getEquipment(gear.equipmentId);
                  return (
                    <article className="item-card built" key={gear.instanceId}>
                      <p className="eyebrow">{recipe.slot || 'gear'}</p>
                      <h4>{recipe.name}</h4>
                      {(recipe.deprecated || recipe.hiddenFromCrafting) && (
                        <p className="locked-badge">Legacy gear retained from an older save.</p>
                      )}
                      <p>{formatValueForDisplay(recipe.passiveText)}</p>
                      <p className="muted-text">Remove it from Loadout only; removal destroys it.</p>
                    </article>
                  );
                })}
              </div>
              {!(activeSurvivor?.boundGear || []).length && <p>No gear is bound to this survivor.</p>}
            </>
          )}

          {activeArmouryTab !== 'Stored Gear' && activeArmouryTab !== 'Bound Gear' && (
            activeArmouryTab && armouryData[activeArmouryTab] ? (
              <div className="armoury-tab-content">
              {Object.entries(armouryData[activeArmouryTab]).map(([source, recipes]) => (
                <section className="recipe-group" key={source}>
                  <h3>{source === 'General' ? activeArmouryTab : `${quarries[source]?.name || source} craftables`}</h3>
                  <div className="item-grid">
                    {recipes.map(recipe => {
                      const unlockState = getGearUnlockState(recipe, settlement);
                      const isLocked = !unlockState.unlocked;
                      return (
                        <article className={`item-card ${isLocked ? 'locked' : ''}`} key={recipe.stableId || recipe.id}>
                          <p className="eyebrow">{recipe.slot}</p>
                          <h4>{getGearDisplayName(recipe)}</h4>
                          {(recipe.deprecated || recipe.hiddenFromCrafting) && (
                            <p className="locked-badge">Legacy / hidden. Review only; cannot be crafted.</p>
                          )}
                          {isLocked && <p className="locked-badge">Locked: {unlockState.reason}</p>}
                          <p>
                            <strong>Type:</strong> {recipe.weaponType || 'Non-weapon'} |{' '}
                            <strong>Hands:</strong> {recipe.hands || 0} | <strong>Speed:</strong> {recipe.speedStyle || 'standard'}
                          </p>
                          <p><strong>Keywords:</strong> {recipe.keywords?.join(', ') || 'Survival'}</p>
                          <p>{formatValueForDisplay(recipe.description || recipe.passiveText)}</p>
                          <p className="effect-text">{formatModifierEffect(recipe.passiveText)}</p>
                          {recipe.deckIdentity && (
                            <p className="effect-text">Deck identity: {recipe.deckIdentity}</p>
                          )}
                          {recipe.cardPackage?.length > 0 && (
                            <>
                              <p className="muted-text"><strong>Adds:</strong></p>
                              <ul>
                                {recipe.cardPackage.map((cardId, index) => (
                                  <li key={`${cardId}-${index}`}>
                                    <strong>{cards[cardId]?.name || cardId}</strong>:{' '}
                                    {formatValueForDisplay(cards[cardId]?.description)}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <CostList cost={recipe.cost} stash={settlement.stash} />
                          {!isLocked && !recipe.deprecated && !recipe.hiddenFromCrafting && (
                            <button
                              type="button"
                              disabled={!canAffordCost(recipe.cost, settlement.stash)}
                              onClick={() => onCraft(recipe)}
                            >
                              Craft
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
              </div>
            ) : (
              <p>No crafting recipes available in this category.</p>
            )
          )}
          {recipeTabs.length === 0 && !showLockedGear && (
            <p>Build a crafting location to reveal its recipes.</p>
          )}
        </div>
      )}

      {tab === 'innovations' && (
        <div className="settlement-panel">
          <h3>Settlement Structures</h3>
          <p className="muted-text">
            Structures are unlocked by innovations, discoveries, and campaign progress. Innovation
            cards themselves are acquired only through the deck below.
          </p>
          <div className="item-grid">
            {builtInnovations.map(item => (
              <article className="item-card built" key={item.id}>
                <p className="eyebrow">{item.category}</p>
                <h4>{item.name}</h4>
                <p>{formatValueForDisplay(item.description)}</p>
                <p className="effect-text">{formatEffectsForDisplay(item.effects)}</p>
              </article>
            ))}
            {!builtInnovations.length && <p>No standalone structures have been built.</p>}
          </div>
          <h3>Unlocked Structures</h3>
          <div className="item-grid">
            {buildableInnovations.map(item => {
              const affordable = canAffordCost(item.cost, settlement.stash) ||
                (item.fallbackCost && canAffordCost(item.fallbackCost, settlement.stash));
              return (
                <article className="item-card" key={item.id}>
                  <h4>{item.name}</h4>
                  <p>{formatValueForDisplay(item.description)}</p>
                  <p>[Requires: {item.unlockText}]</p>
                  <CostList cost={item.cost} stash={settlement.stash} />
                  <button type="button" disabled={!affordable} onClick={() => onBuild(item)}>Build {item.name}</button>
                </article>
              );
            })}
            {!buildableInnovations.length && <p>No structures are currently waiting to be built.</p>}
          </div>
          <section className="rumours-section">
            <h3>Structure Rumours</h3>
            {rumouredInnovations.map(item => <p key={item.id}><strong>{item.name}</strong> [Requires: {item.unlockText} (missing)]</p>)}
            {!rumouredInnovations.length && <p>No unresolved structure rumours.</p>}
          </section>
          <section className="memory-innovations-section">
            <h3>Innovation Deck</h3>
            <p>
              Spend 1 Memory and any 3 basic resources to draw up to 3 innovations,
              then choose one. There is no normal direct-purchase innovation list.
            </p>
            <p>
              Available pool: {drawableInnovationIds.length} | Memory: {memoryBalance} |
              Basic resources: {basicResourceCount}
            </p>
            <button
              type="button"
              disabled={!canAttemptInnovation}
              onClick={onAttemptInnovation}
            >
              Attempt Innovation
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowDeckInspection(!showDeckInspection)}
            >
              {showDeckInspection ? 'Hide Deck' : 'Inspect Innovation Deck'}
            </button>

            {showDeckInspection && (
              <div className="deck-inspection item-card">
                {[
                  ['Available to Draw', 'available'],
                  ['Previously Drawn', 'drawn'],
                  ['Prerequisite Locked', 'prerequisite-locked'],
                  ['Not Yet Added to Pool', 'locked'],
                  ['Owned', 'owned']
                ].map(([label, status]) => {
                  const entries = innovationDeckEntries.filter(entry => entry.status === status);
                  return (
                    <details key={status} open={status === 'available' || status === 'owned'}>
                      <summary>{label} ({entries.length})</summary>
                      <div className="item-grid">
                        {entries.map(item => (
                          <article className={`item-card ${status === 'owned' ? 'built' : ''}`} key={item.id}>
                            <p className="eyebrow">Tier {item.tier} | {item.category}</p>
                            <h4>{item.name}</h4>
                            <p>{formatValueForDisplay(item.description)}</p>
                            <p className="effect-text">{item.settlementBoostSummary}</p>
                            <p><strong>Destination:</strong> {item.uiDestination}</p>
                            <p><strong>Attempt cost:</strong> {item.memoryCost ?? 1} Memory plus shared draw resources</p>
                            {item.lockReason && <p className="missing">{item.lockReason}</p>}
                            <details>
                              <summary>{item.tutorialTitle}</summary>
                              <ol>
                                {item.tutorialSteps.map(step => <li key={step}>{step}</li>)}
                              </ol>
                            </details>
                          </article>
                        ))}
                        {!entries.length && <p>None.</p>}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}

            {!drawableInnovationIds.length && (
              <p className="missing">
                No available innovations. Unlock more through hunts, discoveries or timeline events.
              </p>
            )}
            <h3>Owned Innovations</h3>
            <div className="item-grid">
              {ownedInnovationEntries.map(item => (
                  <article className="item-card built" key={item.id}>
                    <p className="eyebrow">Tier {item.tier} | {item.category}</p>
                    <h4>{item.name}</h4>
                    <p>{formatValueForDisplay(item.description)}</p>
                    <p className="effect-text">{item.settlementBoostSummary}</p>
                    <p><strong>Use at:</strong> {item.uiDestination}</p>
                    <details>
                      <summary>{item.tutorialTitle}</summary>
                      {item.tutorialSteps.length ? (
                        <ol>{item.tutorialSteps.map(step => <li key={step}>{step}</li>)}</ol>
                      ) : <p>Legacy innovation details are unavailable.</p>}
                    </details>
                  </article>
                ))}
            </div>
            <details>
              <summary>Innovation History ({settlement.innovationDeckState.innovationHistory.length})</summary>
              {settlement.innovationDeckState.innovationHistory.slice().reverse().map((entry, index) => (
                <p key={`${entry.timestamp}-${index}`}>
                  Year {entry.lanternYear}: {entry.type === 'chosen'
                    ? `Chose ${getInnovationDefinition(innovationCards, entry.innovationId).name}`
                    : `Attempted innovation (${entry.offeredIds?.length || 0} offers)`}
                </p>
              ))}
            </details>
          </section>
        </div>
      )}

      {tab === 'population' && (
        <div className="settlement-panel">
          <h3>Population and Intimacy</h3>
          <p>Population: {settlement.population}</p>
          <p>Lantern Year: {settlement.lanternYear}</p>

          {(() => {
            const projections = calculateIntimacyProjections(settlement, innovationCards);
            return (
              <div className="intimacy-transparency">
                <div className="odds-breakdown">
                  <h4>Intimacy Odds</h4>
                  <p>Base Success: {(projections.baseSuccessChance * 100).toFixed(0)}%</p>
                  <p>Base Tragedy Risk: {(projections.baseTragedyChance * 100).toFixed(0)}%</p>

                  {projections.modifiers.length > 0 && (
                    <ul className="modifier-list">
                      {projections.modifiers.map((mod, idx) => (
                        <li key={idx} className={mod.value > 0 ? 'bonus' : 'penalty'}>
                          {mod.name}: {mod.value > 0 ? '+' : ''}{(mod.value * 100).toFixed(0)}% {mod.type}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="final-odds">
                    <strong>Final Success Chance: {(projections.finalSuccessChance * 100).toFixed(0)}%</strong><br/>
                    <strong>Final Tragedy Risk: {(projections.finalTragedyChance * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                <div className="how-to-improve">
                  <h4>How to Improve Odds</h4>
                  <ul>
                    {!settlement.innovationDeckState.builtInnovationIds.includes('cooking') && <li>Innovate: Cooking (+10% success)</li>}
                    {!settlement.innovationDeckState.builtInnovationIds.includes('language') && <li>Innovate: Language (+5% success)</li>}
                    {!settlement.innovationDeckState.builtInnovationIds.includes('ammonia') && <li>Innovate: Ammonia (-10% tragedy)</li>}
                    <li>Discovery: Certain landmarks may offer bonuses.</li>
                  </ul>
                </div>
              </div>
            );
          })()}

          <p className="muted-text">One attempt is allowed per Lantern Year. A disastrous roll can kill a participant.</p>
          <p className="effect-text">A successful intimacy grants 1 Memory.</p>
          {intimacyUsedThisYear && <p className="missing">Unavailable: intimacy was already attempted this Lantern Year.</p>}
          {!livingMales.length && <p className="missing">Unavailable: no living male survivor.</p>}
          {!livingFemales.length && <p className="missing">Unavailable: no living female survivor.</p>}
          <label className="field-label" htmlFor="intimacy-male">Male participant</label>
          <select id="intimacy-male" value={intimacyMaleId} onChange={event => setIntimacyMaleId(event.target.value)}>
            <option value="">Choose survivor</option>
            {livingMales.map(survivor => <option key={survivor.id} value={survivor.id}>{getSurvivorDisplayName(survivor)}</option>)}
          </select>
          <label className="field-label" htmlFor="intimacy-female">Female participant</label>
          <select id="intimacy-female" value={intimacyFemaleId} onChange={event => setIntimacyFemaleId(event.target.value)}>
            <option value="">Choose survivor</option>
            {livingFemales.map(survivor => <option key={survivor.id} value={survivor.id}>{getSurvivorDisplayName(survivor)}</option>)}
          </select>
          <button
            type="button"
            disabled={intimacyUsedThisYear || !validMaleParticipant || !validFemaleParticipant}
            onClick={() => {
              onAttemptIntimacy(intimacyMaleId, intimacyFemaleId, {
                mitigateRisk: spendMemoryOnIntimacy
              });
              setSpendMemoryOnIntimacy(false);
            }}
          >
            Attempt Intimacy
          </button>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={spendMemoryOnIntimacy}
              disabled={!canSpendMemories(settlement, 1)}
              onChange={event => setSpendMemoryOnIntimacy(event.target.checked)}
            />
            Spend 1 Memory to reduce tragedy risk by 10%
          </label>
          <p className="muted-text">
            Newborn trait and fighting-art investment will use escalating Memory costs.
            The central spending hook is ready; quality tables arrive in a later patch.
          </p>
          <p className="muted-text">
            Children inherit the birthing parent&apos;s family name when available, then the other
            parent&apos;s. Two founders begin a new family line.
          </p>
          {settlement.pendingSpecialChildTrait && (
            <div className="item-card">
              <h4>{childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.name}</h4>
              <p>{formatValueForDisplay(
                childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.description
              )}</p>
              <p className="effect-text">
                {formatModifierEffect(
                  childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.effectText ||
                  childTraits[normalizeChildTraitId(settlement.pendingSpecialChildTrait)]?.mechanicalEffect
                )}
              </p>
            </div>
          )}
          <h3>Recent Results</h3>
          {settlement.intimacyHistory.length ? (
            <ul className="history-list">
              {settlement.intimacyHistory.slice(0, 8).map(entry => (
                <li key={entry.timestamp}>
                  Year {entry.lanternYear ?? '?'}: {entry.participantNames?.join(' and ') || 'Unknown participants'}
                  {entry.roll ? ` rolled ${entry.roll}.` : ''}{' '}
                  {formatHistoryDetail(entry.outcome || entry.result)}
                  {entry.deathName ? ` ${entry.deathName} died.` : ''}
                  <small>{new Date(entry.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : <p>No intimacy attempts recorded.</p>}
        </div>
      )}

      {tab === 'graveyard' && (
        <div className="settlement-panel">
          <h3>Fallen Survivors</h3>
          {(settlement.pendingDeathResolutions || []).some(entry => entry.status === 'pending') && (
            <section className="death-resolution-list">
              <h3>Bodies Awaiting Resolution</h3>
              {(settlement.pendingDeathResolutions || [])
                .filter(entry => entry.status === 'pending')
                .map(entry => (
                  <article className="item-card" key={entry.id}>
                    <h4>{entry.survivorName}</h4>
                    <p>{entry.cause}</p>
                    <p className="muted-text">
                      Lay them to rest for 1 Memory, or recover one basic resource.
                    </p>
                    <div className="button-row">
                      <button type="button" onClick={() => onResolveDeath(entry.id, 'bury')}>
                        Lay to Rest (+1 Memory)
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onResolveDeath(entry.id, 'recover-resource', 'bone')}
                      >
                        Recover 1 Bone
                      </button>
                    </div>
                  </article>
                ))}
            </section>
          )}
          {settlement.graveHistory.length ? (
            <div className="item-grid">
              {settlement.graveHistory.map(grave => (
                <article className="item-card" key={`${grave.timestamp}-${grave.survivorName}`}>
                  <h4>{grave.survivorName}</h4>
                  <p>Cause of death: {grave.killedBy}</p>
                  <p>Completed runs: {grave.completedRuns || 0}</p>
                  <p>Traits lost: {grave.traits?.join(', ') || 'None recorded'}</p>
                  <p>Fighting arts lost: {grave.fightingArts?.join(', ') || 'None recorded'}</p>
                  <p>
                    Weapon proficiency: {grave.proficientWeaponTypes?.length
                      ? grave.proficientWeaponTypes.map(item =>
                        `${item.name || item.type} ${item.mastered ? '(Mastered)' : `(${item.xp} XP)`}`
                      ).join(', ')
                      : 'None recorded'}
                  </p>
                  <p>Gear lost: {grave.gearLostNames?.join(', ') || 'None'}</p>
                  <p>
                    Lost with {grave.injuries?.length || 0} injuries, {grave.scars?.length || 0} scars,{' '}
                    {grave.disorders?.length || 0} disorders, and {grave.gearLostCount || 0} gear pieces.
                  </p>
                  <p>Legacy: {grave.chosenLegacyId || 'Not yet chosen'}</p>
                </article>
              ))}
            </div>
          ) : <p>No graves yet. The settlement waits.</p>}
        </div>
      )}

      {tab === 'quarries' && (
        <div className="settlement-panel">
          <h3>Tier Progression</h3>
          {['early', 'mid', 'late', 'apex'].map(tier => {
            const progress = getQuarryTierProgress(settlement, tier);
            const available = calculateAvailableQuarryTiers(settlement).includes(tier);
            return (
              <p key={tier}>
                <strong>{tier.charAt(0).toUpperCase() + tier.slice(1)} Tier:</strong>{' '}
                {available
                  ? `${progress.unlocked} / ${progress.total} unlocked. Next tier becomes available at 50%.`
                  : 'Locked until 50% of the previous tier is unlocked.'}
              </p>
            );
          })}
          <h3>Unlocked Huntable</h3>
          <div className="quarry-list">
            {unlockedHuntableQuarries.map(quarry => {
              const unlocked = isQuarryUnlocked(quarry, settlement);
              const baneSurvivors = livingSurvivors.filter(survivor =>
                survivor.fightingArts.includes(`monsterBane_${quarry.id}`)
              );
              return (
                <article className="quarry-card" key={quarry.id}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    className={selectedQuarry === quarry.id ? 'selected' : ''}
                    onClick={() => onSelectQuarry(quarry.id)}
                  >
                    <strong>{quarry.name}</strong>
                    <span>{unlocked
                      ? formatValueForDisplay(quarry.description)
                      : quarry.unlockRequirement
                        ? `Rumour: ${quarry.name} requires earlier quarry progress.`
                        : 'Locked'}</span>
                  </button>
                  <p>Highest defeated level: {getHighestDefeatedQuarryLevel(settlement, quarry.id)}</p>
                  <p>Levels unlocked: 1-{getAvailableQuarryLevel(quarry.id, settlement)}</p>
                  <p>Resources: {quarry.uniqueResources.map(resourceId => resources[resourceId]?.name || resourceId).join(', ')}</p>
                  <p>Buildings: {quarry.buildingUnlocks.join(', ') || 'None'}</p>
                  <p>{getQuarryBehaviourLabel(quarry)}</p>
                  {getQuarryBehaviourNote(quarry) && <p>{getQuarryBehaviourNote(quarry)}</p>}
                  <p>Monster Bane: {baneSurvivors.length ? baneSurvivors.map(survivor => survivor.name).join(', ') : 'No living survivor'}</p>
                </article>
              );
            })}
          </div>
          <h3>Rumoured</h3>
          <div className="quarry-list">
            {rumouredQuarries.map(quarry => (
              <article className="quarry-card" key={quarry.id}>
                <h4>{quarry.displayName}</h4>
                <p>{quarry.role} | {quarry.designTags.join(', ')}</p>
                <p>{quarry.unlockHint}</p>
                <p>{getQuarryBehaviourLabel(quarry)}</p>
                {getQuarryBehaviourNote(quarry) && <p>{getQuarryBehaviourNote(quarry)}</p>}
              </article>
            ))}
          </div>
          {settlement.rumourTexts?.length > 0 && (
            <>
              <h3>Quarry Rumours</h3>
              {settlement.rumourTexts.map((text, index) => (
                <p key={`rumour-${index}`}>{formatHistoryDetail(text)}</p>
              ))}
            </>
          )}
          <details>
            <summary>Settlement History ({settlement.settlementHistory?.length || 0})</summary>
            {(settlement.settlementHistory || []).slice().reverse().map((entry, index) => (
              <div className="muted-text" key={`${entry.timestamp || 'history'}-${index}`}>
                <strong>{formatValueForDisplay(
                  entry.title || entry.message || entry.type || 'Settlement event'
                )}</strong>
                {entry.text && <p>{formatHistoryDetail(entry.text)}</p>}
                {entry.historyText && <p>{formatHistoryDetail(entry.historyText)}</p>}
                {entry.effects && <p>Effects: {formatHistoryDetail(entry.effects)}</p>}
                {entry.rewards && <p>Rewards: {formatHistoryDetail(entry.rewards)}</p>}
                {entry.consequences && <p>Consequences: {formatHistoryDetail(entry.consequences)}</p>}
                {entry.details && <p>Details: {formatHistoryDetail(entry.details)}</p>}
              </div>
            ))}
          </details>
          <label className="field-label" htmlFor="quarry-level">Quarry level</label>
          <select id="quarry-level" value={selectedLevel} onChange={event => onSelectLevel(Number(event.target.value))}>
            {Array.from({ length: getAvailableQuarryLevel(selectedQuarry, settlement) }, (_, index) => index + 1)
              .map(level => <option value={level} key={level}>Level {level}</option>)}
          </select>
          {huntButton}
          <details className="content-registry">
            <summary>Locked Archive ({lockedArchiveQuarries.length})</summary>
            <div className="registry-list">
              {lockedArchiveQuarries.map(quarry => (
                <p key={quarry.id}>
                  <strong>{quarry.displayName}</strong> | {quarry.role} |{' '}
                  {quarry.huntable ? getQuarryBehaviourLabel(quarry) : 'Archive only'} | {quarry.unlockHint}
                </p>
              ))}
            </div>
          </details>
          <h3>Timeline Threats</h3>
          <h4>Revealed Nemesis</h4>
          {revealedNemeses.length ? revealedNemeses.map(nemesis => (
            <article className="quarry-card" key={nemesis.id}>
              <h4>{nemesis.displayName}</h4>
              <p>{formatHistoryDetail(nemesis.description)}</p>
            </article>
          )) : <p>None revealed.</p>}
          <h4>Unknown Threats</h4>
          {unknownThreatCount > 0
            ? <p>Something watches from beyond the lanternlight.</p>
            : <p>No unknown timeline threats remain.</p>}
        </div>
      )}
    </section>
  );
}
