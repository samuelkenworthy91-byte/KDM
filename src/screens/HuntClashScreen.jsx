import React, { useMemo, useState } from 'react';

function normalizeParty(party) {
  return Array.isArray(party)
    ? party.filter(survivor => survivor?.id).map(survivor => ({
      ...survivor,
      hp: Number.isFinite(Number(survivor.hp)) ? Number(survivor.hp) : 0,
      maxHp: Number.isFinite(Number(survivor.maxHp)) ? Number(survivor.maxHp) : 1,
      survival: Number.isFinite(Number(survivor.survival)) ? Number(survivor.survival) : 0,
      maxSurvival: Number.isFinite(Number(survivor.maxSurvival)) ? Number(survivor.maxSurvival) : 3
    }))
    : [];
}

function livingParty(party) {
  return normalizeParty(party).filter(survivor => survivor.hp > 0 && survivor.alive !== false);
}

function safeMonsterHp(monster, quarryLevel) {
  const baseHp = Number(monster?.hp || monster?.maxHp || monster?.health);
  if (Number.isFinite(baseHp) && baseHp > 0) return baseHp;
  return Math.max(4, 5 + Number(quarryLevel || 1) * 2);
}

function callSafely(callback, payload, fallback) {
  try {
    if (typeof callback === 'function') callback(payload);
  } catch {
    if (typeof fallback === 'function') fallback();
  }
}

