import { AUDIO_TRACKS } from '../data/moods';
import { EXAM_STUDY_VIDEO } from '../data/moodAssets';

let audio: HTMLAudioElement | null = null;
let currentSound = "silence";
let volume = 0.35;
let audioUnlocked = false;
let playToken = 0;

export function getSound(): string {
  return currentSound;
}

export function getVolume(): number {
  return volume;
}

function stopCurrentAudioInternal(): void {
  if (audio) {
    if (currentSound !== "silence") {
      console.log(`[AUDIO] stopping: ${currentSound}`);
    }
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
      audio.onerror = null;
      audio.oncanplay = null;
      audio.src = "";
      audio.load();
    } catch (e) {
      /* ignore */
    }
    audio = null;
  }
}

export function setSound(id: string): void {
  if (id === currentSound && audio) {
    audio.volume = volume;
    if (audio.paused) {
      const token = ++playToken;
      audio.play().catch((err) => {
        if (token === playToken) {
          console.log(`[AUDIO] play blocked by browser policy for ${id}. User gesture required.`);
        }
      });
    }
    return;
  }

  stopCurrentAudioInternal();

  currentSound = id;
  const token = ++playToken;

  if (!id || id === "silence") {
    console.log("[AUDIO] silence");
    return;
  }

  const url = AUDIO_TRACKS[id];
  if (!url) {
    console.warn(`[AUDIO] No track URL for sound: ${id}`);
    return;
  }

  console.log(`[AUDIO] starting: ${id}`);

  const a = new Audio(url);
  a.loop = true;
  a.volume = volume;

  if (id === "exam") {
    a.addEventListener(
      "error",
      () => {
        if (token !== playToken) return;
        if (!a.src.includes(EXAM_STUDY_VIDEO)) {
          console.log("[AUDIO] exam local failed, trying remote fallback");
          a.src = EXAM_STUDY_VIDEO;
          a.play().catch(() => {});
        }
      },
      { once: true }
    );
  }

  audio = a;

  a.play().catch((err) => {
    if (token === playToken) {
      console.log(`[AUDIO] play blocked by browser policy for ${id}. Interactivity required first.`);
    }
  });
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  if (audio) {
    audio.volume = volume;
  }
}

export function stopSound(): void {
  stopCurrentAudioInternal();
  currentSound = "silence";
  console.log("[AUDIO] silence");
}

export function initGestureUnlock(): void {
  if (audioUnlocked) return;

  const unlock = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;

    if (currentSound !== "silence" && audio && audio.paused) {
      audio.play().catch(() => {});
    }

    document.body.removeEventListener("click", unlock);
    document.body.removeEventListener("keydown", unlock);
  };

  document.body.addEventListener("click", unlock);
  document.body.addEventListener("keydown", unlock);
}

export function playAlarmNotification(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn("Could not play alarm", e);
  }
}
