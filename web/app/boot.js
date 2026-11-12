import {storage,learningStorage,MATH_RECORDS,MATH_PREFERENCES} from './account-storage.js';
import {accountPanel,parentIdentity} from './account-ui.js';
import {client} from './account-client.js';
const allowedDevice=new Set(['math-garden:sound-enabled','math-garden:voice-uri']);
const device={getItem:key=>{if(!allowedDevice.has(key))throw Error('未知设备设置');return localStorage.getItem(key);},setItem:(key,value)=>{if(!allowedDevice.has(key))throw Error('未知设备设置');localStorage.setItem(key,value);},removeItem:key=>{if(!allowedDevice.has(key))throw Error('未知设备设置');localStorage.removeItem(key);}};
globalThis.gardenAccount={storage,learningStorage,MATH_RECORDS,MATH_PREFERENCES,client,device,accountPanel,parentIdentity};
try {
 const scripts=['shapes.js', 'patterns.js', 'number-games.js', 'choice-game.js', 'counting.js', 'preferences.js', 'feedback-audio.js', 'voice.js', 'shell.js', 'offline.js', 'garden-ui.js', 'course-models.js', 'course-foundation.js', 'course-grade1.js', 'course-grade2.js', 'course-grade3.js', 'course-bridge.js', 'course-extensions.js', 'course-enrichment.js', 'course-teaching.js', 'course-variants.js', 'course-practice.js', 'course-memory.js', 'course-study.js', 'course-manipulatives.js', 'challenge-paths.js', 'course-challenge.js', 'course-story-workshop.js', 'course-fraction-workshop.js', 'course-workshop.js', 'course.js', 'parent.js', 'main.js'];
 for(const name of scripts)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(name,import.meta.url);script.onload=resolve;script.onerror=()=>reject(Error('无法加载 '+name));document.head.append(script);});
 document.documentElement.dataset.gardenReady='true';
 document.querySelector('#account-hub-mount').innerHTML=accountPanel();
 const link=document.querySelector('.garden-parent-link');
 link.querySelector('span').innerHTML=`<span class="parent-nav-copy">${parentIdentity()}<span>家长小角</span></span>`;
} catch {
 document.querySelector('.garden').innerHTML='<section><h1>小花园暂时无法打开</h1><p>请联网刷新后重试，原记录仍保留。</p></section>';
}
