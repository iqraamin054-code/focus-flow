import {
  MOODS,
  SOUNDS,
  getState,
  loadStore,
  subscribe,
  actions,
  setSound,
  setVolume,
  stopSound,
  init3DTilt,
  getMotivationalGreeting,
  MOTIVATIONAL_QUOTES,
} from './app.js';
import { getMoodAssets } from './mood-assets.js';

// Global Timer Variables
const PRESETS = [
  { label: "Focus", seconds: 25 * 60 },
  { label: "Deep", seconds: 50 * 60 },
  { label: "Break", seconds: 5 * 60 },
];
let currentPresetIndex = 0;
let timerSecondsRemaining = PRESETS[0].seconds;
let timerInterval = null;
let timerRunning = false;

// Audio context gesture unlock flag
let audioUnlocked = false;

// Start initialization on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  loadStore();
  
  // Sync initial variables
  const state = getState();
  timerSecondsRemaining = PRESETS[currentPresetIndex].seconds;

  // Initialize UI features
  initClock();
  initMissionEditor();
  initPomodoroTimer();
  initTasksManager();
  initSoundController();
  initMoodSwitcher();
  initGestureUnlock();
  init3DTilt();
  initFloatingPanels();
  initAuthFormController();

  // Subscribe to store updates to keep UI in sync
  subscribe(updateUI);

  // Start motivational quote rotation
  initQuoteRotator();

  // Run initial UI updates
  updateUI(state);
});

// Update Clock Widget with date, day, and time
function initClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const updateClock = () => {
    const now = new Date();
    const d = days[now.getDay()];
    const m = months[now.getMonth()];
    const date = now.getDate();
    const y = now.getFullYear();
    const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clockEl.innerHTML = `${d} · ${m} ${date}, ${y} · ${t}`;
  };
  
  updateClock();
  setInterval(updateClock, 60000);
}

// Inline Mission Edit Fields
function initMissionEditor() {
  const wrapper = document.getElementById('mission-wrapper');
  const textView = document.getElementById('mission-text-view');
  const inputView = document.getElementById('mission-input-view');
  const input = document.getElementById('mission-input');
  
  if (!wrapper || !textView || !inputView || !input) return;

  textView.addEventListener('click', () => {
    const state = getState();
    input.value = state.mission;
    textView.classList.add('hidden');
    inputView.classList.remove('hidden');
    input.focus();
  });

  const saveMission = () => {
    const value = input.value.trim();
    actions.setMission(value);
    inputView.classList.add('hidden');
    textView.classList.remove('hidden');
  };

  input.addEventListener('blur', saveMission);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveMission();
    }
  });
}

