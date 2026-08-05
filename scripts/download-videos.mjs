/**
 * Downloads the exam study video to public/assets/videos/ using curl (Windows-friendly).
 * Other mood videos use CDN URLs directly; posters load from public/assets/posters/.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXAM_STUDY_VIDEO } from "../src/mood-assets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(__dirname, "../public/assets/videos/bg-exam.mp4");

fs.mkdirSync(path.dirname(dest), { recursive: true });

console.log("Downloading exam study video...");
execSync(`curl.exe -L -o "${dest}" "${EXAM_STUDY_VIDEO}"`, { stdio: "inherit" });
console.log(`Saved to ${dest}`);
