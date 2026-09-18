export default function MilitarySilhouettes({ className = 'w-72 h-14' }) {
  return (
    <div className={`overflow-hidden pointer-events-none select-none opacity-45 ${className}`}>
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
        {/* Ground Terrain Line */}
        <path d="M0 65 Q100 62 200 66 T400 64 L400 80 L0 80 Z" />

        {/* Soldier 1 (Patrol with rifle slung) */}
        <g transform="translate(40, 30)">
          <circle cx="8" cy="6" r="3.5" /> {/* Helmet */}
          <path d="M4 10 L12 10 L14 26 L11 36 L5 36 L2 26 Z" /> {/* Body */}
          <line x1="12" y1="12" x2="22" y2="28" stroke="currentColor" strokeWidth="2" /> {/* Rifle */}
        </g>

        {/* Soldier 2 (Standing Guard) */}
        <g transform="translate(85, 26)">
          <circle cx="7" cy="5" r="3.5" />
          <path d="M3 9 L11 9 L13 28 L10 40 L4 40 L1 28 Z" />
          <line x1="10" y1="8" x2="10" y2="38" stroke="currentColor" strokeWidth="1.8" />
        </g>

        {/* Soldier 3 (Radio Operator / Antenna) */}
        <g transform="translate(130, 24)">
          <circle cx="7" cy="6" r="3.5" />
          <path d="M3 10 L11 10 L12 28 L9 42 L5 42 L2 28 Z" />
          <rect x="2" y="11" width="5" height="10" rx="1" /> {/* Backpack */}
          <line x1="3" y1="11" x2="3" y2="-2" stroke="currentColor" strokeWidth="1.2" /> {/* Comms Antenna */}
        </g>

        {/* Army Truck / APC Silhouette */}
        <g transform="translate(240, 38)">
          <path d="M0 24 L8 14 L28 14 L34 20 L50 20 L50 26 L0 26 Z" />
          <circle cx="12" cy="26" r="4" fill="#000000" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="38" cy="26" r="4" fill="#000000" stroke="currentColor" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}
