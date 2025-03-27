import { useThemeContext } from "../hooks/useTheme";

type CountdownProps = {
  countdown: number;
  reset: () => void;
};

const Countdown = ({ countdown, reset }: CountdownProps) => {
  const { systemTheme } = useThemeContext();

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="flex justify-end">
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: systemTheme.background.secondary,
        }}
      >
        <span
          className="text-right font-mono text-lg lg:text-xl"
          style={{
            color: systemTheme.text.secondary,
          }}
        >
          {minutes < 10 ? `0${minutes}` : minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}
        </span>
      </div>
    </div>
  );
};

export default Countdown;