// Pomodoro Timer Logic
function initPomodoroTimer() {
  const presetBtns = [
    document.getElementById('preset-0'),
    document.getElementById('preset-1'),
    document.getElementById('preset-2')
  ];
  const toggleBtn = document.getElementById('timer-toggle-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const giantTimer = document.getElementById('giant-timer-container');

  presetBtns.forEach((btn, index) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      selectPreset(index);
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (timerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetTimer();
    });
  }

  if (giantTimer) {
    giantTimer.addEventListener('click', () => {
      if (timerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }
}

function selectPreset(index) {
  currentPresetIndex = index;
  pauseTimer();
  timerSecondsRemaining = PRESETS[index].seconds;
  
  // Highlight active preset button
  const presetBtns = [
    document.getElementById('preset-0'),
    document.getElementById('preset-1'),
    document.getElementById('preset-2')
  ];
  presetBtns.forEach((btn, idx) => {
    if (!btn) return;
    if (idx === index) {
      btn.className = "preset-btn py-2.5 rounded-xl text-sm font-semibold transition border border-primary bg-primary text-primary-foreground";
    } else {
      btn.className = "preset-btn py-2.5 rounded-xl text-sm font-semibold transition border border-border bg-secondary/35 text-foreground hover:border-primary/50";
    }
  });

  updateTimerUI();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  
  const state = getState();
  const toggleBtn = document.getElementById('timer-toggle-btn');
  const statusEl = document.getElementById('timer-status');
  
  if (toggleBtn) toggleBtn.textContent = "Pause";
  if (statusEl) statusEl.textContent = "Focusing";

  // If timer was completed, restart from total preset duration
  if (timerSecondsRemaining === 0) {
    timerSecondsRemaining = PRESETS[currentPresetIndex].seconds;
  }

  timerInterval = setInterval(() => {
    if (timerSecondsRemaining <= 1) {
      timerSecondsRemaining = 0;
      clearInterval(timerInterval);
      timerRunning = false;
      
      // Trigger completed session
      actions.completeSession(PRESETS[currentPresetIndex].seconds);
      
      // Play bell/notif alert if sound is unlocked
      playAlarmNotification();
      
      if (toggleBtn) toggleBtn.textContent = "Restart";
      if (statusEl) statusEl.textContent = "Session complete";
      
      updateTimerUI();
    } else {
      timerSecondsRemaining--;
      updateTimerUI();
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerInterval);
  
  const toggleBtn = document.getElementById('timer-toggle-btn');
  const statusEl = document.getElementById('timer-status');
  if (toggleBtn) toggleBtn.textContent = "Start";
  if (statusEl) statusEl.textContent = "Paused";
}

function resetTimer() {
  pauseTimer();
  timerSecondsRemaining = PRESETS[currentPresetIndex].seconds;
  
  const statusEl = document.getElementById('timer-status');
  if (statusEl) statusEl.textContent = "Ready";
  
  updateTimerUI();
}

function updateTimerUI() {
  const countEl = document.getElementById('timer-countdown');
  const ringEl = document.getElementById('timer-progress-ring');
  
  if (!countEl) return;

  const min = Math.floor(timerSecondsRemaining / 60).toString().padStart(2, "0");
  const sec = (timerSecondsRemaining % 60).toString().padStart(2, "0");
  countEl.textContent = `${min}:${sec}`;

  // Update SVG Progress ring
  if (ringEl) {
    const total = PRESETS[currentPresetIndex].seconds;
    const pct = 1 - (timerSecondsRemaining / total);
    // Circumference = 2 * PI * r = 2 * PI * 90 = 565.48
    const circumference = 565.48;
    const offset = (1 - pct) * circumference;
    ringEl.style.strokeDashoffset = offset;
  }
}

// Alarm on Pomodoro completion
function playAlarmNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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

// Tasks manager checklist UI bindings
function initTasksManager() {
  const input = document.getElementById('task-input');
  const addBtn = document.getElementById('task-add-btn');
  
  if (!input || !addBtn) return;

  const submit = () => {
    const title = input.value.trim();
    if (title) {
      actions.addTask(title);
      input.value = "";
    }
  };

  addBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  });
}

function renderTasks(tasks) {
  const listEl = document.getElementById('tasks-list');
  const fracEl = document.getElementById('tasks-fraction');
  if (!listEl || !fracEl) return;

  listEl.innerHTML = "";
  
  const doneCount = tasks.filter(t => t.done).length;
  fracEl.textContent = `${doneCount}/${tasks.length}`;

  if (tasks.length === 0) {
    listEl.innerHTML = `
      <li class="text-sm text-muted-foreground italic text-center py-6">
        Quiet here. Add your first task.
      </li>
    `;
    return;
  }

  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition group animate-[fade-in-up_0.2s_ease-out]";
    
    // Checkbox button
    const checkBtn = document.createElement('button');
    checkBtn.className = `h-5 w-5 rounded-md border-2 grid place-items-center transition ${
      t.done ? "bg-primary border-primary" : "border-border hover:border-primary"
    }`;
    checkBtn.innerHTML = t.done ? `<span class="text-primary-foreground text-xs font-bold">✓</span>` : "";
    checkBtn.addEventListener('click', () => actions.toggleTask(t.id));

    // Label
    const span = document.createElement('span');
    span.className = `flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`;
    span.textContent = t.title;

    // Delete cross button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = "opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition px-1";
    deleteBtn.innerHTML = "✕";
    deleteBtn.addEventListener('click', () => actions.removeTask(t.id));

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });
}

// Poster image mapping for visual sound cards
const SOUND_POSTER_MAP = {
  rain: "/assets/posters/bg-rainy.jpg",
  cafe: "/assets/posters/bg-cafe.jpg",
  forest: "/assets/posters/bg-forest.jpg",
  lofi: "/assets/posters/bg-cyber.jpg",
  fireplace: "/assets/posters/bg-noir.jpg",
};

const SOUND_GRADIENT_MAP = {
  vinyl: "linear-gradient(135deg, #2a2a2a, #555555, #888888)",
  exam: "linear-gradient(135deg, #1a1814, #3d3529, #c4a574)",
  silence: "linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)",
};

const SOUND_ICON_MAP = {
  rain: "🌧️",
  cafe: "☕",
  forest: "🌲",
  lofi: "🎧",
  fireplace: "🔥",
  vinyl: "💿",
  exam: "📖",
  silence: "🔇",
};

// Visual vinyl-style sound card selector
function initSoundController() {
  const container = document.getElementById('sound-buttons-container');
  const volumeSlider = document.getElementById('volume-slider');

  if (container) {
    container.innerHTML = '';
    SOUNDS.forEach(({ id, label }) => {
      const wrapper = document.createElement('div');
      wrapper.className = "sound-vinyl-wrapper";
      wrapper.setAttribute('data-sound', id);

      const sleeve = document.createElement('div');
      sleeve.className = "sound-sleeve";
      const poster = SOUND_POSTER_MAP[id];
      const gradient = SOUND_GRADIENT_MAP[id];
      if (poster) {
        sleeve.style.backgroundImage = `url(${poster})`;
      } else if (gradient) {
        sleeve.style.background = gradient;
      } else {
        sleeve.style.background = "linear-gradient(135deg, #1a1a2e, #16213e)";
      }

      const content = document.createElement('div');
      content.className = "sound-sleeve-content";
      const iconSpan = document.createElement('span');
      iconSpan.className = "sound-label-icon";
      iconSpan.textContent = SOUND_ICON_MAP[id] || "🎵";
      const nameSpan = document.createElement('span');
      nameSpan.className = "sound-label";
      nameSpan.textContent = label;
      content.appendChild(iconSpan);
      content.appendChild(nameSpan);
      sleeve.appendChild(content);

      const disc = document.createElement('div');
      disc.className = "sound-vinyl-disc";
      const labelEl = document.createElement('div');
      labelEl.className = "sound-vinyl-label";
      disc.appendChild(labelEl);

      wrapper.appendChild(sleeve);
      wrapper.appendChild(disc);

      wrapper.addEventListener('click', () => actions.setSound(id));
      container.appendChild(wrapper);
    });
  }

  if (volumeSlider) {
    const volVal = document.getElementById('volume-val');
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (volVal) {
        volVal.textContent = `${Math.round(val * 100)}%`;
      }
    });
  }
}

