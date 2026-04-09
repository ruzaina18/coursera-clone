import type { Course } from "@/components/data/constant";

const OFFLINE_COURSES_KEY = "offline-courses-v1";
const OFFLINE_UPDATE_EVENT = "offline-courses-updated";
const DB_NAME = "coursera-offline-db";
const DB_VERSION = 1;
const IMAGES_STORE = "course-images";

export type OfflineCourseContent = {
  id: string;
  title: string;
  provider: string;
  type: string;
  image: string;
  rating: string;
  students: string;
  level: string;
  timeline: string;
  lastUpdated: string;
  languages: string[];
  price: {
    monthly: string;
    fullCourse: string;
  };
  description: string;
  tags: string[];
  skills: string[];
  modules: {
    title: string;
    duration: string;
    description: string;
    weeks: number;
    hours: number;
    projects: number;
    quizzes: number;
  }[];
  testimonials: {
    image: string;
    quote: string;
    author: string;
    role: string;
    company: string;
    impact: string;
  }[];
  careerOutcomes: {
    title: string;
    value: string;
  }[];
};

type OfflineCourseEntry = {
  savedAt: string;
  imageUrls: string[];
  content: OfflineCourseContent;
};

type OfflineCourseIndex = Record<string, OfflineCourseEntry>;

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function readOfflineIndex(): OfflineCourseIndex {
  if (!canUseBrowserStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(OFFLINE_COURSES_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as OfflineCourseIndex;
  } catch {
    return {};
  }
}

function writeOfflineIndex(next: OfflineCourseIndex) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(OFFLINE_UPDATE_EVENT, {
      detail: { ids: Object.keys(next) },
    })
  );
}

function sanitizeCourseForOffline(course: Course): OfflineCourseContent {
  return {
    id: course.id,
    title: course.title,
    provider: course.provider,
    type: course.type,
    image: course.image,
    rating: course.rating,
    students: course.students,
    level: course.level,
    timeline: course.timeline,
    lastUpdated: course.lastUpdated,
    languages: course.languages,
    price: course.price,
    description: course.description,
    tags: course.tags,
    skills: course.skills,
    modules: course.modules.map((module) => ({
      title: module.title,
      duration: module.duration,
      description: module.description,
      weeks: module.weeks,
      hours: module.hours,
      projects: module.projects,
      quizzes: module.quizzes,
    })),
    testimonials: course.testimonials.map((testimonial) => ({
      image: testimonial.image,
      quote: testimonial.quote,
      author: testimonial.author,
      role: testimonial.role,
      company: testimonial.company,
      impact: testimonial.impact,
    })),
    careerOutcomes: course.careerOutcomes.map((outcome) => ({
      title: outcome.title,
      value: outcome.value,
    })),
  };
}

function getCourseImageUrls(course: Course) {
  return Array.from(
    new Set([course.image, ...course.testimonials.map((item) => item.image)])
  );
}

function openDatabase() {
  if (!canUseBrowserStorage() || !("indexedDB" in window)) {
    return Promise.resolve<IDBDatabase | null>(null);
  }

  return new Promise<IDBDatabase | null>((resolve) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function saveImageToIndexedDb(url: string, blob: Blob) {
  const db = await openDatabase();
  if (!db) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const tx = db.transaction(IMAGES_STORE, "readwrite");
    tx.objectStore(IMAGES_STORE).put(blob, url);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

async function getImageFromIndexedDb(url: string) {
  const db = await openDatabase();
  if (!db) {
    return null;
  }

  return new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(IMAGES_STORE, "readonly");
    const request = tx.objectStore(IMAGES_STORE).get(url);
    request.onsuccess = () => resolve((request.result as Blob) || null);
    request.onerror = () => resolve(null);
  });
}

export function getOfflineUpdateEventName() {
  return OFFLINE_UPDATE_EVENT;
}

export function getOfflineCourseIds() {
  return Object.keys(readOfflineIndex());
}

export function isCourseAvailableOffline(courseId: string) {
  const index = readOfflineIndex();
  return Boolean(index[courseId]);
}

export function getOfflineCourseEntry(courseId: string) {
  const index = readOfflineIndex();
  return index[courseId] || null;
}

export async function saveCourseOffline(course: Course) {
  const imageUrls = getCourseImageUrls(course);
  const content = sanitizeCourseForOffline(course);

  let savedImages = 0;
  let failedImages = 0;

  for (const imageUrl of imageUrls) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        failedImages += 1;
        continue;
      }
      const blob = await response.blob();
      const stored = await saveImageToIndexedDb(imageUrl, blob);
      if (stored) {
        savedImages += 1;
      } else {
        failedImages += 1;
      }
    } catch {
      failedImages += 1;
    }
  }

  const index = readOfflineIndex();
  index[course.id] = {
    savedAt: new Date().toISOString(),
    imageUrls,
    content,
  };
  writeOfflineIndex(index);

  return { savedImages, failedImages };
}

export async function getOfflineImageObjectUrl(imageUrl: string) {
  const imageBlob = await getImageFromIndexedDb(imageUrl);
  if (!imageBlob) {
    return null;
  }
  return URL.createObjectURL(imageBlob);
}
