import { esc, icon, topicArt, money } from './common.js';
export function topicSelect(topics, save) {
  const completed = topics.filter(t => (save.history[t.topic] || []).length).length;
  return `<main id="main" class="home page-enter">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> AP WORLD HISTORY · UNIT 1</div>
      <h1 id="page-title" tabindex="-1">The past is yours<br>to <em>uncover.</em></h1>
      <p>Big ideas. A little game-show energy.<br>Choose a board, trust your recall, and make history stick.</p>
      <div class="hero-tags"><span>${icon('grid')} 6 study boards</span><span>${icon('book')} 150 questions</span><span>${icon('spark')} Your pace</span></div></div>
      <div class="hero-visual" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="star star-one">✦</span><span class="star star-two">✧</span><div class="mini-board"><div class="mini-heading">THE GLOBAL TAPESTRY</div><div class="mini-grid">${[100,100,100,200,200,200,300,300,300].map((v,i)=>`<span class="mini-tile mini-${i}">$${v}</span>`).join('')}</div><div class="mini-foot">c. 1200 — c. 1450</div></div><div class="visual-caption"><span></span> A WORLD OF CONNECTIONS</div></div>
    </section>
    <section aria-labelledby="boards-title"><div class="section-heading"><div><span class="eyebrow muted">CHOOSE YOUR CHAPTER</span><h2 id="boards-title">The Global Tapestry <span>c. 1200–1450</span></h2></div><span class="availability">${completed ? `${completed} of 6 boards completed` : 'All six boards are open'} ${icon('check')}</span></div>
    <div class="topic-grid">${topics.map((t,index)=>{
      const history=save.history[t.topic] || []; const run=save.runs[t.topic]; const count=run?.grades.length || 0;
      const full=count===25; const best=history.length ? Math.max(...history.map(h=>h.accuracy)) : null;
      return `<button class="topic-card topic-${index}" data-action="topic" data-topic="${t.topic}" style="--order:${index}" aria-label="${full?'See results for':count?'Resume':'Start'} topic ${t.topic}, ${esc(t.title)}">
      <div class="card-top"><span class="topic-number">${t.topic}</span><span class="card-state">${full?`${icon('check')} Completed`:count?`${count}/25 explored`:'25 QUESTIONS'}</span></div>
      <div class="card-art">${topicArt(index)}</div><span class="topic-prefix">Developments in</span><h3>${esc(t.title.replace('Developments in ',''))}</h3><p>${esc(t.subtitle)}</p>
      <div class="card-bottom"><span>${best!==null?`Best accuracy <strong>${best}%</strong>`:count?`Continue your session`:'5 categories · $100–$500'}</span><span class="card-arrow">${icon('arrow')}</span></div>
      ${count && !full?`<span class="card-progress" style="width:${count/25*100}%"></span>`:''}
      ${history.length?`<span class="sr-only">Last score ${money(history.at(-1).score)}</span>`:''}</button>`;
    }).join('')}</div></section>
    <aside class="how-it-works"><span class="how-icon">${icon('spark')}</span><div><strong>A little recall goes a long way.</strong><p>Pick a value → think it through → reveal → self-grade. Missed one? It becomes your review list.</p></div><span class="no-rush">No timer. No pressure.</span></aside>
    <footer><span>Built for studying. Inspired by the game board.</span><span>Content grounded in AMSCO · Topics 1.1–1.6</span></footer>
  </main>`;
}
