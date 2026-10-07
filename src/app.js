import { validateTopic, createRun, questionsOf, grade, undo, summarize } from './game/engine.js';
import { readSave, writeSave, recordCompletion } from './game/storage.js';
import { SoundStage } from './game/audio.js';
import { esc, icon, button } from './components/common.js';
import { topicSelect } from './components/topics.js';
import { gameIntro, gameBoard } from './components/board.js';
import { questionView } from './components/question.js';
import { resultsView } from './components/results.js';

const app=document.querySelector('#app');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let topics=[],save,sound,screen='home',topic=null,question=null,revealed=false,reviewIndex=0;
let timers=[],revealing=false,storageAvailable=true,animationFrame=0;
const currentRun=()=>save.runs[topic.topic];
const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
function clearTimers(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(animationFrame);}
function persist(){storageAvailable=writeSave(save);}
function render(focus=true){
  const isReview=screen==='review'; const run=topic?currentRun():null;
  let content='';
  if(screen==='home') content=topicSelect(topics,save);
  if(screen==='intro') content=gameIntro(topic);
  if(screen==='board') content=gameBoard(topic,run,revealing);
  if(screen==='question'||isReview){
    const review=isReview?{index:reviewIndex,total:summarize(topic,run).missed.length}:null;
    content=questionView(topic,question,run,revealed,run.grades.find(g=>g.questionId===question.id)?.correct,review);
  }
  if(screen==='results')content=resultsView(topic,run);
  app.innerHTML=`<header class="site-header"><button class="brand" data-action="home" aria-label="Study Stage, back to topics"><span class="brand-mark">${icon('grid')}</span><span>WORLD HISTORY<small>STUDY STAGE</small></span></button><div class="header-right"><span class="header-note">A little curiosity goes a long way.</span>${button(icon(save.sound?'sound':'mute')+`<span>Sound ${save.sound?'on':'off'}</span>`,'sound','sound-control',`aria-pressed="${save.sound}" aria-label="Sound ${save.sound?'on, mute sound':'off, enable sound'}"`)}</div></header>${!storageAvailable?'<div class="storage-notice" role="status">Your browser isn’t allowing saves. You can keep studying, but progress will be lost when this page closes.</div>':''}${content}`;
  if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('#page-title')?.focus({preventScroll:true});}
}
function go(next){clearTimers();revealing=false;screen=next;render();}
function openBoard(withReveal=false){
  clearTimers();screen='board';revealing=withReveal&&!reducedMotion.matches;render();
  if(!revealing)return;
  topic.categories.forEach((_,i)=>later(()=>{
    document.querySelector(`[data-category-index="${i}"]`)?.classList.add('category-visible');
    document.querySelectorAll(`[data-column="${i}"]`).forEach(el=>el.classList.add('column-visible'));
    sound.play('category',i);
  },120+i*210));
  later(finishIntro,1250);
}
function finishIntro(){
  clearTimers();if(!save.introsSeen.includes(topic.topic))save.introsSeen.push(topic.topic);persist();openBoard(false);
}
function enterTopic(id,replay=false){
  topic=topics.find(t=>t.topic===id);if(!topic)return;
  if(replay||!save.runs[id])save.runs[id]=createRun(id);
  persist();question=null;revealed=false;
  if(summarize(topic,currentRun()).complete){sound.play('results');go('results');return;}
  if(currentRun().grades.length || save.introsSeen.includes(id) || reducedMotion.matches){sound.play('menu');openBoard();return;}
  go('intro');sound.play('open');later(()=>openBoard(true),1400);
}
function applyGrade(correct){
  if(screen!=='question'||!revealed||currentRun().grades.some(g=>g.questionId===question.id))return;
  const previous=summarize(topic,currentRun()).score;
  save.runs[topic.topic]=grade(currentRun(),question,correct);
  const summary=summarize(topic,currentRun());recordCompletion(save,topic,currentRun(),summary);persist();
  sound.play(correct?'correct':'incorrect');render(false);
  document.querySelector('[data-action="continue"]')?.focus({preventScroll:true});
  if(correct)later(()=>sound.play('score'),230);
  // The score counter is shown on return to the board; keep the starting value in memory.
  scoreFrom=previous;
}
let scoreFrom=null;
function animateScore(){
  const target=summarize(topic,currentRun()).score,from=scoreFrom;scoreFrom=null;
  if(from===null||from===target||reducedMotion.matches)return;
  const start=performance.now(),element=document.querySelector('.score-value');
  function tick(now){const p=Math.min((now-start)/450,1);if(element)element.textContent='$'+Math.round(from+(target-from)*(1-(1-p)**3)).toLocaleString('en-US');if(p<1)animationFrame=requestAnimationFrame(tick);}
  animationFrame=requestAnimationFrame(tick);
}
function undoLast(){
  if(!topic||!currentRun().grades.length)return;
  const last=currentRun().grades.at(-1);save.runs[topic.topic]=undo(currentRun());
  recordCompletion(save,topic,currentRun(),summarize(topic,currentRun()));persist();
  question=questionsOf(topic).find(q=>q.id===last.questionId);revealed=true;sound.play('undo');go('question');
  document.querySelector('#answer-title')?.focus({preventScroll:true});
}
function setReview(index){
  const missed=summarize(topic,currentRun()).missed;
  if(index>=missed.length){sound.play('results');go('results');return;}
  reviewIndex=Math.max(0,index);question=missed[reviewIndex];revealed=false;go('review');
}
app.addEventListener('click',event=>{
  const target=event.target.closest('button[data-action]');if(!target||target.disabled)return;
  const action=target.dataset.action;sound?.unlock();
  if(action==='sound'){
    save.sound=!save.sound;sound.enabled=save.sound;if(!save.sound && sound.context)sound.context.suspend().catch(()=>{});
    if(save.sound)sound.play('menu');persist();
    target.innerHTML=icon(save.sound?'sound':'mute')+`<span>Sound ${save.sound?'on':'off'}</span>`;
    target.setAttribute('aria-pressed',String(save.sound));
    target.setAttribute('aria-label',save.sound?'Sound on, mute sound':'Sound off, enable sound');return;
  }
  if(action==='home'){sound.play('menu');go('home');}
  if(action==='topic')enterTopic(target.dataset.topic);
  if(action==='skip')finishIntro();
  if(action==='board'){openBoard();}
  if(action==='question'){
    if(revealing)return;const q=questionsOf(topic).find(q=>q.id===target.dataset.id);
    if(!q||currentRun().grades.some(g=>g.questionId===q.id))return;
    question=q;revealed=false;sound.play('tile');go('question');later(()=>sound.play('question'),150);
  }
  if(action==='reveal' && ['question','review'].includes(screen)){
    revealed=true;sound.play('reveal');render(false);const answer=document.querySelector('#answer-title');answer?.focus({preventScroll:true});answer?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'nearest'});
  }
  if(action==='correct')applyGrade(true);
  if(action==='incorrect')applyGrade(false);
  if(action==='continue'){
    if(summarize(topic,currentRun()).complete){sound.play('complete');go('results');later(()=>sound.play('results'),550);}
    else {openBoard();animateScore();}
  }
  if(action==='undo')undoLast();
  if(action==='replay')enterTopic(topic.topic,true);
  if(action==='results'){sound.play('results');go('results');}
  if(action==='review' && summarize(topic,currentRun()).missed.length){sound.play('menu');setReview(0);}
  if(action==='review-prev')setReview(reviewIndex-1);
  if(action==='review-next')setReview(reviewIndex+1);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && ['question','review'].includes(screen)){event.preventDefault();screen==='review'?go('results'):openBoard();}
});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&(screen==='intro'||revealing))finishIntro();});
async function boot(){
  try {
    const response=await fetch('./src/data/unit1/topics.json');if(!response.ok)throw new Error('Topic list unavailable');
    const metadata=await response.json();
    topics=await Promise.all(metadata.filter(t=>t.enabled).map(async t=>{
      const result=await fetch(`./src/data/unit1/${t.id}.json`);if(!result.ok)throw new Error('Board unavailable');return validateTopic(await result.json());
    }));
    save=readSave(topics);sound=new SoundStage(save.sound);persist();render(false);
  }catch(error){
    console.error(error);app.innerHTML=`<main id="main" class="loading"><span class="eyebrow">STUDY STAGE</span><h1>The board couldn’t load.</h1><p>Run this project with <code>npm start</code> and open the local address shown in your terminal.</p><p>If it’s already running, check that the question files are present and reload.</p><button class="button primary" onclick="location.reload()">Try again</button></main>`;
  }
}
boot();
