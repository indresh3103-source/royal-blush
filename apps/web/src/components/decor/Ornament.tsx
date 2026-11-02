interface OrnamentProps {
  className?: string;
  variant?: "classic" | "floral" | "minimal";
}

export function OrnamentDivider({ className = "", variant = "classic" }: OrnamentProps) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center gap-3 text-royal-primary ${className}`} aria-hidden="true">
        <span className="h-px w-16 bg-current opacity-50" />
        <span className="h-1.5 w-1.5 rotate-45 border border-current" />
        <span className="h-px w-16 bg-current opacity-50" />
      </div>
    );
  }
  if (variant === "floral") {
    return (
      <svg viewBox="0 0 220 34" className={`mx-auto w-52 text-royal-primary ${className}`} fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
          <path d="M2 17 H74" opacity="0.5" />
          <path d="M146 17 H218" opacity="0.5" />
          <path d="M74 17 C82 8 92 8 98 17 C92 26 82 26 74 17Z" opacity="0.8" />
          <path d="M146 17 C138 8 128 8 122 17 C128 26 138 26 146 17Z" opacity="0.8" />
          <circle cx="110" cy="17" r="7" opacity="0.8" />
          <circle cx="110" cy="17" r="2" fill="currentColor" stroke="none" />
          <path d="M86 17 C90 13 94 13 97 17" opacity="0.5" />
          <path d="M123 17 C127 13 131 13 134 17" opacity="0.5" />
          <path d="M102 17 C106 12 114 12 118 17" opacity="0.55" />
          <path d="M102 17 C106 22 114 22 118 17" opacity="0.55" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 260 36" className={`mx-auto w-60 text-royal-primary ${className}`} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18 H84" opacity="0.5" />
        <path d="M176 18 H258" opacity="0.5" />
        <path d="M84 18 C92 10 104 8 110 18 C104 28 92 26 84 18Z" opacity="0.7" />
        <path d="M176 18 C168 10 156 8 150 18 C156 28 168 26 176 18Z" opacity="0.7" />
        <path d="M110 18 C116 12 124 12 130 18 C124 24 116 24 110 18Z" />
        <path d="M150 18 C144 12 136 12 130 18 C136 24 144 24 150 18Z" />
        <circle cx="130" cy="18" r="4.5" opacity="0.9" />
        <circle cx="130" cy="18" r="1.4" fill="currentColor" stroke="none" />
        <path d="M96 18 L100 14 L104 18 L100 22Z" opacity="0.65" />
        <path d="M156 18 L160 14 L164 18 L160 22Z" opacity="0.65" />
      </g>
    </svg>
  );
}

export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M4 96 V34 C4 17 17 4 34 4 H96" opacity="0.55" />
        <path d="M14 96 V38 C14 25 25 14 38 14 H96" opacity="0.3" />
        <path d="M28 52 C34 40 44 34 54 34 C46 44 42 54 42 66" opacity="0.65" />
        <path d="M52 28 C62 24 70 26 76 32 C68 38 58 40 48 38" opacity="0.5" />
        <circle cx="34" cy="34" r="2" fill="currentColor" stroke="none" opacity="0.7" />
      </g>
    </svg>
  );
}

export function Paisley({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M82 12 C44 26 22 64 26 104 C29 138 50 166 78 184 C96 164 106 138 102 110 C98 82 80 64 58 66 C42 68 34 82 38 96 C42 108 56 112 66 104" />
        <path d="M78 32 C52 46 38 72 42 102 C45 126 58 148 76 164" opacity="0.55" />
        <path d="M72 58 C58 68 52 84 56 100 C60 114 72 120 82 114" opacity="0.45" />
        <circle cx="64" cy="92" r="3" fill="currentColor" stroke="none" opacity="0.7" />
        <path d="M94 60 C104 72 106 88 100 102" opacity="0.4" />
      </g>
    </svg>
  );
}

export function Monogram({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full text-current" fill="none" aria-hidden="true">
        <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
        <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 5" opacity="0.6" />
        <path d="M60 2 L65 8 L60 14 L55 8Z" fill="currentColor" opacity="0.8" />
        <path d="M60 106 L65 112 L60 118 L55 112Z" fill="currentColor" opacity="0.8" />
      </svg>
      <span className="relative font-display text-[0.9em] tracking-[0.18em]">{initials}</span>
    </div>
  );
}
