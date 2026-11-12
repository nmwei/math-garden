const {learningStorage,MATH_RECORDS}=gardenAccount;
function readRecords(){return JSON.parse(learningStorage.getItem(MATH_RECORDS)||'{"version":1,"records":{}}');}
function readCourseMemory(key){return readRecords().records[key]??null;}
function writeCourseMemory(key,value){const data=readRecords();data.records[key]=value;learningStorage.setItem(MATH_RECORDS,JSON.stringify(data));return true;}
function resetLearningProgress(){try{learningStorage.setItem(MATH_RECORDS,JSON.stringify({version:1,records:{}}));return true;}catch{return false;}}