function updateSoundUI(activeSound) {
  document.querySelectorAll('.sound-vinyl-wrapper').forEach(w => {
    const id = w.getAttribute('data-sound');
    w.classList.toggle('active', id === activeSound);
  });
  setSound(activeSound);
}

// Dynamic study moods cards construction
function initMoodSwitcher() {
  const container = document.getElementById('mood-selector-container');
  if (!container) return;

  container.innerHTML = "";

  MOODS.forEach(mood => {
    const wrapper = document.createElement('div');
    wrapper.className = "vinyl-card-wrapper";
    wrapper.setAttribute('data-id', mood.id);

    const assets = getMoodAssets(mood.id);
    const sleeve = document.createElement('div');
    sleeve.className = "theme-sleeve";
    
    if (assets.poster) {
      sleeve.style.backgroundImage = `url(${assets.poster})`;
    } else {
      sleeve.style.background = `linear-gradient(135deg, ${mood.swatches[1] || '#000'}, ${mood.swatches[2] || '#fff'})`;
    }

    const content = document.createElement('div');
    content.className = "theme-sleeve-content";

    // Swatches
    const swatches = document.createElement('div');
    swatches.className = "flex gap-1 mb-2";
    mood.swatches.forEach(c => {
      const dot = document.createElement('span');
      dot.className = "h-2 w-2 rounded-full border border-white/20";
      dot.style.background = c;
      swatches.appendChild(dot);
    });

    const name = document.createElement('div');
    name.className = "font-display font-extrabold text-sm text-white drop-shadow";
    name.textContent = mood.name;

    const tagline = document.createElement('div');
    tagline.className = "text-[10px] text-white/80 mt-0.5 line-clamp-1 drop-shadow";
    tagline.textContent = mood.tagline;

    content.appendChild(swatches);
    content.appendChild(name);
    content.appendChild(tagline);
    sleeve.appendChild(content);

    // Vinyl Disc
    const disc = document.createElement('div');
    disc.className = "vinyl-disc";

    const label = document.createElement('div');
    label.className = "vinyl-label";
    label.style.backgroundColor = mood.swatches[2] || 'var(--color-primary)';

    disc.appendChild(label);

    wrapper.appendChild(sleeve);
    wrapper.appendChild(disc);

    wrapper.addEventListener('click', () => {
      actions.setMood(mood.id);
    });

    container.appendChild(wrapper);
  });
}

