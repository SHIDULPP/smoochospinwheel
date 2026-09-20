import { useState } from "react";
import styles from "./ProductImage.module.css";

const FALLBACK = "/images/placeholders/product-fallback.png";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? FALLBACK : src;

  return (
    <img
      src={resolved}
      alt={alt}
      className={`${styles.image} ${className ?? ""}`}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
