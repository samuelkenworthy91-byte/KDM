import { useState } from 'react';

function safeValue(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

export default function CardPreview({ card, side = 'front' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const tags = card?.tags || [];
  const imagePath = card?.image ? `/${card.image.replace(/^\.\//, '')}` : '';
  const name = safeValue(card?.name, 'Unnamed Card');
  const type = safeValue(card?.type, 'card');
  const text = safeValue(card?.rulesSummary || card?.description || card?.text, 'No rules text available.');
  const sourceGear = safeValue(card?.sourceGearName || card?.gearName || card?.sourceGearId, 'Unlinked Cards');
  const classification = card?.passive || type === 'passive' ? 'Passive' : 'Active';
  const stats = [
    card?.cost !== undefined ? `Cost ${card.cost}` : '',
    card?.speed !== undefined ? `Speed ${card.speed}` : '',
    card?.damage !== undefined ? `Damage ${card.damage}` : '',
    card?.block !== undefined ? `Block ${card.block}` : ''
  ].filter(Boolean);

  return (
    <article className="catalog-card">
      {side === 'back' ? (
        <>
          {imagePath && !imageFailed ? (
            <img src={imagePath} alt="" loading="lazy" onError={() => setImageFailed(true)} />
          ) : (
            <div className="image-fallback">Missing image</div>
          )}
          <div>
            <p className="eyebrow">{classification}</p>
            <h3>{sourceGear}</h3>
            <p>Card ID: {safeValue(card?.id, 'unknown-card')}</p>
            <p>{text}</p>
          </div>
        </>
      ) : (
        <div>
          <p className="eyebrow">{type}</p>
          <h3>{name}</h3>
          {stats.length ? <p>{stats.join(' / ')}</p> : null}
          {card?.slot ? <p>Slot: {card.slot}</p> : null}
          <p>{text}</p>
          <p>Source: {sourceGear}</p>
          <div className="tag-row">
            {tags.slice(0, 6).map(tag => <span key={tag}>{safeValue(tag, 'tag')}</span>)}
          </div>
        </div>
      )}
    </article>
  );
}
