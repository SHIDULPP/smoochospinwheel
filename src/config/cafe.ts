export const cafeConfig = {
  name: "Smoocho Thrissur",
  logo: "/images/logo.png",
  tagline: "Spin for a sweet surprise!",
  claimCopy: "Show this screen at the café counter to claim your offer.",
  /**
   * Browser/day backup (localStorage). Keep true in production as a second
   * layer if Redis is briefly unavailable.
   */
  oneSpinPerBrowser: true,
  /**
   * One spin per IP per calendar day (Asia/Kolkata midnight reset).
   * Local: Vite /api middleware (data/ip-spins.json).
   * Production (Vercel): Edge API + Upstash/Vercel KV.
   */
  oneSpinPerIp: true,
};
