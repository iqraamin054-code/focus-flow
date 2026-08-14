export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export interface UserStats {
  sessions: number;
  tasksDone: number;
  focusSeconds: number;
}

export interface User {
  name: string;
  email: string;
  password?: string;
  stats: UserStats;
  tasks: Task[];
  mission: string;
}

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sound: string;
  swatches: string[];
}

export interface AmbientSound {
  id: string;
  label: string;
}

export interface WorkspaceState {
  mood: string;
  sound: string;
  mission: string;
  tasks: Task[];
  stats: UserStats;
  users: User[];
  currentUser: { name: string; email: string } | null;
}

export interface MoodAsset {
  poster: string | null;
  video: string | null;
  videoRemote?: string;
}

export interface TimerPreset {
  label: string;
  seconds: number;
}
