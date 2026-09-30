import { useCallback, useEffect, useRef, useState } from "react";
import { cafeConfig } from "../config/cafe";
import { prizes, type Prize } from "../config/prizes";
import { claimSpin, fetchSpinStatus } from "../lib/spinApi";
import { selectPrize } from "../lib/selectPrize";
import { getTargetRotation, prefersReducedMotion } from "../lib/spinMath";
import {
  getSavedPrize,
  hasSpun,
  isFirstTimeSpinner,
  markFirstSpinDone,
  saveSpinResult,
} from "../lib/spinStorage";
import { DecorativeBg } from "./DecorativeBg";
import { ResultScreen } from "./ResultScreen";
import { SpinButton } from "./SpinButton";
import { Wheel } from "./Wheel";
import styles from "./LuckySpinnerPage.module.css";

const SPIN_MS = 5000;

type Phase = "ready" | "spinning" | "result" | "blocked";

function prizeById(id: string | null): Prize | null {
  if (!id) return null;
  return prizes.find((p) => p.id === id) ?? null;
}

export function LuckySpinnerPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [freshWin, setFreshWin] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const spinningLock = useRef(false);
  const rotationRef = useRef(0);

  const limitsActive =
    cafeConfig.oneSpinPerBrowser || cafeConfig.oneSpinPerIp;
  const allowSpinAgain = !limitsActive;

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setReducedMotion(prefersReducedMotion());

      if (cafeConfig.oneSpinPerBrowser && hasSpun()) {
        const saved = getSavedPrize();
        if (saved && !cancelled) {
          setWinner(saved);
          setPhase("result");
          setFreshWin(false);
          setHydrated(true);
          return;
        }
      }

      if (cafeConfig.oneSpinPerIp) {
        try {
          const status = await fetchSpinStatus();
          if (cancelled) return;
          if (!status.allowed) {
            const prior = prizeById(status.prizeId);
            if (prior) {
              setWinner(prior);
              setPhase("result");
              setFreshWin(false);
            } else {
              setPhase("blocked");
              setStatusMessage(
                "This network already used today's spin. Come back tomorrow!",
              );
            }
            setHydrated(true);
            return;
          }
        } catch {
          if (!cancelled) {
            setStatusMessage(
              "Could not verify spin limit. You can still try — if it fails, refresh.",
            );
          }
        }
      }

      if (!cancelled) setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishSpin = useCallback(async (prize: Prize) => {
    markFirstSpinDone();

    if (cafeConfig.oneSpinPerIp) {
      try {
        const claim = await claimSpin({ id: prize.id, label: prize.label });
        if (!claim.allowed) {
          const prior = prizeById(claim.prizeId ?? null);
          setWinner(prior ?? prize);
          setFreshWin(false);
          setPhase("result");
            setStatusMessage("This network already spun today — showing today's result.");
          spinningLock.current = false;
          return;
        }
      } catch {
        setStatusMessage("Could not save IP spin limit. Prize still shown below.");
      }
    }

    if (cafeConfig.oneSpinPerBrowser) {
      saveSpinResult(prize);
    }

    setWinner(prize);
    setFreshWin(true);
    setPhase("result");
    spinningLock.current = false;
  }, []);

  const handleSpin = useCallback(() => {
    if (spinningLock.current || phase !== "ready") return;
    spinningLock.current = true;
    setStatusMessage(null);

    void (async () => {
      if (cafeConfig.oneSpinPerIp) {
        try {
          const status = await fetchSpinStatus();
          if (!status.allowed) {
            const prior = prizeById(status.prizeId);
            setWinner(prior);
            setPhase(prior ? "result" : "blocked");
            setFreshWin(false);
            setStatusMessage("This network already used today's spin. Try again tomorrow.");
            spinningLock.current = false;
            return;
          }
        } catch {
          // If API is down, still allow the spin for availability
        }
      }

      const firstTime = isFirstTimeSpinner();
      const { prize, index } = selectPrize(prizes, { firstTime });
      const reduced = prefersReducedMotion();
      setReducedMotion(reduced);
      setPhase("spinning");

      if (reduced) {
        const target = getTargetRotation(index, prizes.length, rotationRef.current, 0, 0);
        rotationRef.current = target;
        setRotation(target);
        await finishSpin(prize);
        return;
      }

      const target = getTargetRotation(index, prizes.length, rotationRef.current);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          rotationRef.current = target;
          setRotation(target);
        });
      });

      window.setTimeout(() => {
        void finishSpin(prize);
      }, SPIN_MS + 80);
    })();
  }, [finishSpin, phase]);

  const handleSpinAgain = useCallback(() => {
    spinningLock.current = false;
    setWinner(null);
    setFreshWin(false);
    setStatusMessage(null);
    setPhase("ready");
  }, []);

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <DecorativeBg />
        <div className={styles.inner}>
          <p className={styles.loading}>Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DecorativeBg />
      <div className={styles.inner}>
        <header className={styles.header}>
          <img
            src={cafeConfig.logo}
            alt={`${cafeConfig.name} logo`}
            className={styles.logo}
            width={120}
            height={120}
          />
          <h1 className={styles.brand}>{cafeConfig.name}</h1>
          {phase !== "result" && phase !== "blocked" ? (
            <p className={styles.tagline}>{cafeConfig.tagline}</p>
          ) : null}
        </header>

        {phase === "blocked" ? (
          <section className={styles.blocked} aria-live="polite">
            <p>{statusMessage ?? "Spin unavailable for this network."}</p>
          </section>
        ) : null}

        {phase === "result" && winner ? (
          <>
            <ResultScreen prize={winner} celebrate={freshWin} />
            {allowSpinAgain ? (
              <div className={styles.cta}>
                <SpinButton
                  spinning={false}
                  disabled={false}
                  onSpin={handleSpinAgain}
                  label="SPIN AGAIN"
                />
              </div>
            ) : null}
          </>
        ) : null}

        {phase === "ready" || phase === "spinning" ? (
          <>
            <Wheel
              prizes={prizes}
              rotation={rotation}
              spinning={phase === "spinning"}
              reducedMotion={reducedMotion}
            />
            <div className={styles.cta}>
              <SpinButton
                spinning={phase === "spinning"}
                disabled={phase !== "ready"}
                onSpin={handleSpin}
              />
              <p className={styles.hint}>
                {cafeConfig.oneSpinPerIp
                  ? "One spin per day · Instant prize"
                  : cafeConfig.oneSpinPerBrowser
                    ? "One spin per day · Instant prize"
                    : "Testing mode · Unlimited spins"}
              </p>
            </div>
          </>
        ) : null}

        {statusMessage && phase !== "blocked" ? (
          <p className={styles.statusMsg} role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </main>
  );
}
