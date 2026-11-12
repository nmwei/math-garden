import {createStorage} from './account-runtime/storage.js';
import {MATH_RECORDS,MATH_PREFERENCES,mathContract} from '../domain/archive.js';
const response=await fetch(new URL('../domain/catalog.json',import.meta.url));
if(!response.ok)throw Error('数学数据契约暂时无法打开');
export const validateArchive=mathContract(await response.json());
const keys=[MATH_RECORDS,MATH_PREFERENCES];
export const storage=await createStorage({subject:'math',ARCHIVE_KEYS:keys,validateArchive,
 definition:key=>{if(!keys.includes(key))throw Error('未登记的数学数据');},projectLearningValue:(_key,value)=>value});
export const {learningStorage}=storage;
export {MATH_RECORDS,MATH_PREFERENCES};

try{validateArchive(storage.captureArchive());}catch(error){storage.blockStorage('本机学习记录需要检查，原记录已保留：'+error.message);}
