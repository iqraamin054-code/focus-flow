import { Theme, AmbientSound } from '../types/focus';
import { EXAM_STUDY_LOCAL } from './moodAssets';

export const MOODS: Theme[] = [
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

export const SOUNDS: AmbientSound[] = [
  { id: "rain", label: "Rain" },
  { id: "cafe", label: "Café" },
  { id: "forest", label: "Forest" },
  { id: "lofi", label: "Lo-Fi" },
  { id: "fireplace", label: "Fireplace" },
  { id: "vinyl", label: "Vinyl" },
  { id: "exam", label: "Exam Room" },
  { id: "silence", label: "Silence" },
];

export const AUDIO_TRACKS: Record<string, string> = {
  rain:   "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/rain.mp3",
  cafe:   "https://raw.githubusercontent.com/gregoryjpark/ambient-factory/master/audio/talking.mp3",
  forest: "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/forest.mp3",
  lofi:   "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/lofi.mp3",
  fireplace: "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/campfire.mp3",
  vinyl:  "https://raw.githubusercontent.com/karthiknvd/noctune/master/sounds/vinyl.mp3",
  exam: EXAM_STUDY_LOCAL,
};

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
