import { useRef, useCallback } from 'react';

/**
 * Throttle hook to prevent excessive function calls
 * Useful for scroll events to prevent re-renders
 */
export function useThrottle(callback, delay = 100) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

export default useThrottle;

