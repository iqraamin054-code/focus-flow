import { EXAM_STUDY_LOCAL, EXAM_STUDY_VIDEO } from "./mood-assets.js";

// MOODS configuration
export const MOODS = [
  {
    id: "forest",
    name: "Misty Forest",
    tagline: "Pine, breeze, birdsong.",
    description: "Dawn light through tall pines, a soft chorus of birds, leaves drifting on the wind.",
    sound: "forest",
    swatches: ["#0f1a14", "#264a32", "#7aa67a", "#d8e6c8"],
  },
  {
    id: "rainy",
    name: "Rainy Library",
    tagline: "Cozy. Warm. Endless pages.",
    description: "Brass lamps, mahogany shelves, and a soft drizzle on the window.",
    sound: "rain",
    swatches: ["#3a2a1a", "#8a6a44", "#d4b58a", "#f4e8d4"],
  },
  {
    id: "cafe",
    name: "Café Focus",
    tagline: "Espresso steam and quiet chatter.",
    description: "Warm timber, the hiss of an espresso machine, paper-thin daylight.",
    sound: "cafe",
    swatches: ["#2a1d12", "#7a4a2a", "#c08a5a", "#f0d8b8"],
  },
  {
    id: "cyber",
    name: "Cyber Night",
    tagline: "Neon rain on glass towers.",
    description: "Magenta haze, scanlines, and the hum of a sleepless megacity.",
    sound: "lofi",
    swatches: ["#0a0420", "#3a1a6a", "#c040ff", "#40e0ff"],
  },
  {
    id: "noir",
    name: "Noir Study",
    tagline: "Black, white, and ink.",
    description: "Cinematic monochrome with film grain and long shadows.",
    sound: "fireplace",
    swatches: ["#000000", "#2a2a2a", "#cfcfcf", "#ffffff"],
  },
  {
    id: "exam",
    name: "Exam Mode",
    tagline: "Quiet desk. Soft light. Deep focus.",
    description: "A warm study room with gentle ambient light — calm motion, clear mind.",
    sound: "exam",
    swatches: ["#1a1814", "#3d3529", "#c4a574", "#f5efe6"],
  },
];

// SOUNDS configuration
export const SOUNDS = [
  { id: "rain", label: "Rain" },
  { id: "cafe", label: "Café" },
  { id: "forest", label: "Forest" },
  { id: "lofi", label: "Lo-Fi" },
  { id: "fireplace", label: "Fireplace" },
  { id: "vinyl", label: "Vinyl" },
  { id: "exam", label: "Exam Room" },
  { id: "silence", label: "Silence" },
];

const AUDIO_TRACKS = {
  rain:   "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/rain.mp3",
  cafe:   "https://raw.githubusercontent.com/gregoryjpark/ambient-factory/master/audio/talking.mp3",
  forest: "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/forest.mp3",
  lofi:   "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/lofi.mp3",
  fireplace: "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/campfire.mp3",
  vinyl:  "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/vinyl.mp3",
  exam: EXAM_STUDY_LOCAL,
};

// --- Ambient Audio Controller ---
let audio = null;
let currentSound = "silence";
let volume = 0.35;

export function getSound() {
  return currentSound;
}

export function setSound(id) {
  if (id === currentSound && audio) {
    audio.volume = volume;
    if (audio.paused) {
      audio.play().catch(() => {
        console.log("Audio play blocked by browser policy. Interactivity required first.");
      });
    }
    return;
  }

  if (audio) {
    try {
      audio.pause();
    } catch (e) {
      /* ignore */
    }
    audio.src = "";
    audio = null;
  }
  currentSound = id;
  if (id === "silence") return;
  const url = AUDIO_TRACKS[id];
  if (!url) return;

  const a = new Audio(url);
  a.loop = true;
  a.volume = volume;
  if (id === "exam") {
    a.addEventListener("error", () => {
      if (!a.src.includes(EXAM_STUDY_VIDEO)) {
        a.src = EXAM_STUDY_VIDEO;
        a.play().catch(() => {});
      }
    }, { once: true });
  }
  a.play().catch(() => {
    console.log("Audio play blocked by browser policy. Interactivity required first.");
  });
  audio = a;
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (audio) {
    audio.volume = volume;
  }
}

export function stopSound() {
  if (audio) {
    try {
      audio.pause();
    } catch (e) {
      /* ignore */
    }
    audio.src = "";
    audio = null;
  }
  currentSound = "silence";
}

// --- State Store (LocalStorage Sync) ---
const STORAGE_KEY = "focusflow:v1";

const defaults = {
  mood: "rainy",
  sound: "rain",
  mission: "",
  tasks: [],
  stats: { sessions: 0, tasksDone: 0, focusSeconds: 0 },
  users: [],
  currentUser: null
};

