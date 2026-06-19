import React, { useMemo, useState } from 'react';
import {
  buildInnovationPaymentOptions,
  getInnovationPaymentWarnings,
  INNOVATION_PAYMENT_MEMORY_COST,
  INNOVATION_PAYMENT_SLOTS,
  validateInnovationPayment
} from '../game/innovationPayment.js';
import { resources } from '../data/resources.js';
import { getMemoryBalance } from '../game/memoryEconomy.js';
import { formatValueForDisplay } from '../utils/formatters.js';

function slotLabel(slot) {
  return `${slot[0].toUpperCase()}${slot.slice(1)} slot`;
}

export default function InnovationPaymentScreen({
  settlement,
  onConfirm,
  onCancel
}) {
  const [payment, setPayment] = useState({ hide: '', organ: '', bone: '' });
  const options = useMemo(
    () => buildInnovationPaymentOptions(settlement.stash, payment),
    [settlement.stash, payment]
  );
  const normalizedPayment = {
    hide: payment.hide || null,
    organ: payment.organ || null,
    bone: payment.bone || null
  };
  const validation = validateInnovationPayment(settlement, normalizedPayment);
  const selectedWarnings = INNOVATION_PAYMENT_SLOTS.flatMap(slot => (
    payment[slot]
      ? getInnovationPaymentWarnings(payment[slot]).map(warning => ({
        slot,
        resourceId: payment[slot],
        warning
      }))
      : []
  ));

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Innovation Payment</p>
      <h2>Choose Innovation Materials</h2>
      <p>
        Memory cost: {INNOVATION_PAYMENT_MEMORY_COST}. Current Memory: {getMemoryBalance(settlement)}.
      </p>
      <p className="muted-text">
        Choose one resource unit for each material slot. A multi-tag resource can fill only one
        selected slot unless the stash has additional copies.
      </p>

      <div className="item-grid">
        {INNOVATION_PAYMENT_SLOTS.map(slot => (
          <article className="item-card" key={slot}>
            <label className="field-label">
              {slotLabel(slot)}
              <select
                value={payment[slot]}
                onChange={event => setPayment(current => ({
                  ...current,
                  [slot]: event.target.value
                }))}
              >
                <option value="">Choose {slot}</option>
                {options[slot].map(option => (
                  <option key={option.resourceId} value={option.resourceId}>
                    {option.name} ({option.count})
                    {option.warnings.length ? ' - warning' : ''}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted-text">
              Available choices: {options[slot].length}
            </p>
            {payment[slot] && (
              <p>
                Selected: <strong>{resources[payment[slot]]?.name || payment[slot]}</strong>{' '}
                <span className="muted-text">
                  [{(resources[payment[slot]]?.materialTags || []).map(formatValueForDisplay).join(', ')}]
                </span>
              </p>
            )}
          </article>
        ))}
      </div>

      {!!selectedWarnings.length && (
        <section className="item-card warning-card">
          <h3>Payment Warnings</h3>
          {selectedWarnings.map(({ slot, resourceId, warning }) => (
            <p key={`${slot}-${resourceId}-${warning}`}>
              <strong>{slotLabel(slot)}:</strong> {resources[resourceId]?.name || resourceId} - {warning}
            </p>
          ))}
        </section>
      )}

      {!validation.valid && <p className="missing">{validation.reason}</p>}

      <div className="button-row">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!validation.valid}
          onClick={() => onConfirm({
            memory: INNOVATION_PAYMENT_MEMORY_COST,
            hide: payment.hide,
            organ: payment.organ,
            bone: payment.bone
          })}
        >
          Confirm Payment and Draw
        </button>
      </div>
    </section>
  );
}
