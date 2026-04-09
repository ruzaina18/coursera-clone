import { isCourseCompleted } from "@/lib/courseProgress";

const COURSE_REMINDERS_KEY = "course-reminders-v1";

export type ReminderOption = "1h" | "tomorrow" | "none";

type CourseReminder = {
  courseId: string;
  courseTitle: string;
  remindAt: number;
  notified: boolean;
};

type CourseReminderState = {
  reminders: Record<string, CourseReminder>;
};

let scheduledTimers: number[] = [];

function canUseStorage() {
  return typeof window !== "undefined";
}

function readState(): CourseReminderState {
  if (!canUseStorage()) {
    return { reminders: {} };
  }

  try {
    const raw = window.localStorage.getItem(COURSE_REMINDERS_KEY);
    if (!raw) {
      return { reminders: {} };
    }
    return JSON.parse(raw) as CourseReminderState;
  } catch {
    return { reminders: {} };
  }
}

function writeState(next: CourseReminderState) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(COURSE_REMINDERS_KEY, JSON.stringify(next));
}

function clearTimers() {
  scheduledTimers.forEach((timerId) => window.clearTimeout(timerId));
  scheduledTimers = [];
}

function getReminderTime(option: Exclude<ReminderOption, "none">) {
  const now = new Date();
  if (option === "1h") {
    return Date.now() + 60 * 60 * 1000;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.getTime();
}

function showReminderNotification(courseTitle: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  new Notification("Course Reminder", {
    body: `Keep your momentum going in "${courseTitle}".`,
    icon: "/favicon.ico",
  });
}

function notifyIfDue(reminder: CourseReminder) {
  if (reminder.notified || Date.now() < reminder.remindAt) {
    return reminder;
  }

  if (isCourseCompleted(reminder.courseId)) {
    return {
      ...reminder,
      notified: true,
    };
  }

  showReminderNotification(reminder.courseTitle);
  return {
    ...reminder,
    notified: true,
  };
}

function scheduleAllReminders() {
  if (!canUseStorage()) {
    return;
  }

  clearTimers();
  const state = readState();
  const nextReminders: Record<string, CourseReminder> = {};

  Object.values(state.reminders).forEach((reminder) => {
    const updated = notifyIfDue(reminder);
    if (!updated.notified) {
      const delay = Math.max(0, updated.remindAt - Date.now());
      const timerId = window.setTimeout(() => {
        const current = readState();
        const currentReminder = current.reminders[updated.courseId];
        if (!currentReminder) {
          return;
        }
        const next = notifyIfDue(currentReminder);
        current.reminders[updated.courseId] = next;
        writeState(current);
      }, delay);
      scheduledTimers.push(timerId);
    }

    nextReminders[updated.courseId] = updated;
  });

  writeState({ reminders: nextReminders });
}

export async function setCourseReminder(
  courseId: string,
  courseTitle: string,
  option: ReminderOption
) {
  if (!canUseStorage()) {
    return {
      ok: false,
      message: "Reminders are only available in the browser.",
    };
  }

  if (option === "none") {
    const state = readState();
    delete state.reminders[courseId];
    writeState(state);
    scheduleAllReminders();
    return { ok: true, message: "Reminders turned off for this course." };
  }

  if (!("Notification" in window)) {
    return { ok: false, message: "This browser does not support notifications." };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return {
      ok: false,
      message: "Notification permission is required to set reminders.",
    };
  }

  const remindAt = getReminderTime(option);
  const state = readState();
  state.reminders[courseId] = {
    courseId,
    courseTitle,
    remindAt,
    notified: false,
  };
  writeState(state);
  scheduleAllReminders();

  return {
    ok: true,
    message:
      option === "1h"
        ? "Reminder set for 1 hour from now."
        : "Reminder set for tomorrow morning.",
  };
}

export function getCourseReminderOption(courseId: string): ReminderOption {
  const state = readState();
  const reminder = state.reminders[courseId];
  if (!reminder || reminder.notified) {
    return "none";
  }

  const diff = reminder.remindAt - Date.now();
  if (diff <= 0) {
    return "none";
  }

  return diff <= 60 * 60 * 1000 + 5000 ? "1h" : "tomorrow";
}

export function initializeReminderScheduler() {
  scheduleAllReminders();
}
