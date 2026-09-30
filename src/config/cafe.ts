export const cafeConfig = {
  name: "Smoocho Thrissur",
  logo: "/images/logo.png",
  tagline: "Spin for a sweet surprise!",
  claimCopy: "Show this screen at the café counter to claim your offer.",
  /** Set true for launch to lock one spin per browser via localStorage */
  oneSpinPerBrowser: false,
  /**
   * One spin per IP per calendar day (Asia/Kolkata midnight reset).
   * Local: Vite /api middleware (data/ip-spins.json).
   * Production (Vercel): Edge API + Upstash/Vercel KV.
   * Set false while testing from the same network / localhost.
   */
  oneSpinPerIp: true,
};
