import { useState } from 'react';

export default function CardPreview({ card }) {
  const [imageFailed, setImageFailed] = useState(false);
  const tags = card?.tags || [];
  const imagePath = card?.image ? `/${card.image.replace(/^\.\//, '')}` : '';

  return (
    <article className="catalog-card">
      {imagePath && !imageFailed ? (
        <img src={imagePath} alt="" loading="lazy" onError={() => setImageFailed(true)} />
      ) : (
        <div className="image-fallback">Missing image</div>
      )}
      <div>
        <p className="eyebrow">{card?.type || 'card'}</p>
        <h3>{card?.name || 'Unnamed Card'}</h3>
        {card?.slot ? <p>Slot: {card.slot}</p> : null}
        <p>{card?.rulesSummary || card?.description || 'No rules summary available.'}</p>
        <div className="tag-row">
          {tags.slice(0, 6).map(tag => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </article>
  );
}
