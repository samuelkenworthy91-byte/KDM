import React, { useState } from 'react';
import { creatureFamilies } from '../data/creatureFamilies.js';
import { creatureBehaviourList, getCreatureBehaviour } from '../data/creatureBehaviours.js';
import { equipmentList } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { graveLegacies } from '../data/graveLegacies.js';
import { innovationList, innovations } from '../data/innovations.js';
import { quarryList } from '../data/quarries.js';
import { resources } from '../data/resources.js';
import { settlementUpgrades } from '../data/settlementUpgrades.js';
import { canCraft } from '../game/craftingLogic.js';
import { hasUpgrade } from '../game/saveLogic.js';
import { canBuildInnovation, hasInnovation } from '../game/settlementLogic.js';

const TABS = ['Overview', 'Survivors', 'Armory', 'Innovations', 'Population', 'Graveyard', 'Quarries'];

function ResourceList({ stash }) {
  return (
    <div className="resource-grid">
      {Object.entries(stash).map(([id, amount]) => (
        <div key={id}><strong>{amount}</strong><span>{resources[id]?.name || id}</span></div>
      ))}
    </div>
  );
}

function SurvivorForm({ populationAvailable, onCreate }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');

  const submit = event => {
    event.preventDefault();
    if (!populationAvailable) return;
    onCreate(name, gender);
    setName('');
  };

  return (
    <form className="survivor-name-form" onSubmit={submit}>
      <label htmlFor="survivor-name">Name a survivor from the population</label>
      <input id="survivor-name" value={name} maxLength={40} placeholder="Nameless Survivor"
        onChange={event => setName(event.target.value)} />
      <select value={gender} onChange={event => setGender(event.target.value)}>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <button type="submit" disabled={!populationAvailable}>
        {populationAvailable ? 'Create Survivor' : 'Whole Population Is Named'}
      </button>
    </form>
  );
}

