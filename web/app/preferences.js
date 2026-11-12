const gardenPreferences=(()=>{
 const {learningStorage,MATH_PREFERENCES,device}=gardenAccount;
 const read=()=>JSON.parse(learningStorage.getItem(MATH_PREFERENCES)||'{"version":1,"demoSeen":{}}');
 return {soundEnabled:()=>device.getItem('math-garden:sound-enabled')!=='false',setSoundEnabled:enabled=>device.setItem('math-garden:sound-enabled',String(enabled)),
 demoSeen:activity=>read().demoSeen[activity]===true,
 markDemoSeen:activity=>{const value=read();value.demoSeen[activity]=true;learningStorage.setItem(MATH_PREFERENCES,JSON.stringify(value));}};
})();
