import {
  getActiveSlot,
  getSaveSlotKey,
  loadSettlement,
  saveSettlement
} from './saveLogic.js';
import {
  addRecoveryHistory,
  createEmptyRuntime
} from './gameStateRecovery.js';

const BOOT_SCREEN_KEY = 'lanternDeckbuilder.recoveryBootScreen';

function remountTo(screen) {
  sessionStorage.setItem(BOOT_SCREEN_KEY, screen);
  return screen;
}

export function consumeRecoveryBootScreen() {
  const screen = sessionStorage.getItem(BOOT_SCREEN_KEY);
  sessionStorage.removeItem(BOOT_SCREEN_KEY);
  return screen;
}

export function recoverActiveSave(reason, resetHunt = false) {
  const slotId = getActiveSlot();
  const settlement = loadSettlement(slotId);
  if (!settlement) return remountTo('title');
  saveSettlement({
    ...addRecoveryHistory(settlement, reason, resetHunt),
    appRuntime: createEmptyRuntime('settlement'),
    recoveryReason: reason
  }, slotId);
  return remountTo('settlement');
}

export function returnToTitleAfterError() {
  return remountTo('title');
}

export function exportBrokenSaveToConsole(error) {
  const slotId = getActiveSlot();
  const rawSave = localStorage.getItem(getSaveSlotKey(slotId));
  let parsedSave = null;
  try {
    parsedSave = rawSave ? JSON.parse(rawSave) : null;
  } catch {
    parsedSave = rawSave;
  }
  console.log('[Broken save export]', {
    slotId,
    error: error instanceof Error ? error.message : String(error || ''),
    save: parsedSave,
    rawSave
  });
}
