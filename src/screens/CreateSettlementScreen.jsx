import React, { useState } from 'react';

export default function CreateSettlementScreen({ onCreate }) {
  const [name, setName] = useState('');

  const submit = event => {
    event.preventDefault();
    onCreate(name);
  };

  return (
    <section className="summary-screen">
      <p className="eyebrow">Begin A Campaign</p>
      <h2>Found A Settlement</h2>
      <p>Name the people who will gather beneath the first lantern.</p>
      <form className="creation-form" onSubmit={submit}>
        <label htmlFor="settlement-name">Settlement name</label>
        <input
          id="settlement-name"
          value={name}
          maxLength={50}
          placeholder="The First Lantern"
          onChange={event => setName(event.target.value)}
        />
        <button type="submit">Found Settlement</button>
      </form>
    </section>
  );
}
