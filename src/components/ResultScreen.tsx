import { useEffect, useMemo, useState } from "react";
import type { Prize } from "../config/prizes";
import { cafeConfig } from "../config/cafe";
import { ProductImage } from "./ProductImage";
import styles from "./ResultScreen.module.css";

interface ResultScreenProps {
  prize: Prize;
  celebrate?: boolean;
}

export function ResultScreen({ prize, celebrate = true }: ResultScreenProps) {
  const isMiss = prize.type === "other";
  const [showConfetti, setShowConfetti] = useState(celebrate && !isMiss);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 8) * 0.12}s`,
        duration: `${2.2 + (i % 5) * 0.25}s`,
        hue: i % 2 === 0 ? "#fff" : "#ff80ab",
      })),
    [],
  );

  useEffect(() => {
    if (!celebrate || isMiss) return;
    const t = window.setTimeout(() => setShowConfetti(false), 4500);
    return () => window.clearTimeout(t);
  }, [celebrate, isMiss]);

  return (
    <section
      className={styles.panel}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Spin result"
    >
      {showConfetti ? (
        <div className={styles.confetti} aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className={styles.particle}
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                background: p.hue,
              }}
            />
          ))}
        </div>
      ) : null}

      <p className={styles.eyebrow}>
        {isMiss ? "Almost!" : "You won!"}
      </p>

      {prize.type === "product" ? (
        <div className={styles.productWin}>
          <div className={styles.productFrame}>
            <ProductImage
              src={prize.image}
              alt={prize.name ?? prize.label}
            />
          </div>
          <h2 className={styles.prizeTitle}>
            {prize.name ? `FREE ${prize.name}` : `${prize.label} ITEM`}
          </h2>
        </div>
      ) : (
        <h2 className={styles.prizeTitle}>{prize.label}</h2>
      )}

      {!isMiss ? (
        <p className={styles.claim}>{cafeConfig.claimCopy}</p>
      ) : (
        <p className={styles.claim}>Thanks for playing — come back another day!</p>
      )}
    </section>
  );
}
