import { useState } from 'react';
import dynamic from 'next/dynamic';

const VideoPopup = dynamic(() => import("@/modals/VideoPopup"), {
  ssr: false,
  loading: () => null
});

interface UseVideoPopupReturn {
  isVideoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
  VideoPopupComponent: JSX.Element;
}

export function useVideoPopup(videoId: string): UseVideoPopupReturn {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  const VideoPopupComponent = (
    <VideoPopup
      isVideoOpen={isVideoOpen}
      setIsVideoOpen={setIsVideoOpen}
      videoId={videoId}
    />
  );

  return {
    isVideoOpen,
    openVideo,
    closeVideo,
    VideoPopupComponent
  };
}
