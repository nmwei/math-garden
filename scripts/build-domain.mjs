import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
 const context=vm.createContext({});
 for(const name of ['course-models','course-foundation','course-grade1','course-grade2','course-grade3','course-bridge','course-extensions','course-enrichment','course-teaching','course-variants','course-practice','course-study','challenge-paths','course-story-workshop','course-fraction-workshop','course-workshop']){
  vm.runInContext(await readFile(new URL(`../web/app/${name}.js`,import.meta.url),'utf8'),context,{timeout:2000});
 }
 const math=vm.runInContext(`(()=>{const records={};for(const l of courseLessons){records['math-garden:course:'+l.id]={type:'course',min:l.practice.length,max:Math.max(5,l.practice.length)};records['math-garden:review:'+l.id]={type:'review'};}records[placementKey]={type:'placement'};for(const p of challengePaths)for(const s of p.skills)records[challengeRecordKey(p,s)]={type:'challenge'};for(const w of workshopLessons)records[workshopRecordKey(w.id)]={type:'workshop'};records[workshopRecordKey('mixed')]={type:'workshop'};return {records,placement:[...placementActivities.map(x=>x.nextLesson),'bridge-cross-ten'],games:['counting','shapes','patterns','compare','compose']};})()`,context);

await writeFile(new URL('../domain/catalog.json',import.meta.url),JSON.stringify(math));
