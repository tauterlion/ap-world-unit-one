// Optional integration check: start the app first; requires Playwright and Edge.
require('node:fs').mkdirSync('tmp',{recursive:true});
const { chromium }=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1080}});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 await page.goto('http://127.0.0.1:4173');await page.locator('.topic-card').first().waitFor();
 await page.locator('[data-topic="1.2"]').click();await page.locator('.intro').waitFor();
 await page.locator('.revealing').waitFor();
 await page.locator('[data-action="sound"]').click();
 await page.locator('.game-board:not(.revealing)').waitFor();
 assert.equal(await page.locator('.question-tile:not(:disabled)').count(),25);
 await page.screenshot({path:'tmp/board-desktop.png',fullPage:true,animations:'disabled'});
 await page.locator('[data-id="1.2-state-500"]').click();await page.locator('[data-action="reveal"]').click();
 await page.screenshot({path:'tmp/answer-desktop.png',fullPage:true,animations:'disabled'});
 assert.match(await page.locator('.source-link').innerText(),/AMSCO · p\. 16/);
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});await page.locator('.brand').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390)await page.screenshot({path:'tmp/home-mobile.png',fullPage:true,animations:'disabled'});
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-topic="1.3"]').click();await page.locator('[data-action="skip"]').click();
 await page.screenshot({path:'tmp/board-mobile.png',fullPage:true,animations:'disabled'});
 await page.locator('[data-id="1.3-southeast-400"]').click();
 await page.screenshot({path:'tmp/question-mobile.png',fullPage:true,animations:'disabled'});
 await page.locator('[data-action="reveal"]').click();
 await page.screenshot({path:'tmp/answer-mobile.png',fullPage:true,animations:'disabled'});
 // Seed a completed fixture to verify recap layout and the final-grade back route.
 await page.evaluate(async()=>{
  const topic=await (await fetch('./src/data/unit1/1.1.json')).json();
  const save=JSON.parse(localStorage.getItem('study-stage-v1'));
  save.runs['1.1']={id:'visual-fixture',topicId:'1.1',grades:topic.categories.flatMap(c=>c.questions).map((q,i)=>({questionId:q.id,correct:i%3!==0})),updatedAt:Date.now()};
  localStorage.setItem('study-stage-v1',JSON.stringify(save));
 });
 await page.reload();await page.locator('[data-topic="1.1"]').click();
 await page.screenshot({path:'tmp/results-mobile.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:1440,height:1080});
 await page.screenshot({path:'tmp/results-desktop.png',fullPage:true,animations:'disabled'});
 await page.locator('[data-action="undo"]').click();await page.locator('[data-action="correct"]').click();
 await page.locator('[data-action="board"]').click();await page.locator('[data-action="results"]').click();await page.locator('.results-page').waitFor();
 // Denied storage must not prevent loading or gameplay.
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
 const dp=await denied.newPage();await dp.goto('http://127.0.0.1:4173');await dp.locator('.topic-card').first().waitFor();assert.equal(await dp.locator('.storage-notice').count(),1);
 console.log('Visual/edge checks passed: sequential reveal, mute during reveal, 320/390/768/1280 layout, source citations, final-grade back navigation, denied storage.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
