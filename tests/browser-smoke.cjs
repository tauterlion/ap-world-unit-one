// Optional integration check: start the app first; requires Playwright and Edge.
require('node:fs').mkdirSync('tmp',{recursive:true});
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'msedge'});
  const context=await browser.newContext({viewport:{width:1440,height:1080}});
  const page=await context.newPage();const errors=[];page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');await page.locator('.topic-card').first().waitFor();
  await page.screenshot({path:'tmp/home-desktop.png',fullPage:true,animations:'disabled'});
  assert.equal(await page.locator('.topic-card').count(),6);
  await page.locator('[data-topic="1.1"]').click();await page.locator('.intro').waitFor();
  await page.locator('[data-action="skip"]').click();await page.locator('.question-tile:not(:disabled)').first().waitFor();
  assert.equal(await page.locator('.question-tile').count(),25);
  await page.screenshot({path:'tmp/board-desktop.png',fullPage:true,animations:'disabled'});
  console.log('Board opened');
  await page.locator('[data-action="question"]').first().click();assert.equal(await page.locator('.answer-panel').count(),0);
  console.log('Question opened');
  await page.locator('[data-action="reveal"]').click();await page.locator('[data-action="correct"]').click();
  await page.locator('[data-action="continue"]').click();await page.waitForTimeout(500);
  assert.equal(await page.locator('.score-value').innerText(),'$100');
  await page.locator('[data-action="undo"]').click();await page.locator('[data-action="incorrect"]').click();await page.locator('[data-action="continue"]').click();
  assert.equal(await page.locator('.score-value').innerText(),'$0');
  assert.equal(await page.locator('.was-missed').count(),1);
  console.log('Scoring and undo passed');
  await page.reload();await page.locator('[data-topic="1.1"]').click();
  assert.equal(await page.locator('.completed').count(),1);
  let count=1;
  while(await page.locator('.question-tile:not(:disabled)').count()){
    await page.locator('.question-tile:not(:disabled)').first().click();
    if(await page.locator('.stimulus').count())await page.screenshot({path:'tmp/question-stimulus.png',fullPage:true,animations:'disabled'});
    await page.locator('[data-action="reveal"]').click();
    if(count===17)await page.screenshot({path:'tmp/answer-desktop.png',fullPage:true,animations:'disabled'});
    await page.locator(`[data-action="${count%3===0?'incorrect':'correct'}"]`).click();
    await page.locator('[data-action="continue"]').click();count++;console.log('Completed',count);
    if(count===25)break;
  }
  await page.locator('.results-page').waitFor();
  assert.equal(await page.locator('.missed-card').count(),9);
  await page.screenshot({path:'tmp/results-desktop.png',fullPage:true,animations:'disabled'});
  await page.locator('[data-action="review"]').click();
  for(let i=0;i<9;i++){await page.locator('[data-action="reveal"]').click();await page.locator('[data-action="review-next"]').click();}
  await page.locator('.results-page').waitFor();
  await page.locator('[data-action="undo"]').click();await page.locator('[data-action="correct"]').click();await page.locator('[data-action="continue"]').click();
  assert.equal(await page.locator('.missed-card').count(),8);
  await page.locator('[data-action="replay"]').click();assert.equal(await page.locator('.completed').count(),0);
  // Test all topic routes and text/table stimuli.
  for(const id of ['1.2','1.3','1.4','1.5','1.6']){
    await page.locator('.brand').click();await page.locator(`[data-topic="${id}"]`).click();
    if(await page.locator('[data-action="skip"]').count())await page.locator('[data-action="skip"]').click();
    assert.equal(await page.locator('.question-tile').count(),25);
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.brand').click();
  await page.screenshot({path:'tmp/home-mobile.png',fullPage:true,animations:'disabled'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-topic="1.3"]').click();
  await page.screenshot({path:'tmp/board-mobile.png',fullPage:true,animations:'disabled'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-id="1.3-southeast-400"]').click();await page.locator('table').waitFor();
  await page.screenshot({path:'tmp/question-mobile.png',fullPage:true,animations:'disabled'});
  await page.locator('[data-action="reveal"]').click();await page.screenshot({path:'tmp/answer-mobile.png',fullPage:true,animations:'disabled'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.keyboard.press('Escape');await page.locator('.game-board').waitFor();
  // Reduced motion skips intro, native keyboard buttons work, mute survives reload.
  const reduced=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const rp=await reduced.newPage();await rp.goto('http://127.0.0.1:4173');await rp.locator('[data-topic="1.6"]').click();
  assert.equal(await rp.locator('.intro').count(),0);await rp.locator('.game-board').waitFor();
  await rp.locator('.question-tile').first().focus();await rp.keyboard.press('Enter');await rp.locator('.question-page').waitFor();
  await rp.locator('[data-action="sound"]').click();await rp.reload();await rp.locator('[data-action="sound"]').waitFor();assert.equal(await rp.locator('[data-action="sound"]').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);console.log('Browser checks passed: six boards, full 25-question flow, score/undo, resume, recap, review, replay, phone overflow, table stimuli, keyboard, reduced motion, mute persistence.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
