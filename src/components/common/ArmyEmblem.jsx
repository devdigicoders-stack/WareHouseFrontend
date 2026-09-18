export default function ArmyEmblem({ className = 'w-16 h-16', showText = false, textColor = 'text-amber-400' }) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="goldGradLuxe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="25%" stopColor="#E5B239" />
            <stop offset="60%" stopColor="#BD8518" />
            <stop offset="100%" stopColor="#7A4E04" />
          </linearGradient>
          <linearGradient id="bladeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8D6" />
            <stop offset="50%" stopColor="#D8A026" />
            <stop offset="100%" stopColor="#966308" />
          </linearGradient>
        </defs>

        {/* Ashoka Lion Capital at Top */}
        <g id="ashoka-capital" transform="translate(62, 8)">
          {/* Main Lion Silhouette */}
          <path
            d="M18 1 C14 1 12 3 11 6 C9 5 7 7 7 10 C7 13 9 15 10 17 C8 19 8 23 10 26 C12 29 15 30 18 30 C21 30 24 29 26 26 C28 23 28 19 26 17 C27 15 29 13 29 10 C29 7 27 5 25 6 C24 3 22 1 18 1 Z"
            fill="url(#goldGradLuxe)"
          />
          {/* Side Lion Heads */}
          <path d="M8 11 C4 12 2 16 3 20 C4 23 7 25 10 25 Z" fill="url(#goldGradLuxe)" opacity="0.9" />
          <path d="M28 11 C32 12 34 16 33 20 C32 23 29 25 26 25 Z" fill="url(#goldGradLuxe)" opacity="0.9" />
          {/* Base Pedestal with Ashoka Chakra */}
          <rect x="4" y="31" width="28" height="6" rx="2" fill="url(#goldGradLuxe)" />
          <circle cx="18" cy="34" r="2.2" fill="#1E293B" />
          <circle cx="18" cy="34" r="1" fill="#FFF2B2" />
        </g>

        {/* Crossed Cavalry Sabres / Swords (Bold & Authoritative) */}
        <g id="crossed-sabres">
          {/* Sabre 1: Top-Left to Bottom-Right */}
          <path
            d="M24 32 C38 48 88 92 136 124 L133 128 C85 96 35 52 21 36 Z"
            fill="url(#bladeGrad1)"
          />
          {/* Sabre 1 Highlight Ridge */}
          <path d="M26 34 C40 50 86 92 133 123" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
          {/* Sabre 1 Hilt / Crossguard */}
          <g transform="translate(126, 116) rotate(38)">
            <rect x="-1" y="-8" width="4" height="16" rx="2" fill="url(#goldGradLuxe)" stroke="#5A3900" strokeWidth="0.5" />
            <path d="M0 8 C6 8 8 16 2 20" stroke="url(#goldGradLuxe)" strokeWidth="2.5" fill="none" />
            <circle cx="1" cy="20" r="2.5" fill="url(#goldGradLuxe)" />
          </g>

          {/* Sabre 2: Top-Right to Bottom-Left */}
          <path
            d="M136 32 C122 48 72 92 24 124 L27 128 C75 96 125 52 139 36 Z"
            fill="url(#bladeGrad1)"
          />
          {/* Sabre 2 Highlight Ridge */}
          <path d="M134 34 C120 50 74 92 27 123" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
          {/* Sabre 2 Hilt / Crossguard */}
          <g transform="translate(34, 116) rotate(-38)">
            <rect x="-3" y="-8" width="4" height="16" rx="2" fill="url(#goldGradLuxe)" stroke="#5A3900" strokeWidth="0.5" />
            <path d="M0 8 C-6 8 -8 16 -2 20" stroke="url(#goldGradLuxe)" strokeWidth="2.5" fill="none" />
            <circle cx="-1" cy="20" r="2.5" fill="url(#goldGradLuxe)" />
          </g>
        </g>

        {/* Central Ashoka Chakra & Star Emblem */}
        <g id="center-crest" transform="translate(80, 80)">
          {/* Outer Star Rays */}
          <polygon
            points="0,-16 4.5,-5 16,-5 7.5,2 10.5,13 0,6 -10.5,13 -7.5,2 -16,-5 -4.5,-5"
            fill="url(#goldGradLuxe)"
            stroke="#503200"
            strokeWidth="0.7"
          />
          {/* Inner Chakra Circle */}
          <circle cx="0" cy="0" r="5" fill="#1E293B" stroke="url(#goldGradLuxe)" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2" fill="#FFF2B2" />
        </g>

        {/* Decorative Golden Laurel Arch at Bottom */}
        <path
          d="M36 128 C52 144 108 144 124 128"
          stroke="url(#goldGradLuxe)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="4 2.5"
        />
      </svg>

      {showText && (
        <div className="text-center mt-1">
          <span className={`text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase block ${textColor}`}>
            INDIAN ARMY
          </span>
          <span className="text-[8px] sm:text-[9px] text-amber-400/90 font-semibold tracking-wider block">
            सेवा परमो धर्मः
          </span>
        </div>
      )}
    </div>
  )
}
