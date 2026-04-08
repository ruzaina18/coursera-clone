const COURSE_PROGRESS_KEY = "course-progress-v1";

type CourseProgressState = {
  completedCourseIds: string[];
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readProgress(): CourseProgressState {
  if (!canUseStorage()) {
    return { completedCourseIds: [] };
  }

  try {
    const raw = window.localStorage.getItem(COURSE_PROGRESS_KEY);
    if (!raw) {
      return { completedCourseIds: [] };
    }
    return JSON.parse(raw) as CourseProgressState;
  } catch {
    return { completedCourseIds: [] };
  }
}

function writeProgress(next: CourseProgressState) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(next));
}

export function isCourseCompleted(courseId: string) {
  return readProgress().completedCourseIds.includes(courseId);
}

export function markCourseCompleted(courseId: string) {
  const current = readProgress();
  if (current.completedCourseIds.includes(courseId)) {
    return;
  }

  writeProgress({
    completedCourseIds: [...current.completedCourseIds, courseId],
  });
}
