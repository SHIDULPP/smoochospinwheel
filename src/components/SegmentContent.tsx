import type { Prize } from "../config/prizes";
import { ProductImage } from "./ProductImage";
import styles from "./SegmentContent.module.css";

interface SegmentContentProps {
  prize: Prize;
}

function splitOfferLabel(label: string): { primary: string; secondary: string } {
  const parts = label.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(" ") };
  }
  return { primary: label, secondary: "" };
}

export function SegmentContent({ prize }: SegmentContentProps) {
  if (prize.type === "product") {
    return (
      <div className={styles.product}>
        <div className={styles.productFrame}>
          <ProductImage src={prize.image} alt={prize.label} />
        </div>
        <span className={styles.badge} style={{ color: prize.textColor }}>
          {prize.label}
        </span>
      </div>
    );
  }

  if (prize.type === "other") {
    return (
      <div className={styles.other} style={{ color: prize.textColor }}>
        <span className={styles.otherText}>{prize.label}</span>
      </div>
    );
  }

  const { primary, secondary } = splitOfferLabel(prize.label);

  return (
    <div className={styles.offer} style={{ color: prize.textColor }}>
      <span className={styles.primary}>{primary}</span>
      {secondary ? <span className={styles.secondary}>{secondary}</span> : null}
    </div>
  );
}