export default function HuntClashScreen({
  monster,
  party,
  quarryId,
  quarryLevel = 1,
  runModifiers = {},
  onVictory,
  onDefeat,
  onRecover
}) {
  const initialParty = useMemo(() => livingParty(party), [party]);
  const [partyState, setPartyState] = useState(initialParty);
  const [monsterHp, setMonsterHp] = useState(safeMonsterHp(monster, quarryLevel));
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([]);
  const [selectedSurvivorId, setSelectedSurvivorId] = useState(initialParty[0]?.id || '');
  const [rolling, setRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(null);
  const [firstAttackSpent, setFirstAttackSpent] = useState(false);

  const living = livingParty(partyState);
  const selectedSurvivor = living.find(survivor => survivor.id === selectedSurvivorId) || living[0] || null;
  const monsterName = monster?.name || quarryId || 'Unknown quarry';
  const monsterKey = monster?.baseId || monster?.id || quarryId || 'unknownMonster';

  const recoverFromMissingData = () => {
    callSafely(onRecover, null, () => callSafely(onDefeat, {
      survivors: partyState,
      killedBy: monsterName,
      killedById: monsterKey
    }));
  };

  if (!monster || !living.length) {
    return (
      <section className="combat-screen hunt-clash-screen">
        <p className="eyebrow">Hunt Clash</p>
        <h2>Fight data missing</h2>
        <p className="missing">A living party and monster are required to open this fight.</p>
        <button type="button" onClick={recoverFromMissingData}>Recover</button>
      </section>
    );
  }

  const finishVictory = (finalParty, finalLog) => {
    callSafely(onVictory, {
      survivors: finalParty,
      monster,
      brokenWeakPoints: [],
      wounds: [],
      salvageTokens: 0,
      salvageResources: [],
      afterCombatLog: finalLog,
      isSimplifiedClash: true
    }, recoverFromMissingData);
  };

  const finishDefeat = (finalParty, finalLog) => {
    callSafely(onDefeat, {
      survivors: finalParty,
      killedBy: monsterName,
      killedById: monsterKey,
      afterCombatLog: finalLog
    }, recoverFromMissingData);
  };

  const applyMonsterCounterattack = (incomingParty, incomingLog) => {
    const targets = livingParty(incomingParty);
    if (!targets.length) {
      finishDefeat(incomingParty, incomingLog);
      return incomingParty;
    }
    const target = targets[Math.floor(Math.random() * targets.length)];
    const damage = 1 + Math.floor(Number(quarryLevel || 1) / 2) + Number(runModifiers?.monsterEnrage || 0);
    const nextParty = incomingParty.map(survivor => {
      if (survivor.id !== target.id) return survivor;
      const hp = Math.max(0, survivor.hp - damage);
      return {
        ...survivor,
        hp,
        alive: hp > 0
      };
    });
    const nextLog = [
      ...incomingLog,
      `${monsterName} counterattacks ${target.name || target.id} for ${damage} damage.`
    ];
    setPartyState(nextParty);
    setLog(nextLog);
    if (!livingParty(nextParty).length) finishDefeat(nextParty, nextLog);
    return nextParty;
  };

  const resolveAttackRoll = roll => {
    const actor = selectedSurvivor;
    if (!actor) return;

    let damage = 0;
    let nextActor = actor;
    const attackLog = [];
    if (roll <= 2) {
      attackLog.push(`${actor.name || actor.id} misses.`);
    } else if (roll <= 6) {
      damage = 1;
    } else if (roll <= 9) {
      damage = 2;
    } else {
      damage = 3;
      nextActor = {
        ...actor,
        survival: Math.min(actor.maxSurvival || 3, (actor.survival || 0) + 1)
      };
      attackLog.push(`${actor.name || actor.id} lands a perfect strike and gains 1 survival.`);
    }

    const bonus = !firstAttackSpent ? Number(runModifiers?.firstAttackBonus || 0) : 0;
    const totalDamage = damage + bonus;
    const nextParty = partyState.map(survivor =>
      survivor.id === actor.id ? nextActor : survivor
    );
    const nextHp = Math.max(0, monsterHp - totalDamage);
    const nextLog = [
      ...log,
      ...attackLog,
      totalDamage > 0
        ? `${actor.name || actor.id} deals ${totalDamage} damage.`
        : `${monsterName} avoids the blow.`
    ];

    setFirstAttackSpent(true);
    setPartyState(nextParty);
    setMonsterHp(nextHp);
    setLog(nextLog);

    if (nextHp <= 0) {
      finishVictory(nextParty, [...nextLog, `${monsterName} is defeated.`]);
      return;
    }

    if (roll <= 2) {
      applyMonsterCounterattack(nextParty, nextLog);
    }
    setRound(current => current + 1);
  };

  const attack = () => {
    if (rolling || !selectedSurvivor) return;
    setRolling(true);
    let ticks = 0;
    const finalRoll = Math.floor(Math.random() * 10) + 1;
    const timer = setInterval(() => {
      ticks += 1;
      setDisplayRoll(Math.floor(Math.random() * 10) + 1);
      if (ticks >= 10) {
        clearInterval(timer);
        setDisplayRoll(finalRoll);
        setRolling(false);
        resolveAttackRoll(finalRoll);
      }
    }, 70);
  };

  const defendRecover = () => {
    const actor = selectedSurvivor;
    if (!actor || rolling) return;
    const healed = actor.hp < actor.maxHp ? 1 : 0;
    const nextParty = partyState.map(survivor =>
      survivor.id === actor.id
        ? { ...survivor, hp: Math.min(survivor.maxHp, survivor.hp + healed) }
        : survivor
    );
    const nextLog = [
      ...log,
      healed
        ? `${actor.name || actor.id} recovers 1 HP.`
        : `${actor.name || actor.id} braces for the counterattack.`
    ];
    setRound(current => current + 1);
    applyMonsterCounterattack(nextParty, nextLog);
  };

  const retreat = () => {
    const nextLog = [...log, 'The party retreats from the clash.'];
    finishDefeat(partyState, nextLog);
  };

  return (
    <section className="combat-screen hunt-clash-screen">
      <p className="eyebrow">Hunt Clash</p>
      <h2>{monsterName}</h2>
      <p>Level {quarryLevel || 1} - HP {monsterHp}/{safeMonsterHp(monster, quarryLevel)}</p>
      <p>Round {round}</p>

      <section className="event-roll-graphic" aria-label="Attack roll">
        <div className={`roll-die ${rolling ? 'rolling' : ''}`}>{displayRoll || '?'}</div>
        <div>
          <p>Attack roll: d10</p>
          {runModifiers?.firstAttackBonus && !firstAttackSpent ? (
            <p>First attack bonus: +{runModifiers.firstAttackBonus} damage</p>
          ) : null}
        </div>
      </section>

      <section className="party-list">
        <h3>Party</h3>
        {living.map(survivor => (
          <button
            type="button"
            key={survivor.id}
            className={selectedSurvivor?.id === survivor.id ? 'selected' : ''}
            onClick={() => setSelectedSurvivorId(survivor.id)}
          >
            {survivor.name || survivor.id} - HP {survivor.hp}/{survivor.maxHp}, Survival {survivor.survival || 0}
          </button>
        ))}
      </section>

      <div className="combat-actions">
        <button type="button" onClick={attack} disabled={rolling || !selectedSurvivor}>Attack</button>
        <button type="button" onClick={defendRecover} disabled={rolling || !selectedSurvivor}>Defend / Recover</button>
        <button type="button" onClick={retreat} disabled={rolling}>Retreat</button>
      </div>

      <section className="event-outcome">
        <h3>Clash Log</h3>
        {log.length ? (
          <ul>
            {log.map((entry, index) => <li key={`hunt-clash-log-${index}`}>{entry}</li>)}
          </ul>
        ) : (
          <p>No actions yet.</p>
        )}
      </section>
    </section>
  );
}
