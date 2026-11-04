const courseMemory = new Map();

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
