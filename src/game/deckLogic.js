export function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function drawCards(deck, hand, discard, num) {
  let nextDeck = [...deck];
  let nextHand = [...hand];
  let nextDiscard = [...discard];

  for (let count = 0; count < num; count += 1) {
    if (nextDeck.length === 0) {
      if (nextDiscard.length === 0) {
        break;
      }

      nextDeck = shuffleCards(nextDiscard);
      nextDiscard = [];
    }

    const [drawnCard, ...remainingDeck] = nextDeck;
    nextDeck = remainingDeck;
    nextHand = [...nextHand, drawnCard];
  }

  return { deck: nextDeck, hand: nextHand, discard: nextDiscard };
}

export function discardCard(hand, discard, cardIndex) {
  const card = hand[cardIndex];

  if (!card) {
    return { hand, discard };
  }

  return {
    hand: hand.filter((_, index) => index !== cardIndex),
    discard: [...discard, card]
  };
}
