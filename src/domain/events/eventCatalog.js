import { getEvents } from '../content/contentIndex.js';

export function getEventCatalog() {
  return getEvents().map(event => ({
    ...event,
    title: event.title || event.name,
    text: event.description || event.longDescription || 'The path shifts under dim lantern light.',
    resultBands: Array.isArray(event.resultBands) ? event.resultBands : []
  }));
}

export function getFirstEvent() {
  return getEventCatalog()[0] || null;
}
