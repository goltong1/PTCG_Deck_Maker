import {normalizeName, ruleName} from './core.js';
import {cardLegality} from './rules.js';

const PREFERENCES_KEY = 'ptcg.catalog.v1';
export const DEFAULT_LIBRARY_WIDTH = 440;

export function readCatalogPreferences() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY)); } catch {}
  return {
    width: Number.isFinite(saved?.width) ? saved.width : DEFAULT_LIBRARY_WIDTH,
    formatOnly: typeof saved?.formatOnly === 'boolean' ? saved.formatOnly : true,
    expanded: saved?.expanded === true
  };
}

export function saveCatalogPreferences(preferences) {
  try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch {}
}

export function libraryWidthBounds(viewportWidth, railWidth = 0) {
  // Leave enough room for the deck at every desktop breakpoint.
  return {min: 280, max: Math.max(280, Math.min(840, viewportWidth - railWidth - 12 - 360))};
}

export function clampLibraryWidth(width, bounds) {
  return Math.round(Math.max(bounds.min, Math.min(bounds.max, Number.isFinite(width) ? width : DEFAULT_LIBRARY_WIDTH)));
}

export function attachLibraryResizer(layout, preferences, onSave) {
  const handle = layout.querySelector('#libraryResizer');
  const library = layout.querySelector('.library');
  const controller = new AbortController();
  const options = {signal: controller.signal};
  let drag = null;
  const bounds = () => libraryWidthBounds(layout.clientWidth, layout.querySelector('.rail').getBoundingClientRect().width);
  const apply = width => {
    const limits = bounds(), value = clampLibraryWidth(width, limits);
    layout.style.setProperty('--library-width', value + 'px');
    handle.setAttribute('aria-valuemin', limits.min);
    handle.setAttribute('aria-valuemax', limits.max);
    handle.setAttribute('aria-valuenow', value);
    handle.setAttribute('aria-valuetext', value + ' px');
    return value;
  };
  const finish = event => {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const {id} = drag;
    drag = null;
    document.body.classList.remove('resizing-library');
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
    onSave();
  };
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    handle.focus({preventScroll: true});
    drag = {id: event.pointerId, x: event.clientX, width: library.getBoundingClientRect().width};
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing-library');
  }, options);
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) preferences.width = apply(drag.width + event.clientX - drag.x);
  }, options);
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(name, finish, options);
  handle.addEventListener('dblclick', () => { preferences.width = DEFAULT_LIBRARY_WIDTH; apply(preferences.width); onSave(); }, options);
  handle.addEventListener('keydown', event => {
    const value = Number(handle.getAttribute('aria-valuenow')), limits = bounds();
    const width = {ArrowLeft: value - 20, ArrowRight: value + 20, Home: limits.min, End: limits.max}[event.key];
    if (width === undefined) return;
    event.preventDefault();
    preferences.width = apply(width);
    onSave();
  }, options);
  window.addEventListener('resize', () => apply(preferences.width), options);
  window.addEventListener('blur', () => finish(), options);
  apply(preferences.width);
  return () => { finish(); controller.abort(); };
}

export function selectCatalogCards(cards, options = {}, legalityIndex = {}) {
  const {query = '', category = 'all', subtype = '', typeFilter = '', setFilter = '',
    formatOnly = true, format = 'standard', uniqueOnly = false, order = 'featured'} = options;
  const tokens = query.split(/[\s,]+/).map(normalizeName).filter(Boolean);
  let result = cards.filter(card =>
    (category === 'all' || card.group === category) &&
    (!subtype || (subtype === 'ex' ? card.group === 'pokemon' && /ex$/i.test(card.name) :
      subtype === 'basic' ? card.basic : subtype === 'ace' ? card.ace : card.subtype === subtype)) &&
    (!typeFilter || card.types.includes(typeFilter)) && (!setFilter || card.set === setFilter) &&
    (!formatOnly || (legalityIndex[format]?.get(card.id) || cardLegality(card, format)).status === 'legal') &&
    tokens.every(token => card.search.includes(token))
  );
  if (order === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  if (order === 'hp') result.sort((a, b) => (b.hp || 0) - (a.hp || 0));
  if (order === 'newest') result.sort((a, b) => b.id.localeCompare(a.id));
  if (uniqueOnly) {
    const seen = new Set();
    result = result.filter(card => {
      const name = ruleName(card.name);
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }
  return result;
}
