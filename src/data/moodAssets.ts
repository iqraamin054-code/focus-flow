import { MoodAsset } from '../types/focus';

export const EXAM_STUDY_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4";

export const EXAM_STUDY_LOCAL = "/assets/videos/bg-exam.mp4";

export const MOOD_ASSETS: Record<string, MoodAsset> = {
  forest: {
    poster: "/assets/posters/bg-forest.jpg",
    video: "/assets/videos/bg-forest.mp4",
  },
  rainy: {
    poster: "/assets/posters/bg-rainy.jpg",
    video: "/assets/videos/bg-rainy.mp4",
  },
  cafe: {
    poster: "/assets/posters/bg-cafe.jpg",
    video: "/assets/videos/bg-cafe.mp4",
  },
  cyber: {
    poster: "/assets/posters/bg-cyber.jpg",
    video: "/assets/videos/bg-cyber.mp4",
  },
  noir: {
    poster: "/assets/posters/bg-noir.jpg",
    video: "/assets/videos/bg-noir.mp4",
  },
  exam: {
    poster: null,
    video: EXAM_STUDY_LOCAL,
    videoRemote: EXAM_STUDY_VIDEO,
  },
};

export function getMoodAssets(moodId: string): MoodAsset {
  return MOOD_ASSETS[moodId] ?? MOOD_ASSETS.rainy;
}
