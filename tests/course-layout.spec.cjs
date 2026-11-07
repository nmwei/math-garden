const {test,expect}=require('@playwright/test');
test('examples and complex tasks fit landscape; explanations remain expandable',async({page})=>{
 await page.setViewportSize({width:1024,height:768});
 for(const route of ['lesson/g1-time-and-length','lesson/g2-multiply-from-known-facts','practice/g2-multiply-from-known-facts','practice/garden-story-models','practice/bridge-bundle-ten','workshop/mixed']){
  await page.goto('/#course/'+route);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight),route).toBeLessThanOrEqual(2);
 }
 await page.goto('/#course/lesson/g1-time-and-length');
 const extra=page.locator('.course-extension');await expect(extra).not.toHaveAttribute('open','');
 await extra.locator(':scope > summary').click();await expect(extra.getByText('看看怎么想',{exact:true})).toBeVisible();
 await extra.getByText('看看怎么想',{exact:true}).click();await expect(extra.locator('details')).toHaveAttribute('open','');
 await page.locator('[data-action="start"]').click();await expect(page.locator('.course-progress')).toContainText('1 /');
});
