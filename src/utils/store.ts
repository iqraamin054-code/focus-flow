import { WorkspaceState, Task, User } from '../types/focus';
import { MOODS, SOUNDS } from '../data/moods';

const STORAGE_KEY = "focusflow:v1";

const defaults: WorkspaceState = {
  mood: "rainy",
  sound: "rain",
  mission: "",
  tasks: [],
  stats: { sessions: 0, tasksDone: 0, focusSeconds: 0 },
  users: [],
  currentUser: null,
};

let state: WorkspaceState = { ...defaults };
type Listener = (state: WorkspaceState) => void;
let listeners: Listener[] = [];

export function loadStore(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...defaults,
        ...parsed,
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        users: parsed.users || [],
        currentUser: parsed.currentUser || null,
      };
      const validSounds = new Set(SOUNDS.map((sound) => sound.id));
      if (!validSounds.has(state.sound)) {
        state.sound = MOODS.find((mood) => mood.id === state.mood)?.sound || defaults.sound;
      }
    }
  } catch (e) {
    console.error("Failed to load store from localStorage", e);
    state = { ...defaults };
  }
  return state;
}

export function saveStore(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
  notify();
}

export function getState(): WorkspaceState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify(): void {
  const currentState = { ...state };
  listeners.forEach((l) => l(currentState));
}

// Action functions
export const actions = {
  setMood(moodId: string): void {
    state.mood = moodId;
    state.sound = MOODS.find((mood) => mood.id === moodId)?.sound || defaults.sound;
    saveStore();
  },

  setSound(soundId: string): void {
    state.sound = soundId;
    saveStore();
  },

  setMission(mission: string): void {
    state.mission = mission;
    saveStore();
  },

  addTask(title: string): void {
    const newTask: Task = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title,
      done: false,
      createdAt: Date.now(),
    };
    state.tasks = [newTask, ...state.tasks];
    saveStore();
  },

  toggleTask(id: string): void {
    const prevTask = state.tasks.find((t) => t.id === id);
    const wasDone = prevTask ? prevTask.done : false;

    state.tasks = state.tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );

    const isDoneNow = state.tasks.find((t) => t.id === id)?.done;
    if (isDoneNow && !wasDone) {
      state.stats.tasksDone += 1;
    } else if (!isDoneNow && wasDone) {
      state.stats.tasksDone = Math.max(0, state.stats.tasksDone - 1);
    }
    saveStore();
  },

  removeTask(id: string): void {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveStore();
  },

  completeSession(seconds: number): void {
    state.stats.sessions += 1;
    state.stats.focusSeconds += seconds;

    if (state.currentUser) {
      const email = state.currentUser.email;
      state.users = state.users.map((u) =>
        u.email.toLowerCase() === email.toLowerCase()
          ? { ...u, stats: state.stats }
          : u
      );
    }

    saveStore();
  },

  signUp(name: string, email: string, password?: string): { success: boolean; error?: string } {
    if (!name || !email || !password) {
      return { success: false, error: "Please fill in all fields." };
    }

    const users = state.users || [];
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser: User = {
      name,
      email,
      password,
      stats: { sessions: 0, tasksDone: 0, focusSeconds: 0 },
      tasks: [],
      mission: "",
    };
    state.users = [...users, newUser];
    state.currentUser = { name, email };

    state.stats = newUser.stats;
    state.tasks = newUser.tasks;
    state.mission = newUser.mission;

    saveStore();
    return { success: true };
  },

  login(email: string, password?: string): { success: boolean; error?: string } {
    if (!email || !password) {
      return { success: false, error: "Please fill in all fields." };
    }

    const users = state.users || [];
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: "Invalid email or password." };
    }

    state.currentUser = { name: foundUser.name, email: foundUser.email };
    state.stats = foundUser.stats || { sessions: 0, tasksDone: 0, focusSeconds: 0 };
    state.tasks = foundUser.tasks || [];
    state.mission = foundUser.mission || "";

    saveStore();
    return { success: true };
  },

  logout(): void {
    if (state.currentUser) {
      const email = state.currentUser.email;
      state.users = state.users.map((u) =>
        u.email.toLowerCase() === email.toLowerCase()
          ? { ...u, stats: state.stats, tasks: state.tasks, mission: state.mission }
          : u
      );
    }

    state.currentUser = null;
    state.stats = { sessions: 0, tasksDone: 0, focusSeconds: 0 };
    state.tasks = [];
    state.mission = "";

    saveStore();
  },
};

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function getMotivationalGreeting(currentState: WorkspaceState): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[new Date().getDay()];
  const name = currentState.currentUser ? currentState.currentUser.name : "student";
  const h = new Date().getHours();

  if (h < 5) return `Still going, ${name}! Making this ${dayName} count.`;
  if (h < 12) return `Good morning, ${name}. Let's own ${dayName}.`;
  if (h < 17) return `Good afternoon, ${name}. Keep pushing through ${dayName}.`;
  if (h < 21) return `Good evening, ${name}. ${dayName}'s not done yet.`;
  return `Good night, ${name}. Late hours build deep focus.`;
}
