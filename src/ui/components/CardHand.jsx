export default function CardHand({ hand, onPlayCard }) {
  return (
    <section className="combat-section">
      <h2>Hand</h2>
      <div className="hand-grid">
        {(hand || []).map(card => (
          <article className="hand-card" key={card.id}>
            <h3>{card.name}</h3>
            <p>{card.description || card.type}</p>
            <button type="button" onClick={() => onPlayCard(card.id)} disabled={card.unplayable}>Play</button>
          </article>
        ))}
      </div>
    </section>
  );
}
