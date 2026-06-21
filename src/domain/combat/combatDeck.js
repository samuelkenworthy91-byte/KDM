export function shuffleCards(cards = [], random = Math.random) {
  const deck = [...(Array.isArray(cards) ? cards : [])].filter(Boolean);
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor((typeof random === 'function' ? random() : 0.5) * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export function drawCards(state, count = 1) {
  const next = {
    ...state,
    drawPile: [...(state?.drawPile || [])],
    hand: [...(state?.hand || [])],
    discardPile: [...(state?.discardPile || [])]
  };

  for (let index = 0; index < count; index += 1) {
    if (!next.drawPile.length && next.discardPile.length) {
      next.drawPile = [...next.discardPile];
      next.discardPile = [];
    }
    const card = next.drawPile.shift();
    if (card) next.hand.push(card);
  }

  return next;
}
