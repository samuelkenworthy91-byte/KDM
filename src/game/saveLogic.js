// Helpers for loading and saving settlement data in localStorage.

export function loadSettlement() {
  try {
    return JSON.parse(localStorage.getItem('settlement')) || {};
  } catch (e) {
    return {};
  }
}

export function saveSettlement(data) {
  localStorage.setItem('settlement', JSON.stringify(data));
}