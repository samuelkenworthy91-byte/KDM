export default function SurvivorCombatPanel({ survivor, passives = [] }) {
  return (
    <section className="combat-panel">
      <p className="eyebrow">Survivor</p>
      <h2>{survivor?.name || 'Nameless Survivor'}</h2>
      <p>HP {survivor?.hp ?? 0}/{survivor?.maxHp ?? 0}</p>
      <p>Survival {survivor?.survival ?? 0}/{survivor?.maxSurvival ?? 0}</p>
      <p>{survivor?.alive ? 'Alive' : 'Down'}</p>
      <p>Passives: {passives.length}</p>
    </section>
  );
}
