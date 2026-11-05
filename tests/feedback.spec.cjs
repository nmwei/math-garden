const {test,expect}=require('@playwright/test');
const button=(page,name)=>page.getByRole('button',{name,exact:true});
async function openShapes(page){
 await page.addInitScript(()=>{Math.random=()=>0;});
 await page.goto('/#games');await button(page,'图形找朋友').click();
 await button(page,'跳过示范').click();await button(page,'开始练习').click();
}
test('answer cues work offline, interrupt on the next question, and respect the sound preference',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openShapes(page);
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);await page.reload();
 await button(page,'图形找朋友').click();await button(page,'开始练习').click();
 await button(page,'三角形').click();const effect=page.locator('#feedback-audio');
 await expect.poll(()=>effect.evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 expect(await effect.evaluate(a=>a.src)).toContain('/feedback-retry.wav');
 expect(await effect.evaluate(a=>a.volume)).toBe(1);
 await button(page,'圆形').click();
 await expect.poll(()=>effect.evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 expect(await effect.evaluate(a=>a.src)).toContain('/feedback-correct.wav');
 await expect(page.locator('.answer-flower')).toBeVisible();await page.locator('.answer-flower img').evaluate(i=>i.decode());
 await page.screenshot({path:`test-results/unified-flower-${test.info().project.name}-${test.info().line}.png`});
 await button(page,'下一题').click();expect(await effect.evaluate(a=>a.paused)).toBe(true);
 await page.evaluate(()=>localStorage.setItem('math-garden:sound-enabled','false'));
 await page.reload();await button(page,'图形找朋友').click();await button(page,'开始练习').click();
 await button(page,'三角形').click();await button(page,'圆形').click();
 await expect(page.locator('#feedback-audio')).toHaveCount(0);
 await expect(page.locator('.answer-flower')).toBeVisible();
 await expect(button(page,'下一题')).toBeVisible();expect(errors).toEqual([]);
});
test('course practice uses the same feedback channel',async({page})=>{
 await page.goto('/#course/practice/notice-small');
 await button(page,'2').click();
 const effect=page.locator('#feedback-audio');
 await expect.poll(()=>effect.evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 expect(await effect.evaluate(a=>a.src)).toContain('/feedback-retry.wav');
 await button(page,'1').click();
 await expect.poll(()=>effect.evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 expect(await effect.evaluate(a=>a.src)).toContain('/feedback-correct.wav');
 await expect(page.locator('.answer-flower')).toBeVisible();await page.locator('.answer-flower img').evaluate(i=>i.decode());
 await page.screenshot({path:`test-results/unified-flower-${test.info().project.name}-${test.info().line}.png`});
 await button(page,'下一题').click();expect(await effect.evaluate(a=>a.paused)).toBe(true);
});

test('placement gives explicit answers feedback, leaves unsure neutral, and cancels pending navigation',async({page})=>{
 await page.addInitScript(()=>{window.cues=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if(this.id==='feedback-audio')window.cues.push(this.src);return play.apply(this,args);};});
 await page.goto('/#course/start-check');await button(page,'开始找起点').click();await button(page,'7').click();
 await expect(page.locator('.answer-flower')).toBeVisible();await expect(page.locator('.course-progress')).toHaveText('第 1 / 6 题');
 await expect.poll(()=>page.locator('#feedback-audio').evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 await button(page,'继续').click();await expect(page.locator('.course-progress')).toHaveText('第 2 / 6 题');
 await button(page,'还不确定').click();await expect(page.locator('.course-progress')).toHaveText('第 3 / 6 题');
 expect(await page.evaluate(()=>window.cues.length)).toBe(1);await button(page,'3').click();
 await expect.poll(()=>page.locator('#feedback-audio').evaluate(a=>a.currentTime)).toBeGreaterThan(.04);
 expect(await page.locator('#feedback-audio').evaluate(a=>a.src)).toContain('/feedback-retry.wav');
 await page.getByRole('link',{name:'回学习地图',exact:true}).click();
 await page.waitForTimeout(2700);await expect(page.getByRole('heading',{name:'数学学习地图',exact:true})).toBeVisible();
 await expect(page.locator('.answer-flower')).toHaveCount(0);expect(await page.locator('#feedback-audio').evaluate(a=>a.paused)).toBe(true);
});
