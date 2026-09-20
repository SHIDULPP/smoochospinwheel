import styles from "./DecorativeBg.module.css";

const shapes = [
  { type: "heart", className: styles.heart1 },
  { type: "star", className: styles.star1 },
  { type: "circle", className: styles.circle1 },
  { type: "heart", className: styles.heart2 },
  { type: "star", className: styles.star2 },
  { type: "circle", className: styles.circle2 },
  { type: "heart", className: styles.heart3 },
  { type: "star", className: styles.star3 },
  { type: "circle", className: styles.circle3 },
] as const;

export function DecorativeBg() {
  return (
    <div className={styles.root} aria-hidden="true">
      {shapes.map((shape, i) => (
        <span key={i} className={`${styles.shape} ${shape.className}`} data-shape={shape.type} />
      ))}
    </div>
  );
}
