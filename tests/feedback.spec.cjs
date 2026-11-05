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
 await button(page,'下一题').click();expect(await effect.evaluate(a=>a.paused)).toBe(true);
 await page.evaluate(()=>localStorage.setItem('math-garden:sound-enabled','false'));
 await page.reload();await button(page,'图形找朋友').click();await button(page,'开始练习').click();
 await button(page,'三角形').click();await button(page,'圆形').click();
 await expect(page.locator('#feedback-audio')).toHaveCount(0);
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
 await button(page,'下一题').click();expect(await effect.evaluate(a=>a.paused)).toBe(true);
});