function updateMoodCardSwitcherUI(activeMood) {
  const wrappers = document.querySelectorAll('.vinyl-card-wrapper');
  wrappers.forEach(wrapper => {
    const id = wrapper.getAttribute('data-id');
    if (id === activeMood) {
      wrapper.classList.add('active');
    } else {
      wrapper.classList.remove('active');
    }
  });
}

// Particle effects layer triggers
function updateParticlesUI(mood) {
  const rain = document.getElementById('rain-layer');
  const scan = document.getElementById('cyber-scan');
  const grid = document.getElementById('cyber-grid');
  const steam = document.getElementById('cafe-steam');
  const fog = document.getElementById('forest-fog');
  const examGlow = document.getElementById('exam-glow');
  const examDust = document.getElementById('exam-dust');

  if (rain) rain.classList.add('hidden');
  if (scan) scan.classList.add('hidden');
  if (grid) grid.classList.add('hidden');
  if (steam) steam.classList.add('hidden');
  if (fog) fog.classList.add('hidden');
  if (examGlow) examGlow.classList.add('hidden');
  if (examDust) examDust.classList.add('hidden');

  if (mood === 'rainy' && rain) {
    rain.classList.remove('hidden');
    renderRain();
  } else if (mood === 'cyber') {
    if (scan) scan.classList.remove('hidden');
    if (grid) grid.classList.remove('hidden');
  } else if (mood === 'cafe' && steam) {
    steam.classList.remove('hidden');
    renderSteam();
  } else if (mood === 'forest' && fog) {
    fog.classList.remove('hidden');
  } else if (mood === 'exam') {
    if (examGlow) examGlow.classList.remove('hidden');
    if (examDust) {
      examDust.classList.remove('hidden');
      renderExamDust();
    }
  }
}

function renderRain() {
  const rainLayer = document.getElementById('rain-layer');
  if (!rainLayer) return;
  rainLayer.innerHTML = '';
  const dropCount = 60;
  for (let i = 0; i < dropCount; i++) {
    const span = document.createElement('span');
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDuration = `${0.6 + Math.random() * 1.2}s`;
    span.style.animationDelay = `${Math.random() * 2}s`;
    span.style.opacity = 0.2 + Math.random() * 0.4;
    rainLayer.appendChild(span);
  }
}

function renderSteam() {
  const steamLayer = document.getElementById('cafe-steam');
  if (!steamLayer) return;
  steamLayer.innerHTML = '';
  const puffCount = 5;
  for (let i = 0; i < puffCount; i++) {
    const span = document.createElement('span');
    span.style.left = `${10 + i * 18}%`;
    span.style.animationDuration = `${12 + Math.random() * 6}s`;
    span.style.animationDelay = `${i * 1.8}s`;
    steamLayer.appendChild(span);
  }
}

