export const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = value => '$' + value.toLocaleString('en-US');
export const icon = (name, className = '') => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>', minus: '<path d="M6 12h12"/>',
    sound: '<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 5-6 4H2v6h3l6 4V5Zm5 4 6 6m0-6-6 6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    undo: '<path d="M3 10h11a6 6 0 0 1 0 12M3 10l5-5m-5 5 5 5"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    book: '<path d="M12 5v15m0-15C8 2 4 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-2-1-6-2-10 1Z"/>',
    reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>'
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
};
export function button(label, action, className = 'button', attrs = '') {
  return `<button class="${className}" data-action="${action}" ${attrs}>${label}</button>`;
}
export function sourceLink(q) {
  const pages = q.source.printedPages;
  return `<span class="source-link">${icon('book')} AMSCO · ${pages.length === 1 ? 'p.' : 'pp.'} ${pages.join(', ')}</span>`;
}
// Decorative line drawings, not historical maps or textbook evidence.
export function topicArt(index) {
  const drawings = [
    '<path d="M28 90h144M43 74h114M56 56h88M69 39h62M49 74v16m30-16v16m42-16v16m30-16v16M64 56v18m36-18v18m36-18v18M78 39v17m44-17v17M36 73q39-6 64-20 25 14 64 20M51 55q30-5 49-20 19 15 49 20M64 38q23-5 36-20 13 15 36 20M100 10v10"/>',
    '<path d="M26 90h150M43 90V52h114v38M63 52c0-26 24-23 37-42 13 19 37 16 37 42M80 90V70a20 20 0 0 1 40 0v20M28 90V28h10v62m124 0V28h10v62M25 28l8-13 8 13m118 0 8-13 8 13M52 61v15m96-15v15"/>',
    '<path d="M24 91h152M40 90V64h120v26M57 64V46h86v18M70 46V31h60v15M84 31l16-23 16 23M93 90V72h14v18M47 64l6-12 6 12m82 0 6-12 6 12M34 90V76m132 14V76M77 43h46M65 59h70M49 84h23m56 0h23"/>',
    '<path d="M23 91h154M34 91V78h132v13M48 78V64h104v14M61 64V50h78v14M75 50V36h50v14M84 36V20h32v16M78 20h44M94 25h12v11M93 50 82 91m25-41 11 41M90 62h20M87 74h26M84 86h32"/>',
    '<path d="M27 90c-5-14-5-40 4-57h14c-2 17-2 40 1 57M45 62c33-7 57-4 79 3l-2 25H45M126 90l5-36h28l8 36M128 54l17-32 16 32M29 45h15m-17 12h17m-19 12h20m-18 12h18M54 70h60m-63 10h70m-54-17v26m20-28v29m18-27v26M137 67h17m-19 10h22M25 91h150"/>',
    '<path d="M29 91h143M42 91V46h22v45m73 0V46h22v45M36 46l17-26 17 26m60 0 18-26 17 26M65 91V63h72v28M84 91V76a16 16 0 0 1 32 0v15M75 63V47h11v8h9v-8h11v8h9v-8h11v16M50 57v9m0 9v8m98-26v9m0 9v8M53 20V9h15l-15 8"/>'
  ];
  return `<svg class="topic-art" viewBox="0 0 200 110" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true">${drawings[index]}</svg>`;
}
