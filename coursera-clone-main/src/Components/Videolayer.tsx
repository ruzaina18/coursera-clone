import React, { useEffect, useMemo, useRef, useState } from "react";

type VideoLayerProps = {
  videoId: string;
  title: string;
  resumeKey?: string;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
};

type YTNamespace = {
  Player: new (
    elementId: string,
    config: {
      videoId: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: (event: { target: YouTubePlayer }) => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const VIDEO_PROGRESS_PREFIX = "video-progress-v1";

function extractYoutubeVideoId(value: string) {
  const raw = value.trim();
  if (!raw) {
    return "";
  }

  if (!raw.includes("http")) {
    return raw.split("?")[0];
  }

  try {
    const parsed = new URL(raw);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0];
    }
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("?")[0] || "";
    }
    return parsed.searchParams.get("v") || "";
  } catch {
    return raw.split("?")[0];
  }
}

function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

const Videolayer = ({ videoId, title, resumeKey }: VideoLayerProps) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const [canResume, setCanResume] = useState(false);
  const [savedSeconds, setSavedSeconds] = useState(0);
  const safeVideoId = useMemo(() => extractYoutubeVideoId(videoId), [videoId]);
  const progressKey = `${VIDEO_PROGRESS_PREFIX}-${
    resumeKey || safeVideoId || "unknown"
  }`;
  const containerId = useMemo(
    () =>
      `yt-player-${(resumeKey || safeVideoId || "video")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 50)}`,
    [resumeKey, safeVideoId]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const readSavedProgress = () => {
      try {
        const raw = window.localStorage.getItem(progressKey);
        const parsed = raw ? Number(raw) : 0;
        if (!Number.isNaN(parsed) && parsed > 5) {
          setSavedSeconds(parsed);
          setCanResume(true);
          return parsed;
        }
      } catch {
        // ignore localStorage parsing errors
      }
      setSavedSeconds(0);
      setCanResume(false);
      return 0;
    };

    const saveProgress = () => {
      if (!playerRef.current) {
        return;
      }
      try {
        const current = Math.floor(playerRef.current.getCurrentTime() || 0);
        if (current > 0) {
          window.localStorage.setItem(progressKey, String(current));
          setSavedSeconds(current);
          setCanResume(current > 5);
        }
      } catch {
        // ignore write errors
      }
    };

    const clearProgress = () => {
      try {
        window.localStorage.removeItem(progressKey);
      } catch {
        // ignore remove errors
      }
      setSavedSeconds(0);
      setCanResume(false);
    };

    const createPlayer = () => {
      if (!window.YT?.Player || !safeVideoId) {
        return;
      }

      const initialSeconds = readSavedProgress();
      playerRef.current = new window.YT.Player(containerId, {
        videoId: safeVideoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (initialSeconds > 5) {
              event.target.seekTo(initialSeconds, true);
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            const endedState = 0;
            const pausedState = 2;
            if (event.data === pausedState) {
              saveProgress();
            }
            if (event.data === endedState) {
              clearProgress();
            }
          },
        },
      });

      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
      syncIntervalRef.current = window.setInterval(saveProgress, 5000);
    };

    const ensureYoutubeApi = () => {
      if (window.YT?.Player) {
        createPlayer();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }

      const previousReadyHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReadyHandler === "function") {
          previousReadyHandler();
        }
        createPlayer();
      };
    };

    ensureYoutubeApi();

    const handleBeforeUnload = () => saveProgress();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerId, progressKey, safeVideoId]);

  const handleResumeWatching = () => {
    if (!playerRef.current || savedSeconds <= 0) {
      return;
    }
    playerRef.current.seekTo(savedSeconds, true);
    playerRef.current.playVideo();
  };

  if (!safeVideoId) {
    return null;
  }

  return (
    <div>
      {canResume && (
        <button
          type="button"
          onClick={handleResumeWatching}
          className="mb-3 px-4 py-2 bg-[#0056D2] text-white text-sm font-semibold rounded-sm hover:bg-blue-700 transition-colors"
        >
          Resume Watching ({formatSeconds(savedSeconds)})
        </button>
      )}
      <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
        <div id={containerId} className="w-full h-full" aria-label={title} />
      </div>
    </div>
  );
};

export default Videolayer;
