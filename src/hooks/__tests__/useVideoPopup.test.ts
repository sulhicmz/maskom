import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useVideoPopup } from '../useVideoPopup';

jest.mock('react-modal-video', () => {
  return {
    __esModule: true,
    default: jest.fn(() => null)
  };
});

jest.mock('react-modal-video/scss/modal-video.scss', () => ({}));

jest.mock('@/modals/VideoPopup', () => {
  return {
    __esModule: true,
    default: jest.fn(() => React.createElement('div', { 'data-testid': 'video-popup' }, 'Video Popup Mock'))
  };
});

describe('useVideoPopup', () => {
  describe('Default Behavior', () => {
    it('should initialize with isVideoOpen set to false', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      expect(result.current.isVideoOpen).toBe(false);
    });

    it('should return correct interface', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      expect(result.current.isVideoOpen).toBeDefined();
      expect(result.current.openVideo).toBeDefined();
      expect(result.current.closeVideo).toBeDefined();
      expect(result.current.VideoPopupComponent).toBeDefined();
      expect(typeof result.current.openVideo).toBe('function');
      expect(typeof result.current.closeVideo).toBe('function');
      expect(typeof result.current.VideoPopupComponent).toBe('object');
    });
  });

  describe('State Management', () => {
    it('should set isVideoOpen to true when openVideo is called', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(true);
    });

    it('should set isVideoOpen to false when closeVideo is called', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(true);
      
      act(() => {
        result.current.closeVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(false);
    });

    it('should handle multiple open and close cycles', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
      
      act(() => {
        result.current.closeVideo();
      });
      expect(result.current.isVideoOpen).toBe(false);
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
      
      act(() => {
        result.current.closeVideo();
      });
      expect(result.current.isVideoOpen).toBe(false);
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
    });

    it('should remain closed when closeVideo is called on closed state', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      expect(result.current.isVideoOpen).toBe(false);
      
      act(() => {
        result.current.closeVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(false);
    });

    it('should remain open when openVideo is called on open state', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
      
      act(() => {
        result.current.openVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(true);
    });
  });

  describe('VideoPopup Component', () => {
    it('should render VideoPopupComponent', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      const component = result.current.VideoPopupComponent;
      
      expect(component).toBeDefined();
      expect(component).toBeTruthy();
    });

    it('should create VideoPopupComponent with videoId prop', () => {
      const { result } = renderHook(() => useVideoPopup('Ml4XCF-JS0k'));
      
      act(() => {
        result.current.openVideo();
      });
      
      const component = result.current.VideoPopupComponent;
      expect(component).toBeDefined();
    });
  });

  describe('Video ID Handling', () => {
    it('should accept standard YouTube video ID', () => {
      const { result } = renderHook(() => useVideoPopup('Ml4XCF-JS0k'));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });

    it('should accept video ID with special characters', () => {
      const { result } = renderHook(() => useVideoPopup('video-id_123_ABC'));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });

    it('should accept numeric video ID', () => {
      const { result } = renderHook(() => useVideoPopup('123456789'));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });

    it('should accept short video ID', () => {
      const { result } = renderHook(() => useVideoPopup('abc'));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });

    it('should accept long video ID', () => {
      const { result } = renderHook(() => useVideoPopup('Ml4XCF-JS0k123456789'));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string videoId', () => {
      const { result } = renderHook(() => useVideoPopup(''));
      expect(result.current.isVideoOpen).toBe(false);
      expect(result.current.openVideo).toBeDefined();
    });

    it('should maintain state between re-renders', () => {
      const { result, rerender } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
      
      rerender();
      expect(result.current.isVideoOpen).toBe(true);
    });

    it('should handle multiple hooks with different videoIds', () => {
      const { result: hook1 } = renderHook(() => useVideoPopup('video-id-1'));
      const { result: hook2 } = renderHook(() => useVideoPopup('video-id-2'));
      
      expect(hook1.current.isVideoOpen).toBe(false);
      expect(hook2.current.isVideoOpen).toBe(false);
      
      act(() => {
        hook1.current.openVideo();
      });
      
      expect(hook1.current.isVideoOpen).toBe(true);
      expect(hook2.current.isVideoOpen).toBe(false);
      
      act(() => {
        hook2.current.openVideo();
      });
      
      expect(hook1.current.isVideoOpen).toBe(true);
      expect(hook2.current.isVideoOpen).toBe(true);
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should simulate typical user flow: open then close', () => {
      const { result } = renderHook(() => useVideoPopup('Ml4XCF-JS0k'));
      
      expect(result.current.isVideoOpen).toBe(false);
      
      act(() => {
        result.current.openVideo();
      });
      expect(result.current.isVideoOpen).toBe(true);
      
      act(() => {
        result.current.closeVideo();
      });
      expect(result.current.isVideoOpen).toBe(false);
    });

    it('should support rapid open/close calls', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        result.current.openVideo();
        result.current.closeVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(false);
      
      act(() => {
        result.current.openVideo();
        result.current.closeVideo();
        result.current.openVideo();
      });
      
      expect(result.current.isVideoOpen).toBe(true);
    });
  });

  describe('Integration with Components', () => {
    it('should work correctly when called from event handlers', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      const handleClick = () => {
        result.current.openVideo();
      };
      
      act(() => {
        handleClick();
      });
      
      expect(result.current.isVideoOpen).toBe(true);
    });

    it('should work correctly when called from setTimeout', () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      act(() => {
        setTimeout(() => {
          result.current.openVideo();
        }, 1000);
        jest.advanceTimersByTime(1000);
      });
      
      expect(result.current.isVideoOpen).toBe(true);
      
      jest.useRealTimers();
    });
  });

  describe('Type Safety', () => {
    it('should return UseVideoPopupReturn type', () => {
      const { result } = renderHook(() => useVideoPopup('test-video-id'));
      
      const { isVideoOpen, openVideo, closeVideo, VideoPopupComponent } = result.current;
      
      expect(typeof isVideoOpen).toBe('boolean');
      expect(typeof openVideo).toBe('function');
      expect(typeof closeVideo).toBe('function');
      expect(typeof VideoPopupComponent).toBe('object');
    });
  });
});
