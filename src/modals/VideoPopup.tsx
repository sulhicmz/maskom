import ModalVideo from "react-modal-video";

interface VideoPopupProps {
  isVideoOpen: boolean;
  setIsVideoOpen: (value: boolean) => void;
  videoId?: string;
}

const VideoPopup = ({
  isVideoOpen,
  setIsVideoOpen,
  videoId = "bgMEvrd2", 
}: VideoPopupProps) => {
  return (
    <>
      <ModalVideo
        channel="youtube"
        // autoplay
        isOpen={isVideoOpen}
        videoId={videoId}
        onClose={() => setIsVideoOpen(false)}
      />
    </>
  );
};

export default VideoPopup;

