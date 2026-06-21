import { useState } from 'react';
import { resolveEvent } from '../../domain/events/eventEngine.js';
import RollDie from '../components/RollDie.jsx';

export default function EventScreen({ event, runState, settlement, onApply, onContinue }) {
  const [rolling, setRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(null);
  const [result, setResult] = useState(null);
  const title = event?.title || event?.name || 'Safe Event';
  const description = event?.text || event?.description || 'The path waits for a manual roll.';

  function handleRoll() {
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      setDisplayRoll(Math.ceil(Math.random() * 10));
      if (ticks >= 6) {
        clearInterval(interval);
        const finalRoll = Math.ceil(Math.random() * 10);
        setDisplayRoll(finalRoll);
        setResult(resolveEvent({ event, roll: finalRoll, runState, settlement }));
        setRolling(false);
      }
    }, 70);
  }

  return (
    <main className="app-shell">
      <section className="panel event-panel">
        <p className="eyebrow">Manual event</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>

        <RollDie rolling={rolling} value={displayRoll} onRoll={handleRoll} />

        {result ? (
          <section className="audit-section">
            <p className="eyebrow">Outcome: {result.outcomeBand || 'Safe Outcome'}</p>
            <h2>{result.title || 'Safe Outcome'}</h2>
            <p>{result.text || 'The event resolves safely.'}</p>
            <h3>Mechanical Effects</h3>
            <ul className="effect-list">
              {result.mechanicalEffects.map((effect, index) => (
                <li key={`${effect.type}-${index}`}>{effect.label || 'Safe fallback effect'}</li>
              ))}
            </ul>
            <div className="action-row">
              <button type="button" onClick={() => onApply(result)}>Apply Result</button>
              <button className="secondary" type="button" onClick={onContinue}>Continue</button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
