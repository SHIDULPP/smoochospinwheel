import type { Prize } from "../config/prizes";
import { SegmentContent } from "./SegmentContent";
import styles from "./Wheel.module.css";

interface WheelProps {
  prizes: Prize[];
  rotation: number;
  spinning: boolean;
  reducedMotion: boolean;
}

export function Wheel({ prizes, rotation, spinning, reducedMotion }: WheelProps) {
  const count = prizes.length;
  const slice = 360 / count;

  const gradient = prizes
    .map((prize, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      return `${prize.segmentColor} ${start}deg ${end}deg`;
    })
    .join(", ");

  const transition =
    spinning && !reducedMotion
      ? `transform var(--spin-duration) var(--spin-easing)`
      : "none";

  return (
    <div className={styles.wrap}>
      <div className={styles.pointer} aria-hidden="true">
        <svg viewBox="0 0 40 48" className={styles.pointerSvg} aria-hidden="true">
          <path
            d="M20 48 L4 8 Q20 0 36 8 Z"
            fill="#c2185b"
            stroke="#fff"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className={styles.rim}>
        <div
          className={styles.disk}
          style={{
            background: `conic-gradient(from 0deg, ${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition,
          }}
          role="img"
          aria-label="Lucky prize wheel"
        >
          {prizes.map((prize, i) => {
            const mid = i * slice + slice / 2;
            return (
              <div
                key={prize.id}
                className={styles.segment}
                style={{ transform: `rotate(${mid}deg)` }}
              >
                <div className={styles.segmentContent}>
                  <SegmentContent prize={prize} />
                </div>
              </div>
            );
          })}

          <div className={styles.hub} aria-hidden="true">
            <span className={styles.hubDot} />
          </div>
        </div>
      </div>
    </div>
  );
}