let state = { ...defaults };
let listeners = [];

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...defaults,
        ...parsed,
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        users: parsed.users || [],
        currentUser: parsed.currentUser || null
      };
      const validSounds = new Set(SOUNDS.map(sound => sound.id));
      if (!validSounds.has(state.sound)) {
        state.sound = MOODS.find(mood => mood.id === state.mood)?.sound || defaults.sound;
      }
    }
  } catch (e) {
    state = { ...defaults };
  }
}

export function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
  notify();
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notify() {
  listeners.forEach(l => l(state));
}

// State modification functions
export const actions = {
  setMood(moodId) {
    state.mood = moodId;
    state.sound = MOODS.find(mood => mood.id === moodId)?.sound || defaults.sound;
    saveStore();
  },
  setSound(soundId) {
    state.sound = soundId;
    saveStore();
  },
  setMission(mission) {
    state.mission = mission;
    saveStore();
  },
  addTask(title) {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      done: false,
      createdAt: Date.now()
    };
    state.tasks = [newTask, ...state.tasks];
    saveStore();
  },
  toggleTask(id) {
    const prevTask = state.tasks.find(t => t.id === id);
    const wasDone = prevTask ? prevTask.done : false;
    
    state.tasks = state.tasks.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    );
    
    const isDoneNow = state.tasks.find(t => t.id === id)?.done;
    if (isDoneNow && !wasDone) {
      state.stats.tasksDone += 1;
    } else if (!isDoneNow && wasDone) {
      state.stats.tasksDone = Math.max(0, state.stats.tasksDone - 1);
    }
    saveStore();
  },
  removeTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveStore();
  },
  completeSession(seconds) {
    state.stats.sessions += 1;
    state.stats.focusSeconds += seconds;
    
    // Save current stats to logged in user too
    if (state.currentUser) {
      const email = state.currentUser.email;
      state.users = state.users.map(u => 
        u.email.toLowerCase() === email.toLowerCase() 
          ? { ...u, stats: state.stats }
          : u
      );
    }
    
    saveStore();
  },
  
  signUp(name, email, password) {
    if (!name || !email || !password) return { success: false, error: "Please fill in all fields." };
    
    const users = state.users || [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }
    
    const newUser = { name, email, password, stats: { sessions: 0, tasksDone: 0, focusSeconds: 0 }, tasks: [], mission: "" };
    state.users = [...users, newUser];
    state.currentUser = { name, email };
    
    state.stats = newUser.stats;
    state.tasks = newUser.tasks;
    state.mission = newUser.mission;
    
    saveStore();
    return { success: true };
  },
  
  login(email, password) {
    if (!email || !password) return { success: false, error: "Please fill in all fields." };
    
    const users = state.users || [];
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
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
  
  logout() {
    if (state.currentUser) {
      const email = state.currentUser.email;
      state.users = state.users.map(u => 
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
  }
};

// --- Motivational Quotes Pool ---
export const MOTIVATIONAL_QUOTES = [
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Quiet study desk, clear mind, infinite horizons.", author: "FocusFlow" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Deep work is not a chore, it is a state of grace.", author: "FocusFlow" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Study while others are sleeping.", author: "William James" },
  { text: "The best time to plant a tree was 20 years ago.", author: "Chinese Proverb" },
  { text: "Small steps lead to big results.", author: "FocusFlow" },
];

// --- Helper Functions ---
export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function getMotivationalGreeting(currentState) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayName = days[new Date().getDay()];
  const name = currentState.currentUser ? currentState.currentUser.name : "student";
  const h = new Date().getHours();

  if (h < 5) return `Still going, ${name}! Making this ${dayName} count.`;
  if (h < 12) return `Good morning, ${name}. Let's own ${dayName}.`;
  if (h < 17) return `Good afternoon, ${name}. Keep pushing through ${dayName}.`;
  if (h < 21) return `Good evening, ${name}. ${dayName}'s not done yet.`;
  return `Good night, ${name}. Late hours build deep focus.`;
}

// --- 3D Tilt Effect Registration ---
export function init3DTilt() {
  const elements = document.querySelectorAll('.tilt-3d');
  elements.forEach(el => {
    const intensity = parseFloat(el.getAttribute('data-intensity') || '12');
    const inner = el.querySelector('.tilt-3d-inner');
    if (!inner) return;

    // Apply standard perspective style
    el.style.perspective = '1200px';
    inner.style.transformStyle = 'preserve-3d';
    inner.style.transition = 'transform 150ms ease-out';

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      const rx = -y * intensity;
      const ry = x * intensity;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const onLeave = () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}
