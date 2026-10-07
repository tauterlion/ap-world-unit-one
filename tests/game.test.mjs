import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRun, grade, undo, summarize, questionsOf, validateTopic } from '../src/game/engine.js';
import { freshSave, readSave, writeSave, recordCompletion } from '../src/game/storage.js';
const topics=await Promise.all(['1.1','1.2','1.3','1.4','1.5','1.6'].map(async id=>JSON.parse(await readFile(`src/data/unit1/${id}.json`,'utf8'))));
const topic=topics[0],questions=questionsOf(topic);
test('all six boards have complete, unique, source-referenced content within topic boundaries',()=>{
  const ranges=[[3,14],[15,22],[23,32],[33,42],[43,52],[53,64]];
  const ids=new Set(),prompts=new Set();
  topics.forEach((t,index)=>{
    validateTopic(t);
    for(const q of questionsOf(t)){
      assert(!ids.has(q.id));ids.add(q.id);assert(!prompts.has(q.prompt));prompts.add(q.prompt);
      assert(q.source.printedPages.every(p=>p>=ranges[index][0]&&p<=ranges[index][1]));
      assert.deepEqual(q.source.pdfPages,q.source.printedPages.map(p=>p+64));
      assert(q.explanation.length>50);assert(q.answer.length>4);
      if(q.stimulus?.type==='table'){assert(q.stimulus.rows.length);assert(q.stimulus.rows.every(row=>row.length===q.stimulus.headers.length));}
    }
  });assert.equal(ids.size,150);
});
test('correct adds value, incorrect adds zero, and duplicate grading cannot inflate score',()=>{
  let run=createRun(topic.topic,'test');run=grade(run,questions[0],true);run=grade(run,questions[1],false);
  assert.equal(summarize(topic,run).score,100);assert.equal(summarize(topic,run).accuracy,50);
  assert.equal(grade(run,questions[0],true),run);assert.equal(grade(run,questions[1],true),run);
});
test('undo reopens the last question and permits an honest correction',()=>{
  let run=createRun(topic.topic,'test');run=grade(run,questions[4],false);run=undo(run);assert.equal(run.grades.length,0);
  run=grade(run,questions[4],true);assert.equal(summarize(topic,run).score,500);
  run=undo(run);assert.equal(summarize(topic,run).score,0);assert.equal(undo(run).grades.length,0);
});
test('a complete mixed board calculates recap, category accuracy, and only missed questions',()=>{
  let run=createRun(topic.topic,'test');questions.forEach((q,i)=>run=grade(run,q,i%2===0));
  const summary=summarize(topic,run);assert.equal(summary.complete,true);assert.equal(summary.correct,13);assert.equal(summary.incorrect,12);
  assert.equal(summary.accuracy,52);assert.equal(summary.missed.length,12);assert.equal(summary.categories[0].accuracy,60);
  assert.equal(summary.score,questions.filter((q,i)=>i%2===0).reduce((n,q)=>n+q.value,0));
});
test('all correct is 7500 and all incorrect is zero, both complete',()=>{
  for(const right of [true,false]){let run=createRun(topic.topic,'test');questions.forEach(q=>run=grade(run,q,right));const s=summarize(topic,run);assert.equal(s.score,right?7500:0);assert.equal(s.complete,true);assert.equal(s.missed.length,right?0:25);}
});
test('local persistence resumes a run and survives denied or malformed storage',()=>{
  const memory={value:null,getItem(){return this.value;},setItem(key,value){this.value=value;}};
  const save=freshSave();save.runs[topic.topic]=grade(createRun(topic.topic,'test'),questions[0],false);assert(writeSave(save,memory));
  assert.equal(readSave(topics,memory).runs[topic.topic].grades.length,1);
  memory.value='{bad';assert.deepEqual(readSave(topics,memory),freshSave());
  const denied={getItem(){throw Error();},setItem(){throw Error();}};assert.equal(writeSave(save,denied),false);assert.deepEqual(readSave(topics,denied),freshSave());
});
test('unrecognized and duplicate persisted grades are discarded',()=>{
  const save=freshSave();save.runs[topic.topic]={id:'test',topicId:topic.topic,grades:[{questionId:questions[0].id,correct:true},{questionId:questions[0].id,correct:false},{questionId:'not-real',correct:true},null]};
  const clean=readSave(topics,{getItem:()=>JSON.stringify(save)});assert.equal(clean.runs[topic.topic].grades.length,1);
});
test('completion is recorded once, and undo retracts the current run result',()=>{
  const save=freshSave();let run=createRun(topic.topic,'test');questions.forEach(q=>run=grade(run,q,true));
  recordCompletion(save,topic,run,summarize(topic,run));recordCompletion(save,topic,run,summarize(topic,run));assert.equal(save.history[topic.topic].length,1);
  run=undo(run);recordCompletion(save,topic,run,summarize(topic,run));assert.equal(save.history[topic.topic].length,0);
});
