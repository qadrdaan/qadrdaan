import { useEffect, useState } from "react";

interface VideoWithWatermarkProps {
  src: string;
  poster?: string;
  creatorHandle: string;
  creatorId: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  uploadDate?: string | null;
}

/**
 * Renders a video with a creator-ID + timestamp watermark overlay.
 * The overlay is placed on TOP of the player, alternating corners every 4s
 * to discourage cropping.
 */
const VideoWithWatermark = ({
  src,
  poster,
  creatorHandle,
  creatorId,
  className = "w-full aspect-video",
  controls = true,
  autoPlay,
  muted,
  loop,
  playsInline,
  uploadDate,
}: VideoWithWatermarkProps) => {
  const [corner, setCorner] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCorner((c) => (c + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);

  const positions = [
    "top-3 left-3",
    "top-3 right-3",
    "bottom-12 right-3",
    "bottom-12 left-3",
  ];

  const ts = uploadDate
    ? new Date(uploadDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Short hash of creator id for tracking (8 chars)
  const idHash = creatorId.replace(/-/g, "").slice(0, 8).toUpperCase();

  return (
    <div className="relative">
      <video
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        className={className}
      />
      {/* Watermark overlay */}
      <div
        className={`pointer-events-none absolute ${positions[corner]} bg-black/40 backdrop-blur-sm rounded px-2 py-1 transition-all duration-700`}
      >
        <p className="text-[10px] font-bold text-white/95 leading-tight tracking-wider">
          @{creatorHandle || "qadrdaan"}
        </p>
        <p className="text-[9px] text-white/70 leading-tight font-mono">
          QD·{idHash}·{ts}
        </p>
      </div>
      {/* Center diagonal mark (very subtle, anti-screen-record) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-white/[0.04] text-2xl font-display font-bold rotate-[-30deg] select-none">
          qadrdaan.com · @{creatorHandle}
        </span>
      </div>
    </div>
  );
};

export default VideoWithWatermark;
