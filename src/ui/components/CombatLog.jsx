export default function CombatLog({ entries }) {
  return (
    <section className="combat-section">
      <h2>Combat Log</h2>
      <ol className="combat-log">
        {(entries || []).slice(-8).map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
      </ol>
    </section>
  );
}
