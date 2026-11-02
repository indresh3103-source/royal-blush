interface MandalaProps {
  className?: string;
  rings?: number;
  petals?: number;
}

export function Mandala({ className = "", rings = 4, petals = 32 }: MandalaProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
        {Array.from({ length: petals }).map((_, index) => {
          const angle = (index * 360) / petals;
          return (
            <g key={angle} transform={`rotate(${angle} 200 200)`}>
              <path
                d="M200 24 C212 46 212 66 200 84 C188 66 188 46 200 24Z"
                opacity={index % 2 === 0 ? 0.7 : 0.3}
              />
              <circle cx="200" cy="16" r="1.5" fill="currentColor" stroke="none" opacity="0.55" />
            </g>
          );
        })}
        {Array.from({ length: rings }).map((_, index) => {
          const radius = 96 + index * 22;
          return (
            <circle
              key={radius}
              cx="200"
              cy="200"
              r={radius}
              strokeDasharray={index % 2 === 0 ? "1 7" : "4 9"}
              opacity={0.35 + index * 0.08}
            />
          );
        })}
        <circle cx="200" cy="200" r="72" opacity="0.55" />
        <circle cx="200" cy="200" r="58" opacity="0.35" />
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index * 360) / 16;
          return (
            <g key={angle} transform={`rotate(${angle} 200 200)`}>
              <path d="M200 128 C210 145 210 158 200 172 C190 158 190 145 200 128Z" opacity="0.65" />
              <path d="M200 172 L200 196" opacity="0.35" />
            </g>
          );
        })}
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * 360) / 8 + 22.5;
          return (
            <g key={angle} transform={`rotate(${angle} 200 200)`}>
              <path d="M200 152 C206 164 206 176 200 186 C194 176 194 164 200 152Z" opacity="0.45" />
            </g>
          );
        })}
        <circle cx="200" cy="200" r="22" opacity="0.55" />
        <circle cx="200" cy="200" r="10" opacity="0.75" />
        <circle cx="200" cy="200" r="3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function LotusMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 12 C46 24 46 34 40 42 C34 34 34 24 40 12Z" />
        <path d="M40 42 C31 36 24 28 22 18 C33 20 39 28 40 42Z" />
        <path d="M40 42 C49 36 56 28 58 18 C47 20 41 28 40 42Z" />
        <path d="M40 42 C28 41 18 37 12 29 C24 26 35 31 40 42Z" />
        <path d="M40 42 C52 41 62 37 68 29 C56 26 45 31 40 42Z" />
        <path d="M18 46 C28 50 52 50 62 46" opacity="0.7" />
      </g>
    </svg>
  );
}