function renderExamDust() {
  const layer = document.getElementById('exam-dust');
  if (!layer) return;
  layer.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const mote = document.createElement('span');
    mote.style.left = `${Math.random() * 100}%`;
    mote.style.top = `${Math.random() * 100}%`;
    mote.style.animationDuration = `${8 + Math.random() * 14}s`;
    mote.style.animationDelay = `${Math.random() * 6}s`;
    mote.style.width = `${2 + Math.random() * 4}px`;
    mote.style.height = mote.style.width;
    mote.style.opacity = `${0.15 + Math.random() * 0.45}`;
    layer.appendChild(mote);
  }
}

// User-Gesture unlock for audio contexts
function initGestureUnlock() {
  const unlock = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    
    // Trigger replay of active sound
    const state = getState();
    if (state.sound !== 'silence') {
      setSound(state.sound);
    }

    document.body.removeEventListener('click', unlock);
    document.body.removeEventListener('keydown', unlock);
  };

  document.body.addEventListener('click', unlock);
  document.body.addEventListener('keydown', unlock);
}

// Unified render updates triggered by Store changes
function updateUI(state) {
  // 1. Sync data-mood on body
  document.body.dataset.mood = state.mood;

  // 2. Set custom vignette and grain class configurations
  const body = document.body;
  if (state.mood === "noir") {
    body.className = "relative min-h-screen overflow-x-hidden transition-all duration-700 cine-vignette cine-grain";
  } else if (state.mood === "exam") {
    body.className = "relative min-h-screen overflow-x-hidden transition-all duration-700 exam-mode";
  } else {
    body.className = "relative min-h-screen overflow-x-hidden transition-all duration-700 cine-vignette";
  }

  // 3. Set background poster and video backdrop
  updateVideoBackdrop(state.mood);

  // 4. Set backdrop gradient overlay
  const backdropOverlay = document.getElementById('mood-backdrop-overlay');
  if (backdropOverlay) {
    let overlay = "linear-gradient(180deg, rgba(8,6,4,0.45), rgba(8,6,4,0.78))";
    if (state.mood === "cyber") {
      overlay = "linear-gradient(180deg, rgba(8,4,24,0.55), rgba(8,4,24,0.85))";
    } else if (state.mood === "noir") {
      overlay = "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.85))";
    } else if (state.mood === "exam") {
      overlay = "linear-gradient(180deg, rgba(26,24,20,0.35), rgba(26,24,20,0.72))";
    }
    backdropOverlay.style.background = overlay;
  }

  // 5. Update particle layers
  updateParticlesUI(state.mood);

  // 6. Update greeting and active mood text header
  const greetingEl = document.getElementById('greeting-text');
  const motivationalGreetingEl = document.getElementById('motivational-greeting');
  if (greetingEl) {
    const activeMoodName = MOODS.find(m => m.id === state.mood)?.name || "Focus Mode";
    greetingEl.textContent = `Focus Mode — ${activeMoodName}`;
  }
  if (motivationalGreetingEl) {
    motivationalGreetingEl.textContent = getMotivationalGreeting(state);
  }

  // 7. Update editable mission view
  const missionHeading = document.getElementById('mission-heading');
  const missionSub = document.getElementById('mission-sub');
  if (missionHeading && missionSub) {
    if (state.mission) {
      missionHeading.textContent = state.mission;
      missionSub.textContent = "Today's mission · click to edit";
    } else {
      missionHeading.textContent = "What's the mission today?";
      missionSub.textContent = "Today's mission · click to edit";
    }
  }

  // 8. Update stats counters
  const statSessions = document.getElementById('stat-sessions');
  const statTasks = document.getElementById('stat-tasks');
  const statMinutes = document.getElementById('stat-minutes');
  if (statSessions) statSessions.textContent = state.stats.sessions;
  if (statTasks) statTasks.textContent = state.stats.tasksDone;
  if (statMinutes) statMinutes.textContent = Math.round(state.stats.focusSeconds / 60);

  // 9. Render tasks list
  renderTasks(state.tasks);

  // 10. Update active ambient sound buttons
  updateSoundUI(state.sound);

  // 11. Update active selector mood card highlights
  updateMoodCardSwitcherUI(state.mood);

  // 12. Update profile buttons and account panel views
  const profileContainer = document.getElementById('auth-profile-container');
  const signinContainer = document.getElementById('auth-signin-container');
  const signupContainer = document.getElementById('auth-signup-container');
  const topProfileBtn = document.getElementById('top-profile-btn');
  
  if (state.currentUser) {
    if (profileContainer) profileContainer.classList.remove('hidden');
    if (signinContainer) signinContainer.classList.add('hidden');
    if (signupContainer) signupContainer.classList.add('hidden');
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileInitial = document.getElementById('profile-initial');
    
    if (profileName) profileName.textContent = `Hello, ${state.currentUser.name}!`;
    if (profileEmail) profileEmail.textContent = state.currentUser.email;
    if (profileInitial) profileInitial.textContent = state.currentUser.name.charAt(0).toUpperCase();
    if (topProfileBtn) topProfileBtn.textContent = state.currentUser.name;
  } else {
    if (profileContainer) profileContainer.classList.add('hidden');
    if (signinContainer && signupContainer) {
      if (signupContainer.classList.contains('hidden')) {
        signinContainer.classList.remove('hidden');
      }
    }
    if (topProfileBtn) topProfileBtn.textContent = "Sign In";
  }
}

