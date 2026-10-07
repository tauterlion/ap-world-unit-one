import { esc, icon, money, button, sourceLink } from './common.js';
export function stimulusView(stimulus) {
  if (!stimulus) return '';
  let content='';
  if(stimulus.type==='table') content=`<div class="table-scroll"><table><thead><tr>${stimulus.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${stimulus.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  else if(['image','map'].includes(stimulus.type)) content=`<img src="${esc(stimulus.src)}" alt="${esc(stimulus.alt)}" loading="lazy">`;
  else content=`<p>${esc(stimulus.content)}</p>`;
  return `<figure class="stimulus"><figcaption class="eyebrow">${icon('book')} ${esc(stimulus.label || 'Evidence to consider')}</figcaption>${content}<small>${esc(stimulus.attribution || '')}</small></figure>`;
}
export function answerView(q) {
  return `<section class="answer-panel" aria-labelledby="answer-title"><span class="eyebrow">${icon('spark')} ${q.value>=300?'MODEL ANSWER':'THE ANSWER'}</span><h2 id="answer-title" tabindex="-1">${esc(q.answer)}</h2><p>${esc(q.explanation)}</p>${sourceLink(q)}</section>`;
}
export function questionView(topic,q,run,revealed,result,review=null) {
  const isReview=review!==null;
  return `<main id="main" class="question-page page-enter ${revealed?'is-revealed':''}"><div class="question-nav">${button(icon('back')+(isReview?' Back to recap':' Back to board'),isReview?'results':'board','text-button')}<span>${isReview?`MISSED QUESTION ${review.index+1} OF ${review.total}`:`TOPIC ${topic.topic} · ${run.grades.length} OF 25 EXPLORED`}</span></div>
    <div class="question-content"><div class="question-meta"><span class="category-pill">${esc(q.category)}</span><span class="question-value">${money(q.value)}</span></div><span class="question-skill">${esc(q.skill)}</span>
    <div class="question-layout ${q.stimulus?'has-stimulus':''}">${stimulusView(q.stimulus)}<div class="prompt-wrap"><h1 id="page-title" tabindex="-1">${esc(q.prompt)}</h1>${!revealed?'<p class="thinking-note">Take a breath. Think it through, or say it out loud.</p>':''}</div></div>
    ${revealed?answerView(q):`<div class="reveal-controls">${button('Reveal answer '+icon('arrow'),'reveal','button primary')}<small>No rush. There’s no timer here.</small></div>`}
    ${revealed?`<div class="grade-area">${isReview?`<div class="review-controls">${button(icon('back')+' Previous','review-prev','button secondary',review.index?'':'disabled')}<span>${review.index+1} / ${review.total}</span>${button(review.index===review.total-1?'Finish review '+icon('check'):'Next question '+icon('arrow'),'review-next','button primary')}</div>`:result!==undefined?`<div class="grade-feedback" role="status"><span class="feedback-icon">${icon(result?'check':'book')}</span><div><strong>${result?`Recalled. +${money(q.value)}`:'Saved for another look.'}</strong><p>${result?'A connection worth keeping.':'No points lost. You’ll find this in your review.'}</p></div>${button(run.grades.length===25?'See study recap '+icon('arrow'):'Return to board '+icon('arrow'),'continue','button primary')}</div>${button(icon('undo')+' Undo this result','undo','text-button correction')}`:`<p class="self-grade-note">Did you get the key idea? Your wording doesn’t need to match.</p><div class="grade-buttons">${button(icon('book')+' Incorrect','incorrect','button secondary')}${button(icon('check')+' Correct','correct','button success')}</div><small>Self-grade honestly. Every answer is a chance to learn.</small>`}</div>`:''}
    </div></main>`;
}
