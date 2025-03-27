import { useEffect, useRef, useState } from "react";

export const useCountdown = (initialTime: number) => {
  const [countdown, setCountdown] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);

  const startCountdown = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdown = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setCountdown(initialTime);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { countdown, startCountdown, resetCountdown };
};
