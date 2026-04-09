const LEARNING_STREAK_KEY = "learning-streak-v1";
const LEARNING_STREAK_EVENT = "learning-streak-updated";

type DailyActivity = {
  login: boolean;
  courseActivity: boolean;
  courses: string[];
};

type LearningStreakStorage = {
  daily: Record<string, DailyActivity>;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
};

export type StreakBadge = {
  days: number;
  label: string;
};

export type LearningStreakStats = {
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  badges: StreakBadge[];
};

const badgeMilestones = [3, 7, 14, 30];

function canUseStorage() {
  return typeof window !== "undefined";
}

function getDefaultState(): LearningStreakStorage {
  return {
    daily: {},
    currentStreak: 0,
    longestStreak: 0,
    lastQualifiedDate: null,
  };
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayDifference(fromDateKey: string, toDateKey: string) {
  const start = parseDateKey(fromDateKey);
  const end = parseDateKey(toDateKey);
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24));
}

function readState(): LearningStreakStorage {
  if (!canUseStorage()) {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(LEARNING_STREAK_KEY);
    if (!raw) {
      return getDefaultState();
    }
    return JSON.parse(raw) as LearningStreakStorage;
  } catch {
    return getDefaultState();
  }
}

function writeState(next: LearningStreakStorage) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LEARNING_STREAK_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(LEARNING_STREAK_EVENT));
}

function updateQualificationForToday(state: LearningStreakStorage, today: string) {
  const todayActivity = state.daily[today];
  if (!todayActivity || !(todayActivity.login && todayActivity.courseActivity)) {
    return state;
  }

  if (state.lastQualifiedDate === today) {
    return state;
  }

  let nextCurrentStreak = 1;
  if (state.lastQualifiedDate) {
    const gap = dayDifference(state.lastQualifiedDate, today);
    if (gap === 1) {
      nextCurrentStreak = state.currentStreak + 1;
    }
  }

  return {
    ...state,
    currentStreak: nextCurrentStreak,
    longestStreak: Math.max(state.longestStreak, nextCurrentStreak),
    lastQualifiedDate: today,
  };
}

function applyMissedDayResetForDisplay(state: LearningStreakStorage) {
  if (!state.lastQualifiedDate) {
    return state;
  }

  const today = getDateKey();
  const gapFromLastQualified = dayDifference(state.lastQualifiedDate, today);
  if (gapFromLastQualified > 1 && state.currentStreak !== 0) {
    return {
      ...state,
      currentStreak: 0,
    };
  }

  return state;
}

export function getLearningStreakUpdateEventName() {
  return LEARNING_STREAK_EVENT;
}

export function markDailyLogin() {
  const today = getDateKey();
  const state = readState();
  const todayActivity = state.daily[today] || {
    login: false,
    courseActivity: false,
    courses: [],
  };

  if (todayActivity.login) {
    return;
  }

  const nextState: LearningStreakStorage = {
    ...state,
    daily: {
      ...state.daily,
      [today]: {
        ...todayActivity,
        login: true,
      },
    },
  };

  writeState(updateQualificationForToday(nextState, today));
}

export function markCourseActivity(courseId?: string) {
  const today = getDateKey();
  const state = readState();
  const todayActivity = state.daily[today] || {
    login: false,
    courseActivity: false,
    courses: [],
  };

  const nextCourses =
    courseId && !todayActivity.courses.includes(courseId)
      ? [...todayActivity.courses, courseId]
      : todayActivity.courses;

  const nextState: LearningStreakStorage = {
    ...state,
    daily: {
      ...state.daily,
      [today]: {
        ...todayActivity,
        courseActivity: true,
        courses: nextCourses,
      },
    },
  };

  writeState(updateQualificationForToday(nextState, today));
}

export function getLearningStreakStats(): LearningStreakStats {
  const state = applyMissedDayResetForDisplay(readState());

  const badges = badgeMilestones
    .filter((days) => state.longestStreak >= days)
    .map((days) => ({
      days,
      label: `${days}-Day Streak`,
    }));

  return {
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastQualifiedDate: state.lastQualifiedDate,
    badges,
  };
}
