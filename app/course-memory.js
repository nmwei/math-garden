const courseMemory = new Map();
const learningRecordKey = /^math-garden:(course|review|placement|challenge):/;

function readCourseMemory(key) {
  if (courseMemory.has(key)) return courseMemory.get(key);
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeCourseMemory(key, value) {
  courseMemory.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    courseMemory.delete(key);
  } catch {
    // Keep the value for the current visit.
  }
}

function resetLearningProgress() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (learningRecordKey.test(key)) localStorage.removeItem(key);
    }
  } catch {
    return false;
  }
  for (const key of courseMemory.keys()) {
    if (learningRecordKey.test(key)) courseMemory.delete(key);
  }
  return true;
}
