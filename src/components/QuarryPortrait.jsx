import React, { useEffect, useState } from 'react';

export default function QuarryPortrait({
  quarry,
  className = '',
  locked = false,
  size = 'card'
}) {
  const [failed, setFailed] = useState(!quarry?.portraitPath);

  useEffect(() => {
    setFailed(!quarry?.portraitPath);
  }, [quarry?.portraitPath]);

  const name = quarry?.displayName || quarry?.name || 'Unknown / Legacy';
  const frameClass = [
    'quarry-portrait',
    `quarry-portrait-${size}`,
    locked ? 'quarry-portrait-locked' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={frameClass}>
      {!failed && (
        <img
          src={quarry.portraitPath}
          alt={quarry.portraitAlt || `${name} portrait`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="quarry-portrait-placeholder" role="img" aria-label={`${name} portrait unavailable`}>
          <span>Portrait unavailable</span>
          <strong>{name}</strong>
        </div>
      )}
    </div>
  );
}
