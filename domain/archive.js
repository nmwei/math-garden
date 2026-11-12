import {envelope,requireValue as check,exact,record} from '@garden/account/envelope';
export const MATH_RECORDS='math-records-v1',MATH_PREFERENCES='math-preferences-v1';
const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v);
export function mathContract(catalog){
 return snapshot=>{
  envelope(snapshot,'math',[MATH_RECORDS,MATH_PREFERENCES]);
  const data=snapshot.data[MATH_RECORDS];
  if(data!==undefined){exact(data,['version','records']);check(data.version===1&&record(data.records));
   for(const [key,value] of Object.entries(data.records)){
    const spec=catalog.records[key];check(spec,'不支持的数学学习记录');
    if(spec.type==='course'){exact(value,['independent','total','attempts']);check(integer(value.total,spec.min,spec.max)&&integer(value.independent,0,value.total)&&integer(value.attempts,1));}
    if(spec.type==='review'){exact(value,['streak','practiceOn','reviewOn','variant']);check(integer(value.streak,0,3)&&integer(value.variant,1)&&day(value.practiceOn)&&day(value.reviewOn)&&value.reviewOn>=value.practiceOn);}
    if(spec.type==='placement')check(catalog.placement.includes(value));
    if(spec.type==='workshop')check(integer(value,1));
    if(spec.type==='challenge'){exact(value,['attempts','outcome']);check(integer(value.attempts,1)&&['independent','retry','practice','unsure'].includes(value.outcome));}
   }
  }
  const prefs=snapshot.data[MATH_PREFERENCES];
  if(prefs!==undefined){exact(prefs,['version','demoSeen']);check(prefs.version===1&&record(prefs.demoSeen));for(const [key,value] of Object.entries(prefs.demoSeen))check(catalog.games.includes(key)&&typeof value==='boolean');}
  return snapshot;
 };
}
