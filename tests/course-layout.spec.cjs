const {test,expect}=require('@playwright/test');
test('teaching questions remain visible before revealing the solution',async({page})=>{
 for(const viewport of [{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto('/#course/lesson/g1-time-and-length');
  await page.reload();
  const teaching=page.getByRole('region',{name:'换个例子想一想'});
  await expect(teaching).toBeVisible();
  await expect(teaching.getByRole('button',{name:'听问题',exact:true})).toBeVisible();
  await expect(teaching.locator('details')).not.toHaveAttribute('open','');
  await teaching.getByText('看看怎么想',{exact:true}).click();
  await expect(teaching.locator('details')).toHaveAttribute('open','');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.locator('[data-action="start"]').click();
  await expect(page.locator('.course-progress')).toContainText('1 /');
 }
});
