import FlippableCard from './FlippableCard.jsx';

export default function CardHand({ hand, onPlayCard }) {
  return (
    <section className="combat-section">
      <h2>Hand</h2>
      <div className="hand-grid">
        {(hand || []).map(card => (
          <FlippableCard
            key={card.id}
            card={card}
            actions={(
              <button type="button" onClick={() => onPlayCard(card.id)} disabled={card.unplayable}>Play</button>
            )}
          />
        ))}
      </div>
    </section>
  );
}
