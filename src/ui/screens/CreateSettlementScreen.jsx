import { useState } from 'react';
import { createNewSettlement } from '../../domain/settlement/createSettlement.js';

export default function CreateSettlementScreen({ onCreate }) {
  const [name, setName] = useState('Lantern Refuge');

  function handleSubmit(event) {
    event.preventDefault();
    onCreate(createNewSettlement({ name }));
  }

  return (
    <main className="app-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Clean core</p>
        <h1>Create Settlement</h1>
        <p className="lede">Name the first refuge and generate a valid founder group for the rebuild.</p>
        <form className="settlement-form" onSubmit={handleSubmit}>
          <label htmlFor="settlement-name">Settlement name</label>
          <input
            id="settlement-name"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Lantern Refuge"
          />
          <button type="submit">Create Settlement</button>
        </form>
      </section>
    </main>
  );
}
