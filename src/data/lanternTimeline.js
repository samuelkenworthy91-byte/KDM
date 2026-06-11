import { timelineEvents } from './timelineEvents.js';

export const lanternTimeline = timelineEvents
  .map(event => ({
    ...event,
    name: event.title,
    type: event.eventType
  }))
  .sort((left, right) => left.lanternYear - right.lanternYear);

export const randomLanternYearEvents = [];

export function getTimelineEntry(year) {
  return lanternTimeline.find(item => item.lanternYear === year) || null;
}

export function getNextTimelineMilestone(year) {
  return lanternTimeline.find(item => item.lanternYear > year) || null;
}
