import { esc, icon, money, button } from './common.js';
import { VALUES, summarize } from '../game/engine.js';
export function gameIntro(topic) {
  return `<main id="main" class="intro page-enter"><span class="eyebrow">THE GLOBAL TAPESTRY · TOPIC ${topic.topic}</span><div class="intro-line"></div><p class="intro-kicker">Your next chapter</p><h1 id="page-title" tabindex="-1">${esc(topic.title)}</h1><p>Five categories. Twenty-five discoveries.<br>Take all the time you need.</p>${button('Skip intro '+icon('arrow'),'skip','button secondary')}</main>`;
}
export function gameBoard(topic,run,revealing=false) {
  const summary=summarize(topic,run); const results=new Map(run.grades.map(g=>[g.questionId,g.correct]));
  return `<main id="main" class="board-page page-enter"><div class="board-top"><div>${button(icon('back')+' All topics','home','text-button')}<div class="eyebrow board-eyebrow">UNIT 1 <span>/</span> TOPIC ${topic.topic}</div><h1 id="page-title" tabindex="-1">${esc(topic.title)}</h1></div><div class="score-box"><span class="eyebrow">YOUR SCORE</span><strong class="score-value">${money(summary.score)}</strong><small>Points for what you know.</small></div></div>
    <div class="board-toolbar"><span>${revealing?'<span class="live-dot"></span> Meet your categories':`<strong>${summary.answered}</strong> of 25 explored <span class="divider">/</span> ${summary.answered?summary.accuracy+'% accuracy':'Choose any value to begin'}`}</span><div>${summary.complete?button('Study recap '+icon('arrow'),'results','text-button')+' &nbsp; ':''}${revealing?button('Skip reveals '+icon('arrow'),'skip','text-button'):button(icon('undo')+' Undo last result','undo','text-button',run.grades.length?'':'disabled')}</div></div>
    <div class="board-scroll" role="region" aria-label="Question board, five categories" tabindex="0"><div class="game-board ${revealing?'revealing':''}">
    ${topic.categories.map((category,index)=>`<div class="category-header" data-category-index="${index}" style="--order:${index}"><span>0${index+1}</span><h2>${esc(category.name)}</h2><div class="category-light"></div></div>`).join('')}
    ${VALUES.map((value,row)=>topic.categories.map((category,col)=>{
      const q=category.questions[row], done=results.has(q.id), right=results.get(q.id);
      return `<button class="question-tile ${done?'completed '+(right?'was-correct':'was-missed'):''}" data-action="question" data-id="${q.id}" data-column="${col}" style="--order:${row+col}" ${done||revealing?'disabled':''} aria-label="${esc(category.name)}, ${money(value)}${done?', completed, '+(right?'correct':'for review'):''}"><span class="tile-value">${money(value)}</span>${done?`<span class="tile-status">${icon(right?'check':'book')} ${right?'Recalled':'For review'}</span>`:'<span class="tile-open">Explore '+icon('arrow')+'</span>'}</button>`;
    }).join('')).join('')}</div></div>
    <div class="board-bottom"><span>${icon('spark')} Higher values ask you to connect, compare, and explain.</span><span>Think it. Say it. Then reveal.</span></div>
    <div class="progress-track" role="progressbar" aria-label="Questions completed" aria-valuemin="0" aria-valuemax="25" aria-valuenow="${summary.answered}"><span style="width:${summary.answered/25*100}%"></span></div>
  </main>`;
}