function RecipeCards({ settlement, onCraft }) {
  const groups = [
    ['Bone Smith', 'boneSmith'],
    ['Skinnery', 'skinnery'],
    ['Organ Grinder', 'organGrinder'],
    ['Monster Archive', 'monsterArchive'],
    ['Other / Locked', null]
  ];

  return groups.map(([label, innovationId]) => {
    const items = equipmentList.filter(item => {
      const requirements = Array.isArray(item.requiresInnovation)
        ? item.requiresInnovation
        : [item.requiresInnovation];
      return innovationId ? requirements.includes(innovationId) : !requirements.some(id =>
        ['boneSmith', 'skinnery', 'organGrinder', 'monsterArchive'].includes(id)
      );
    });
    if (!items.length) return null;
    return (
      <section key={label} className="recipe-group">
        <h4>{label} Recipes</h4>
        <div className="recipe-grid">
          {items.map(item => {
            const affordable = canCraft(item, settlement.settlementStash, settlement.armory, settlement.builtInnovations);
            const requirements = Array.isArray(item.requiresInnovation) ? item.requiresInnovation : [item.requiresInnovation];
            const unlocked = requirements.some(id => hasInnovation(settlement, id));
            const requirementNames = requirements.filter(Boolean).map(id => innovations[id]?.name || id).join(' or ');
            return (
              <article key={item.id} className="recipe-card">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                {!unlocked && <p className="warning-message">Requires {requirementNames}</p>}
                <p className="recipe-cost">{Object.entries(item.cost)
                  .map(([id, amount]) => `${resources[id]?.name || id} x${amount}`).join(', ')}</p>
                <button type="button" disabled={!affordable} onClick={() => onCraft(item)}>
                  {settlement.armory.some(gear => gear.id === item.id) ? 'In Armory' : affordable ? 'Craft' : 'Unavailable'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    );
  });
}

export default function SettlementScreen({
  settlement, onCraft, onBuildInnovation, onBuyUpgrade, onCreateSurvivor,
  onPrepareLivingSurvivor, onAttemptIntimacy
}) {
  const [tab, setTab] = useState('Overview');
  const namedPopulation = settlement.livingSurvivors.length;
  const populationAvailable = namedPopulation < settlement.population;
  const males = settlement.livingSurvivors.filter(survivor => survivor.gender === 'male').length;
  const females = settlement.livingSurvivors.filter(survivor => survivor.gender === 'female').length;

  return (
    <section className="settlement-screen">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Settlement Campaign</p>
          <h2>{settlement.settlementName}</h2>
          <p>The lanterns shelter {settlement.population} people.</p>
        </div>
      </header>
      <div className="settlement-stats">
        <div><strong>{settlement.population}</strong><span>Population</span></div>
        <div><strong>{namedPopulation}</strong><span>Living Roster</span></div>
        <div><strong>{settlement.deadSurvivors}</strong><span>Dead</span></div>
        <div><strong>{settlement.settlementMemory}</strong><span>Memory</span></div>
        <div><strong>{settlement.totalRuns}</strong><span>Total Runs</span></div>
      </div>
      <nav className="settlement-tabs" aria-label="Settlement sections">
        {TABS.map(item => <button key={item} type="button" className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}
      </nav>

      {tab === 'Overview' && <>
        <section className="base-panel">
          <h3>Campaign Overview</h3>
          <p>Victorious hunts: {settlement.victoriousRuns}. Population roll at founding: {settlement.populationRoll || 'legacy save'}.</p>
          <p>{namedPopulation ? 'Choose a survivor and prepare a hunt.' : 'Name a survivor from the population to begin hunting.'}</p>
          <p>{settlement.pendingSpecialTrait ? `A special child trait awaits: ${settlement.pendingSpecialTrait}.` : 'No special birth is pending.'}</p>
        </section>
        <section className="base-panel"><h3>Stash Summary</h3><ResourceList stash={settlement.settlementStash} /></section>
        <section className="base-panel"><h3>Settlement Upgrades</h3><div className="compact-grid">
          {settlementUpgrades.map(upgrade => <article key={upgrade.id} className="compact-card">
            <strong>{upgrade.name}</strong><p>{upgrade.effect}</p>
            <button type="button" disabled={hasUpgrade(settlement, upgrade.id) || settlement.settlementMemory < upgrade.cost} onClick={() => onBuyUpgrade(upgrade)}>
              {hasUpgrade(settlement, upgrade.id) ? 'Unlocked' : `${upgrade.cost} Memory`}
            </button>
          </article>)}
        </div></section>
      </>}

      {tab === 'Survivors' && <>
        <section className="base-panel">
          <h3>Create Survivor</h3>
          <p>Named survivors are drawn from the population and do not change its total.</p>
          <SurvivorForm populationAvailable={populationAvailable} onCreate={onCreateSurvivor} />
        </section>
        <section className="base-panel"><h3>Living Survivors</h3><div className="survivor-grid">
          {settlement.livingSurvivors.length ? settlement.livingSurvivors.map(survivor => <article key={survivor.id} className="survivor-card">
            <h4>{survivor.name}</h4>
            <p>{survivor.gender} {survivor.ageCategory} | Max HP {survivor.maxHp} | Survival {survivor.survival}</p>
            <p>Runs {survivor.completedRuns} | Kills {survivor.kills}</p>
            <p>Traits: {survivor.traits.length ? survivor.traits.join(', ') : 'None'}</p>
            <p>Fighting arts: {survivor.fightingArts.length ? survivor.fightingArts.map(id => fightingArts[id]?.name || id).join(', ') : 'None'}</p>
            <button type="button" onClick={() => onPrepareLivingSurvivor(survivor.id)}>Prepare Loadout</button>
          </article>) : <p>No living named survivors. Create one above.</p>}
        </div></section>
      </>}

      {tab === 'Armory' && <>
        <section className="base-panel"><h3>Settlement Stash</h3><ResourceList stash={settlement.settlementStash} /></section>
        <section className="base-panel"><h3>Crafted Gear</h3><div className="compact-grid">
          {settlement.armory.length ? settlement.armory.map(item => <article key={item.instanceId} className="compact-card"><strong>{item.name}</strong><span>{item.slot}</span></article>) : <p>The racks are empty.</p>}
        </div></section>
        <section className="base-panel"><h3>Craft Gear</h3><RecipeCards settlement={settlement} onCraft={onCraft} /></section>
      </>}

      {tab === 'Innovations' && <section className="base-panel"><h3>Innovations and Buildings</h3><div className="recipe-grid">
        {innovationList.map(innovation => {
          const built = hasInnovation(settlement, innovation.id);
          const affordable = canBuildInnovation(innovation, settlement.settlementStash, settlement.builtInnovations);
          return <article key={innovation.id} className="recipe-card">
            <p className="eyebrow">{innovation.category}</p><h4>{innovation.name}</h4><p>{innovation.description}</p><p>{innovation.effects.join(' ')}</p>
            <p className="recipe-cost">{Object.entries(innovation.cost).map(([id, amount]) => `${resources[id]?.name || id} x${amount}`).join(', ')}</p>
            <button type="button" disabled={built || !affordable} onClick={() => onBuildInnovation(innovation.id)}>{built ? 'Built' : affordable ? 'Build' : 'Missing Resources'}</button>
          </article>;
        })}
      </div></section>}

      {tab === 'Population' && <>
        <section className="base-panel">
          <h3>Population</h3>
          <p>{settlement.population} people remain. {males} named male and {females} named female survivors are living.</p>
          <p>{settlement.pendingSpecialTrait ? `Pending special trait: ${settlement.pendingSpecialTrait}` : 'No special child trait is pending.'}</p>
          <button type="button" disabled={!males || !females} onClick={onAttemptIntimacy}>Attempt Intimacy</button>
          {(!males || !females) && <p className="warning-message">Requires at least one living male and one living female survivor.</p>}
        </section>
        <section className="base-panel"><h3>Intimacy History</h3>
          {settlement.intimacyHistory.length ? <ul className="history-list">{settlement.intimacyHistory.map(entry =>
            <li key={entry.id}><strong>Roll {entry.roll}: {entry.title}</strong> {entry.description}</li>
          )}</ul> : <p>No intimacy attempts recorded.</p>}
        </section>
      </>}

      {tab === 'Graveyard' && <section className="base-panel graveyard-section"><h3>Graveyard</h3>
        {settlement.graveHistory.length ? <ul>{settlement.graveHistory.map(grave => <li key={`${grave.timestamp}-${grave.survivorName}`}>
          <strong>{grave.survivorName}</strong> killed by {grave.killedBy} | {graveLegacies[grave.chosenLegacyId]?.name || grave.chosenLegacyId}
        </li>)}</ul> : <p>No graves yet.</p>}
      </section>}

      {tab === 'Quarries' && <>
        <section className="base-panel"><h3>Quarry Campaign</h3><div className="recipe-grid">
          {quarryList.map(quarry => <article key={quarry.id} className="recipe-card">
            <h4>{quarry.name}</h4><p>{quarry.behaviourTags.join(', ')}</p>
            <p>{quarry.implemented ? getCreatureBehaviour(quarry.id).description : quarry.description}</p>
            <p>Highest defeated level: {settlement.defeatedQuarryLevels[quarry.id] || 0}.</p>
            {[1, 2, 3].map(level => {
              const isQuarryUnlocked = settlement.unlockedQuarries.includes(quarry.id);
              const highest = settlement.defeatedQuarryLevels[quarry.id] || 0;
              const unlocked = quarry.implemented && isQuarryUnlocked && level <= highest + 1;
              return <p key={level}>
                Level {level}: {unlocked ? 'Unlocked' : level === 1 ? quarry.unlockText || 'Locked' : `Defeat Level ${level - 1}`}
              </p>;
            })}
          </article>)}
        </div></section>
        <section className="base-panel"><h3>Behaviour Packs</h3><div className="compact-grid">
          {creatureBehaviourList.map(creature => <article key={creature.id} className="compact-card">
            <strong>{creature.name}</strong><span>{creature.role}</span>
            <p>{creature.description}</p>
            <p>{creature.implemented ? 'Combat behaviour implemented.' : `Planned: ${creature.unlockHint}`}</p>
          </article>)}
        </div></section>
        <section className="base-panel"><h3>Creature Content Registry</h3><div className="compact-grid">
          {creatureFamilies.map(creature => <article key={creature.id} className="compact-card">
            <strong>{creature.displayName}</strong><span>{creature.role} | {creature.node}</span>
            <p>{creature.implemented ? 'Implemented' : 'Planned'} | {creature.unlockHint}</p>
          </article>)}
        </div></section>
      </>}
    </section>
  );
}