// Dynamic video backdrop — CDN video with animated poster fallback
function updateVideoBackdrop(mood) {
  const container = document.getElementById('mood-backdrop');
  const backdropImg = document.getElementById('mood-backdrop-image');
  if (!container) return;

  const { poster, video: videoUrl, videoRemote } = getMoodAssets(mood);

  if (backdropImg) {
    backdropImg.classList.toggle('mood-pan', !!poster);
    backdropImg.classList.toggle('exam-pan', mood === 'exam' && !poster);
    if (poster) {
      backdropImg.style.backgroundImage = `url(${poster})`;
      backdropImg.style.backgroundSize = 'cover';
      backdropImg.style.backgroundPosition = 'center';
      backdropImg.style.display = 'block';
      backdropImg.style.opacity = '1';
    } else {
      backdropImg.style.backgroundImage = '';
      backdropImg.style.display = mood === 'exam' ? 'none' : 'block';
    }
    backdropImg.style.transition = 'opacity 700ms ease';
  }

  let videoEl = container.querySelector('video');

  const showPoster = () => {
    if (backdropImg && poster) backdropImg.style.opacity = '1';
  };

  const hidePoster = () => {
    if (backdropImg) backdropImg.style.opacity = '0';
  };

  if (!videoUrl) {
    if (videoEl) {
      videoEl.style.opacity = '0';
      setTimeout(() => videoEl.remove(), 500);
    }
    showPoster();
    return;
  }

  if (!videoEl) {
    videoEl = document.createElement('video');
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';
    videoEl.className = "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease";
    container.insertBefore(videoEl, backdropImg?.nextSibling ?? null);
  }

  videoEl.classList.toggle('exam-video-drift', mood === 'exam');
  videoEl.style.filter = mood === 'noir' ? 'grayscale(1) contrast(1.05)' : '';

  if (videoEl.dataset.activeSrc !== videoUrl) {
    videoEl.dataset.activeSrc = videoUrl;
    videoEl.style.opacity = '0';
    videoEl.src = videoUrl;
    videoEl.load();

    const onReady = () => {
      videoEl.play().catch(() => showPoster());
      videoEl.style.opacity = '1';
      hidePoster();
    };

    videoEl.onerror = () => {
      if (videoRemote && videoEl.dataset.activeSrc !== videoRemote) {
        videoEl.dataset.activeSrc = videoRemote;
        videoEl.src = videoRemote;
        videoEl.load();
        return;
      }
      videoEl.style.opacity = '0';
      showPoster();
    };

    videoEl.addEventListener('loadeddata', onReady, { once: true });
    videoEl.addEventListener('canplay', onReady, { once: true });
  } else if (videoEl.readyState >= 2) {
    videoEl.style.opacity = '1';
    hidePoster();
  }
}

