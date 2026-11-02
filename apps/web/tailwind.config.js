export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          deep: "var(--rb-deep)",
          primary: "var(--rb-primary)",
          accent: "var(--rb-accent)",
          cream: "var(--rb-bg)",
          ink: "var(--rb-text)"
        },
        wine: "#5A1F30",
        blush: "#F7E7E9",
        ivory: "#FBF7EF",
        gold: "#B89555",
        parchment: "#F3E7D7"
      },
      fontFamily: {
        display: ["var(--rb-heading)", "Cormorant Garamond", "serif"],
        body: ["var(--rb-body)", "Poppins", "sans-serif"],
        script: ["Great Vibes", "cursive"],
        deva: ["Tiro Devanagari Hindi", "serif"]
      },
      boxShadow: {
        soft: "0 30px 80px -40px rgba(73, 55, 47, 0.5)",
        gold: "0 0 0 1px rgba(184, 149, 85, 0.35), 0 24px 60px -36px rgba(118, 47, 67, 0.55)",
        insetGold: "inset 0 0 0 1px rgba(184, 149, 85, 0.45)"
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
