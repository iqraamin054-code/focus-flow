import React, { useRef, useEffect } from 'react';
import { getMoodAssets } from '../data/moodAssets';

interface VideoBackdropProps {
  mood: string;
}

export const VideoBackdrop: React.FC<VideoBackdropProps> = ({ mood }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const activeSrcRef = useRef<string | null>(null);

  const { poster, video: videoUrl, videoRemote } = getMoodAssets(mood);

  useEffect(() => {
    const backdropImg = posterRef.current;
    if (backdropImg) {
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
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const showPoster = () => {
      if (backdropImg && poster) backdropImg.style.opacity = '1';
    };

    const hidePoster = () => {
      if (backdropImg) backdropImg.style.opacity = '0';
    };

    videoEl.classList.toggle('exam-video-drift', mood === 'exam');
    videoEl.style.filter = mood === 'noir' ? 'grayscale(1) contrast(1.05)' : '';

    if (videoUrl && activeSrcRef.current !== videoUrl) {
      activeSrcRef.current = videoUrl;
      videoEl.style.opacity = '0';
      videoEl.src = videoUrl;
      videoEl.load();

      const onReady = () => {
        videoEl.play().catch(() => showPoster());
        videoEl.style.opacity = '1';
        hidePoster();
      };

      const onError = () => {
        if (videoRemote && activeSrcRef.current !== videoRemote) {
          activeSrcRef.current = videoRemote;
          videoEl.src = videoRemote;
          videoEl.load();
          return;
        }
        videoEl.style.opacity = '0';
        showPoster();
      };

      videoEl.addEventListener('loadeddata', onReady, { once: true });
      videoEl.addEventListener('canplay', onReady, { once: true });
      videoEl.addEventListener('error', onError, { once: true });
    } else if (videoEl.readyState >= 2) {
      videoEl.style.opacity = '1';
      hidePoster();
    }
  }, [mood, poster, videoUrl, videoRemote]);

  // Compute backdrop overlay gradient based on theme
  let overlayGradient = "linear-gradient(180deg, rgba(8,6,4,0.45), rgba(8,6,4,0.78))";
  if (mood === "cyber") {
    overlayGradient = "linear-gradient(180deg, rgba(8,4,24,0.55), rgba(8,4,24,0.85))";
  } else if (mood === "noir") {
    overlayGradient = "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.85))";
  } else if (mood === "exam") {
    overlayGradient = "linear-gradient(180deg, rgba(26,24,20,0.35), rgba(26,24,20,0.72))";
  }

  return (
    <div id="mood-backdrop" className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-1000">
      <div
        ref={posterRef}
        id="mood-backdrop-image"
        className={`absolute inset-0 ${poster ? 'mood-pan' : mood === 'exam' ? 'exam-pan' : ''}`}
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease"
      />
      <div
        id="mood-backdrop-overlay"
        className="absolute inset-0"
        style={{ background: overlayGradient }}
      />
    </div>
  );
};
