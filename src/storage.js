import { defaultInvitation } from './data.js';

const INVITATION_KEY = 'nikahfix.invitation.v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDefaults(saved) {
  const guests = normalizeGuests(saved.guests || defaultInvitation.guests);
  return {
    ...clone(defaultInvitation),
    ...saved,
    site: { ...defaultInvitation.site, ...saved.site },
    packageConfig: { ...defaultInvitation.packageConfig, ...saved.packageConfig },
    cover: { ...defaultInvitation.cover, ...saved.cover },
    music: { ...defaultInvitation.music, ...saved.music },
    hero: { ...defaultInvitation.hero, ...saved.hero },
    film: { ...defaultInvitation.film, ...saved.film },
    news: { ...defaultInvitation.news, ...saved.news },
    gifts: { ...defaultInvitation.gifts, ...saved.gifts },
    closing: { ...defaultInvitation.closing, ...saved.closing },
    couple: saved.couple || defaultInvitation.couple,
    events: saved.events || defaultInvitation.events,
    stories: saved.stories || defaultInvitation.stories,
    gallery: saved.gallery || defaultInvitation.gallery,
    guests,
    rsvps: saved.rsvps || [],
    checkIns: saved.checkIns || [],
  };
}

function normalizeGuests(guests) {
  return guests.map((guest, index) => ({
    ...guest,
    qrToken: guest.qrToken || `qr-${guest.slug || simpleSlug(guest.name) || index + 1}`,
  }));
}

function simpleSlug(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function loadInvitation() {
  try {
    const raw = localStorage.getItem(INVITATION_KEY);
    if (!raw) return clone(defaultInvitation);
    return mergeDefaults(JSON.parse(raw));
  } catch {
    return clone(defaultInvitation);
  }
}

export function saveInvitation(invitation) {
  localStorage.setItem(INVITATION_KEY, JSON.stringify(invitation));
}

export function resetInvitation() {
  const fresh = clone(defaultInvitation);
  saveInvitation(fresh);
  return fresh;
}

export function makeId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeToken(prefix = 'token') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
