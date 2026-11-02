interface GaneshProps {
  className?: string;
  title?: string;
}

export function Ganesh({ className = "", title = "Lord Ganesh" }: GaneshProps) {
  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="128" r="104" strokeDasharray="2 6" opacity="0.55" />
        <circle cx="120" cy="128" r="94" opacity="0.25" />
        {Array.from({ length: 24 }).map((_, index) => {
          const angle = (index * 360) / 24;
          return (
            <g key={angle} transform={`rotate(${angle} 120 128)`}>
              <path d="M120 18 C126 30 126 42 120 52 C114 42 114 30 120 18Z" opacity={index % 2 === 0 ? 0.75 : 0.35} />
              <circle cx="120" cy="11" r="1.4" fill="currentColor" stroke="none" opacity="0.6" />
            </g>
          );
        })}
        <path d="M120 58 C110 66 102 78 101 91" opacity="0.35" />
        <path d="M120 58 C130 66 138 78 139 91" opacity="0.35" />
        <path d="M104 76 C93 66 82 62 74 67 C65 73 69 88 81 94 C91 99 101 96 106 88" fill="currentColor" fillOpacity="0.06" />
        <path d="M136 76 C147 66 158 62 166 67 C175 73 171 88 159 94 C149 99 139 96 134 88" fill="currentColor" fillOpacity="0.06" />
        <path d="M83 80 C88 77 94 79 96 84" opacity="0.5" />
        <path d="M157 80 C152 77 146 79 144 84" opacity="0.5" />
        <path d="M98 96 C94 108 96 120 103 130 C111 142 119 150 116 163 C113 176 101 182 90 177 C81 173 78 162 84 154 C89 147 99 149 101 157" fill="currentColor" fillOpacity="0.05" />
        <path d="M142 96 C146 108 144 118 138 127" opacity="0.55" />
        <path d="M120 63 C133 63 145 72 149 85 C154 100 150 118 138 130 C130 138 120 143 120 143 C120 143 110 138 102 130 C90 118 86 100 91 85 C95 72 107 63 120 63Z" fill="currentColor" fillOpacity="0.07" />
        <path d="M120 71 C129 71 138 77 141 87 C145 100 140 114 131 123 C127 127 123 130 120 132 C117 130 113 127 109 123 C100 114 95 100 99 87 C102 77 111 71 120 71Z" opacity="0.6" />
        <path d="M120 84 L120 94" opacity="0.7" />
        <path d="M113 87 C116 84 124 84 127 87" opacity="0.7" />
        <path d="M108 102 C112 100 116 101 119 104" />
        <path d="M132 102 C128 100 124 101 121 104" />
        <circle cx="111" cy="104" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="129" cy="104" r="1.8" fill="currentColor" stroke="none" />
        <path d="M120 104 C118 112 121 116 125 115" opacity="0.75" />
        <path d="M109 119 C105 119 103 123 105 126 C107 129 112 128 114 125" opacity="0.65" />
        <path d="M131 119 C135 119 137 123 135 126 C133 129 128 128 126 125" opacity="0.65" />
        <path d="M120 128 C114 136 110 146 112 154 C114 162 121 165 127 161 C132 158 132 152 128 150" opacity="0.8" />
        <path d="M120 128 C126 136 130 146 128 154" opacity="0.35" />
        <path d="M96 116 C91 120 88 127 90 133" opacity="0.45" />
        <path d="M144 116 C149 120 152 127 150 133" opacity="0.45" />
        <path d="M97 58 C105 48 135 48 143 58" opacity="0.7" />
        <path d="M100 56 C104 40 112 31 120 24 C128 31 136 40 140 56" fill="currentColor" fillOpacity="0.06" />
        <path d="M104 52 C110 40 116 34 120 29 C124 34 130 40 136 52" opacity="0.6" />
        <path d="M105 46 L111 38 L117 46 M123 46 L129 38 L135 46" opacity="0.6" />
        <circle cx="120" cy="20" r="3" fill="currentColor" stroke="none" opacity="0.8" />
        <path d="M84 62 C92 58 98 58 103 61" opacity="0.5" />
        <path d="M156 62 C148 58 142 58 137 61" opacity="0.5" />
        <path d="M91 146 C82 154 80 166 87 174" opacity="0.35" />
        <path d="M149 146 C158 154 160 166 153 174" opacity="0.35" />
        <path d="M60 206 C84 194 102 194 120 204 C138 194 156 194 180 206" opacity="0.5" />
        <path d="M66 214 C88 204 104 205 120 214 C136 205 152 204 174 214" opacity="0.3" />
        <path d="M92 230 C100 220 110 216 120 220 C130 216 140 220 148 230" opacity="0.45" />
        <circle cx="120" cy="236" r="4" fill="currentColor" stroke="none" opacity="0.7" />
      </g>
    </svg>
  );
}
