export default function MonsterPanel({ monster, intent, weakPoint }) {
  return (
    <section className="combat-panel">
      <p className="eyebrow">Monster</p>
      <h2>{monster?.name || 'Unknown Monster'}</h2>
      <p>HP {monster?.hp ?? 0}/{monster?.maxHp ?? 0}</p>
      <p>Intent: {intent?.label || intent?.id || 'Watching'}</p>
      <p>Weak Point: {weakPoint?.name || 'None revealed'}</p>
      {weakPoint?.text ? <p>{weakPoint.text}</p> : null}
    </section>
  );
}
