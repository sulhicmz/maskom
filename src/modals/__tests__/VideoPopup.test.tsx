import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import VideoPopup from "../VideoPopup";

jest.mock("react-modal-video", () => {
  return function MockModalVideo({ isOpen, videoId, onClose }: { isOpen: boolean; videoId: string; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="modal-video">
        <span>Video ID: {videoId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

describe("VideoPopup Component", () => {
  describe("Rendering", () => {
    it("renders ModalVideo when isVideoOpen is true", async () => {
      render(
        <VideoPopup
          isVideoOpen={true}
          setIsVideoOpen={() => {}}
          videoId="testVideo123"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-video")).toBeInTheDocument();
      });
      expect(screen.getByText("Video ID: testVideo123")).toBeInTheDocument();
    });

    it("does not render ModalVideo when isVideoOpen is false", async () => {
      render(
        <VideoPopup
          isVideoOpen={false}
          setIsVideoOpen={() => {}}
          videoId="testVideo123"
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId("modal-video")).not.toBeInTheDocument();
      });
    });

    it("uses default videoId when not provided", async () => {
      render(
        <VideoPopup
          isVideoOpen={true}
          setIsVideoOpen={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Video ID: bgMEvrd2")).toBeInTheDocument();
      });
    });

    it("uses provided videoId when specified", async () => {
      render(
        <VideoPopup
          isVideoOpen={true}
          setIsVideoOpen={() => {}}
          videoId="customVideoId"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Video ID: customVideoId")).toBeInTheDocument();
      });
    });
  });

  describe("ModalVideo Props", () => {
    it("passes correct isOpen prop to ModalVideo", async () => {
      const { rerender } = render(
        <VideoPopup
          isVideoOpen={false}
          setIsVideoOpen={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId("modal-video")).not.toBeInTheDocument();
      });

      rerender(
        <VideoPopup
          isVideoOpen={true}
          setIsVideoOpen={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-video")).toBeInTheDocument();
      });
    });

    it("passes correct onClose handler to ModalVideo", async () => {
      const setIsVideoOpenMock = jest.fn();

      render(
        <VideoPopup
          isVideoOpen={true}
          setIsVideoOpen={setIsVideoOpenMock}
        />
      );

      await waitFor(() => {
        const closeButton = screen.getByText("Close");
        closeButton.click();
      });

      expect(setIsVideoOpenMock).toHaveBeenCalledWith(false);
    });
  });
});
