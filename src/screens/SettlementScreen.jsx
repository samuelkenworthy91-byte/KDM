import React, { useMemo, useState } from 'react';
import { cards } from '../data/cards.js';
import { creatureFamilyList } from '../data/creatureFamilies.js';
import { equipmentList } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { innovationList, innovations } from '../data/innovations.js';
import {
  getAvailableQuarryLevel,
  isQuarryUnlocked,
  quarries,
  quarryList
} from '../data/quarries.js';
import { resources } from '../data/resources.js';
import {
  canAffordCost,
  canBuildUnlocked,
  formatCostWithMissing,
  getMissingResources
} from '../game/craftingLogic.js';

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
            {entry.text}
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

function SurvivorCard({ survivor, active, onSelect, onStartHunt }) {
  return (
    <article className={`item-card ${active ? 'built' : ''}`}>
      <h4>{survivor.name}</h4>
      <p>{survivor.gender || 'Unspecified'} | HP {survivor.hp}/{survivor.maxHp} | Survival {survivor.survival || 0}</p>
      <p><strong>Completed runs:</strong> {survivor.completedRuns || 0}</p>
      <p><strong>Traits:</strong> {survivor.traits?.join(', ') || 'None'}</p>
      {survivor.appearance && <p><strong>Appearance:</strong> {survivor.appearance}</p>}
      <p><strong>Fighting arts:</strong> {survivor.fightingArts?.length
        ? survivor.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')
        : 'None'}</p>
      <p><strong>Personal cards:</strong> {(survivor.personalDeckAdditions || survivor.deckAdditions)?.join(', ') || 'No additions'}</p>
      <button type="button" disabled={active} onClick={() => onSelect(survivor.id)}>
        {active ? 'Active Hunter' : 'Select Hunter'}
      </button>
      {onStartHunt && <button type="button" onClick={() => onStartHunt(survivor.id)}>Start Hunt</button>}
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
  onCreateSurvivor,
  onSelectSurvivor,
  onStartHunt,
  onAttemptIntimacy,
  onReturnToTitle
}) {
  const [tab, setTab] = useState('overview');
  const [survivorName, setSurvivorName] = useState('');
  const [survivorGender, setSurvivorGender] = useState('other');
  const [survivorAppearance, setSurvivorAppearance] = useState('');
  const [useSpecialTrait, setUseSpecialTrait] = useState(false);
  const [intimacyMaleId, setIntimacyMaleId] = useState('');
  const [intimacyFemaleId, setIntimacyFemaleId] = useState('');
  const visibleInnovations = innovationList.filter(item => canBuildUnlocked(item, settlement));
  const buildableInnovations = visibleInnovations.filter(item => !settlement.builtInnovations.includes(item.id));
  const builtInnovations = innovationList.filter(item => settlement.builtInnovations.includes(item.id));
  const rumouredInnovations = innovationList.filter(
    item => !settlement.builtInnovations.includes(item.id) && !canBuildUnlocked(item, settlement)
  );
  const recipeGroups = useMemo(() => {
    const groups = {};
    equipmentList.forEach(recipe => {
      if (!settlement.builtInnovations.includes(recipe.buildingId)) return;
      if (!groups[recipe.buildingId]) groups[recipe.buildingId] = [];
      groups[recipe.buildingId].push(recipe);
    });
    return groups;
  }, [settlement.builtInnovations]);
  const visibleRecipes = Object.values(recipeGroups).flat();
  const livingSurvivors = settlement.survivors.filter(survivor => survivor.alive !== false);
  const livingMales = livingSurvivors.filter(survivor => survivor.gender === 'male');
  const livingFemales = livingSurvivors.filter(survivor => survivor.gender === 'female');
  const intimacyUsedThisYear = settlement.lastIntimacyLanternYear === settlement.lanternYear;
  const validMaleParticipant = livingMales.some(survivor => survivor.id === intimacyMaleId);
  const validFemaleParticipant = livingFemales.some(survivor => survivor.id === intimacyFemaleId);
  const activeSurvivor = livingSurvivors.find(survivor => survivor.id === settlement.activeSurvivorId);
  const discoveredQuarries = quarryList.filter(quarry =>
    settlement.discoveredQuarries.includes(quarry.id) || isQuarryUnlocked(quarry, settlement)
  );

  const submitSurvivor = event => {
    event.preventDefault();
    onCreateSurvivor(survivorName, survivorGender, {
      appearance: survivorAppearance,
      useSpecialTrait
    });
    setSurvivorName('');
    setSurvivorAppearance('');
    setUseSpecialTrait(false);
  };

  const huntButton = (
    <button
      type="button"
      className="primary-action"
      disabled={!activeSurvivor || settlement.population <= 0}
      onClick={onBeginHunt}
    >
      Hunt {quarries[selectedQuarry]?.name} Level {selectedLevel} with {activeSurvivor?.name || 'no survivor'}
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
          <span>Memory: {settlement.settlementMemory}</span>
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
          </div>
          <HuntHints settlement={settlement} recipes={visibleRecipes} />
          <h3>Current Hunter</h3>
          {activeSurvivor ? <SurvivorCard survivor={activeSurvivor} active onSelect={onSelectSurvivor} onStartHunt={onStartHunt} /> : <p>No living survivor selected.</p>}
          {huntButton}
        </div>
      )}

      {tab === 'survivors' && (
        <div className="settlement-panel">
          <h3>Create Survivor</h3>
          <form className="survivor-form" onSubmit={submitSurvivor}>
            <input value={survivorName} placeholder="Survivor name" onChange={event => setSurvivorName(event.target.value)} />
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
              <label>
                <input
                  type="checkbox"
                  checked={useSpecialTrait}
                  onChange={event => setUseSpecialTrait(event.target.checked)}
                />
                Use pending trait: {settlement.pendingSpecialChildTrait}
              </label>
            )}
            <button type="submit" disabled={livingSurvivors.length >= settlement.population}>Create Survivor</button>
          </form>
          {livingSurvivors.length >= settlement.population && (
            <p className="muted-text">Named survivors already match the settlement population.</p>
          )}
          <h3>Living Survivors</h3>
          <div className="item-grid">
            {livingSurvivors.map(survivor => (
              <SurvivorCard
                key={survivor.id}
                survivor={survivor}
                active={survivor.id === settlement.activeSurvivorId}
                onSelect={onSelectSurvivor}
                onStartHunt={onStartHunt}
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
          <h3>Settlement Armory</h3>
          <div className="item-grid">
            {settlement.armory.map(gear => {
              const recipe = equipmentList.find(item => item.id === gear.equipmentId);
              return (
                <article className="item-card" key={gear.instanceId}>
                  <h4>{recipe?.name || gear.equipmentId}</h4>
                  <p>{recipe?.passiveText}</p>
                  <p className="muted-text">Free gear. Assign it from the pre-hunt Loadout screen.</p>
                </article>
              );
            })}
          </div>
          {!settlement.armory.length && <p>No unbound gear is stored in the armory.</p>}

          <h3>{activeSurvivor?.name || 'Active survivor'} Bound Gear</h3>
          <div className="item-grid">
            {(activeSurvivor?.boundGear || []).map(gear => {
              const recipe = equipmentList.find(item => item.id === gear.equipmentId);
              return (
                <article className="item-card built" key={gear.instanceId}>
                  <h4>{recipe?.name || gear.equipmentId}</h4>
                  <p>{recipe?.passiveText}</p>
                  <p className="muted-text">Bound equipment can only be removed from the Loadout screen and will be destroyed.</p>
                </article>
              );
            })}
          </div>

          {Object.entries(recipeGroups).map(([buildingId, recipes]) => (
            <section className="recipe-group" key={buildingId}>
              <h3>{innovations[buildingId]?.name || buildingId}</h3>
              <div className="item-grid">
                {recipes.map(recipe => (
                  <article className="item-card" key={recipe.id}>
                    <h4>{recipe.name}</h4>
                    <p>{recipe.description}</p>
                    <p className="effect-text">{recipe.passiveText}</p>
                    <p className="muted-text">
                      Cards: {recipe.cardPackage.map(cardId => cards[cardId]?.name || cardId).join(', ')}
                    </p>
                    <p className="muted-text">[Requires: Build {innovations[recipe.buildingId]?.name}]</p>
                    <CostList cost={recipe.cost} stash={settlement.stash} />
                    <button type="button" disabled={!canAffordCost(recipe.cost, settlement.stash)} onClick={() => onCraft(recipe)}>Craft</button>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!visibleRecipes.length && <p>Build a crafting location to reveal its recipes.</p>}
        </div>
      )}

      {tab === 'innovations' && (
        <div className="settlement-panel">
          <h3>Built Innovations and Buildings</h3>
          <div className="item-grid">
            {builtInnovations.map(item => (
              <article className="item-card built" key={item.id}>
                <p className="eyebrow">{item.category}</p>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="effect-text">{item.effects.join(' ')}</p>
              </article>
            ))}
          </div>
          <h3>Available to Build</h3>
          <div className="item-grid">
            {buildableInnovations.map(item => {
              const affordable = canAffordCost(item.cost, settlement.stash) ||
                (item.fallbackCost && canAffordCost(item.fallbackCost, settlement.stash));
              return (
                <article className="item-card" key={item.id}>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p>[Requires: {item.unlockText}]</p>
                  <CostList cost={item.cost} stash={settlement.stash} />
                  <button type="button" disabled={!affordable} onClick={() => onBuild(item)}>Build {item.name}</button>
                </article>
              );
            })}
          </div>
          <section className="rumours-section">
            <h3>Rumours</h3>
            {rumouredInnovations.map(item => <p key={item.id}><strong>{item.name}</strong> [Requires: {item.unlockText} (missing)]</p>)}
          </section>
        </div>
      )}

      {tab === 'population' && (
        <div className="settlement-panel">
          <h3>Population and Intimacy</h3>
          <p>Population: {settlement.population}</p>
          <p>Lantern Year: {settlement.lanternYear}</p>
          <p>One attempt is allowed per Lantern Year. A disastrous roll can kill a participant.</p>
          {intimacyUsedThisYear && <p className="missing">Unavailable: intimacy was already attempted this Lantern Year.</p>}
          {!livingMales.length && <p className="missing">Unavailable: no living male survivor.</p>}
          {!livingFemales.length && <p className="missing">Unavailable: no living female survivor.</p>}
          <label className="field-label" htmlFor="intimacy-male">Male participant</label>
          <select id="intimacy-male" value={intimacyMaleId} onChange={event => setIntimacyMaleId(event.target.value)}>
            <option value="">Choose survivor</option>
            {livingMales.map(survivor => <option key={survivor.id} value={survivor.id}>{survivor.name}</option>)}
          </select>
          <label className="field-label" htmlFor="intimacy-female">Female participant</label>
          <select id="intimacy-female" value={intimacyFemaleId} onChange={event => setIntimacyFemaleId(event.target.value)}>
            <option value="">Choose survivor</option>
            {livingFemales.map(survivor => <option key={survivor.id} value={survivor.id}>{survivor.name}</option>)}
          </select>
          <button
            type="button"
            disabled={intimacyUsedThisYear || !validMaleParticipant || !validFemaleParticipant}
            onClick={() => onAttemptIntimacy(intimacyMaleId, intimacyFemaleId)}
          >
            Attempt Intimacy
          </button>
          {settlement.pendingSpecialChildTrait && <p>Pending special child trait: {settlement.pendingSpecialChildTrait}</p>}
          <h3>Recent Results</h3>
          {settlement.intimacyHistory.length ? (
            <ul className="history-list">
              {settlement.intimacyHistory.slice(0, 8).map(entry => (
                <li key={entry.timestamp}>
                  Year {entry.lanternYear ?? '?'}: {entry.participantNames?.join(' and ') || 'Unknown participants'}
                  {entry.roll ? ` rolled ${entry.roll}.` : ''} {entry.outcome || entry.result}
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
          {settlement.graveHistory.length ? (
            <div className="item-grid">
              {settlement.graveHistory.map(grave => (
                <article className="item-card" key={`${grave.timestamp}-${grave.survivorName}`}>
                  <h4>{grave.survivorName}</h4>
                  <p>Cause of death: {grave.killedBy}</p>
                  <p>Completed runs: {grave.completedRuns || 0}</p>
                  <p>Traits lost: {grave.traits?.join(', ') || 'None recorded'}</p>
                  <p>Fighting arts lost: {grave.fightingArts?.join(', ') || 'None recorded'}</p>
                  <p>Gear lost: {grave.gearLostNames?.join(', ') || 'None'}</p>
                  <p>Legacy: {grave.chosenLegacyId || 'Not yet chosen'}</p>
                </article>
              ))}
            </div>
          ) : <p>No graves yet. The settlement waits.</p>}
        </div>
      )}

      {tab === 'quarries' && (
        <div className="settlement-panel">
          <h3>Known Quarries</h3>
          <div className="quarry-list">
            {discoveredQuarries.map(quarry => {
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
                    <span>{unlocked ? quarry.description : quarry.unlockRequirement ? `Rumour: ${quarry.name} requires earlier quarry progress.` : 'Locked'}</span>
                  </button>
                  <p>Highest defeated level: {settlement.defeatedQuarryLevels[quarry.id] || 0}</p>
                  <p>Resources: {Object.values(resources).filter(resource => resource.creatureId === quarry.id).map(resource => resource.name).join(', ')}</p>
                  <p>Monster Bane: {baneSurvivors.length ? baneSurvivors.map(survivor => survivor.name).join(', ') : 'No living survivor'}</p>
                </article>
              );
            })}
          </div>
          <label className="field-label" htmlFor="quarry-level">Quarry level</label>
          <select id="quarry-level" value={selectedLevel} onChange={event => onSelectLevel(Number(event.target.value))}>
            {Array.from({ length: getAvailableQuarryLevel(selectedQuarry, settlement) }, (_, index) => index + 1)
              .map(level => <option value={level} key={level}>Level {level}</option>)}
          </select>
          {huntButton}
          <details className="content-registry">
            <summary>Content Registry / Bestiary Archive</summary>
            <div className="registry-list">
              {creatureFamilyList.map(family => (
                <p key={family.id}>
                  <strong>{family.displayName}</strong> | {family.role} | {family.implemented ? 'Implemented' : 'Planned'} | {family.unlockHint}
                </p>
              ))}
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
