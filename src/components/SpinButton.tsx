import styles from "./SpinButton.module.css";

interface SpinButtonProps {
  spinning: boolean;
  disabled: boolean;
  onSpin: () => void;
  label?: string;
}

export function SpinButton({
  spinning,
  disabled,
  onSpin,
  label = "SPIN NOW",
}: SpinButtonProps) {
  const isDisabled = disabled || spinning;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onSpin}
      disabled={isDisabled}
      aria-busy={spinning}
      aria-label={spinning ? "Wheel is spinning" : label}
    >
      {spinning ? "SPINNING..." : label}
    </button>
  );
}