// Centered Modal Overlay Controller
function initFloatingPanels() {
  const closeAllModals = () => {
    document.querySelectorAll('.modal-wrapper').forEach(m => {
      m.classList.remove('active');
    });
    document.querySelectorAll('.dock-item').forEach(b => {
      if (b.id !== 'dock-btn-zen') b.classList.remove('text-primary', 'bg-primary/10');
    });
  };

  const toggleModal = (modalId, triggerBtn) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const isActive = modal.classList.contains('active');
    closeAllModals();
    if (!isActive) {
      modal.classList.add('active', 'modal-full');
      if (triggerBtn) triggerBtn.classList.add('text-primary', 'bg-primary/10');
    }
  };

  const modalConfigs = [
    { btnId: 'dock-btn-timer', modalId: 'modal-timer' },
    { btnId: 'dock-btn-themes', modalId: 'modal-themes' },
    { btnId: 'dock-btn-sounds', modalId: 'modal-sounds' },
    { btnId: 'dock-btn-tasks', modalId: 'modal-tasks' },
    { btnId: 'dock-btn-profile', modalId: 'modal-profile' },
    { btnId: 'top-profile-btn', modalId: 'modal-profile' },
  ];

  modalConfigs.forEach(({ btnId, modalId }) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal(modalId, btn);
      });
    }
  });

  document.querySelectorAll('.panel-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllModals();
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', closeAllModals);
  });

  const zenBtn = document.getElementById('dock-btn-zen');
  let zenActive = false;

  if (zenBtn) {
    zenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      zenActive = !zenActive;
      document.body.classList.toggle('zen-active', zenActive);
      closeAllModals();
      if (zenActive) {
        zenBtn.classList.add('text-primary', 'bg-primary/10');
      } else {
        zenBtn.classList.remove('text-primary', 'bg-primary/10');
      }
    });
  }
}

// Client-Side Profile Registration & Login Form Controller
function initAuthFormController() {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtn = document.getElementById('auth-logout-btn');
  
  const goToSignupBtn = document.getElementById('go-to-signup-btn');
  const goToSigninBtn = document.getElementById('go-to-signin-btn');
  
  const signinContainer = document.getElementById('auth-signin-container');
  const signupContainer = document.getElementById('auth-signup-container');
  
  if (goToSignupBtn && signinContainer && signupContainer) {
    goToSignupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      signinContainer.classList.add('hidden');
      signupContainer.classList.remove('hidden');
    });
  }
  
  if (goToSigninBtn && signinContainer && signupContainer) {
    goToSigninBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      signupContainer.classList.add('hidden');
      signinContainer.classList.remove('hidden');
    });
  }
  
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value;
      
      const res = actions.login(email, password);
      if (res && !res.success) {
        alert(res.error || "Login failed");
      } else {
        signinForm.reset();
        document.getElementById('modal-profile').classList.remove('active');
        document.getElementById('dock-btn-profile').classList.remove('text-primary', 'bg-primary/10');
      }
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      
      const res = actions.signUp(name, email, password);
      if (res && !res.success) {
        alert(res.error || "Registration failed");
      } else {
        signupForm.reset();
        signupContainer.classList.add('hidden');
        signinContainer.classList.remove('hidden');
        document.getElementById('modal-profile').classList.remove('active');
        document.getElementById('dock-btn-profile').classList.remove('text-primary', 'bg-primary/10');
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      actions.logout();
      document.getElementById('modal-profile').classList.remove('active');
      document.getElementById('dock-btn-profile').classList.remove('text-primary', 'bg-primary/10');
    });
  }
}

// Motivational Quote Rotator
function initQuoteRotator() {
  const el = document.getElementById('motivational-quote');
  if (!el) return;

  let wrapper = el.querySelector('.quote-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'quote-wrapper';
    el.appendChild(wrapper);
  }

  let index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);

  function showQuote(i) {
    const q = MOTIVATIONAL_QUOTES[i % MOTIVATIONAL_QUOTES.length];
    wrapper.innerHTML = `<span class="quote-text">"${q.text}"</span><span class="quote-author">— ${q.author}</span>`;
  }

  showQuote(index);

  setInterval(() => {
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(6px)';
    setTimeout(() => {
      index = (index + 1) % MOTIVATIONAL_QUOTES.length;
      showQuote(index);
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    }, 500);
  }, 10000);
}
