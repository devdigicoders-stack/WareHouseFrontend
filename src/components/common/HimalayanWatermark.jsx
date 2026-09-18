export default function HimalayanWatermark({ className = 'w-full h-24' }) {
  return (
    <div className={`relative overflow-hidden pointer-events-none select-none opacity-40 ${className}`}>
      <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full" fill="none">
        {/* Distant Mountain Peaks */}
        <path
          d="M0 85 L40 50 L90 75 L150 30 L210 65 L260 20 L320 60 L380 35 L440 70 L500 45 L500 120 L0 120 Z"
          fill="#D1D5DB"
          fillOpacity="0.4"
        />
        {/* Midground Mountain Ridges */}
        <path
          d="M0 95 L60 65 L120 85 L180 50 L240 75 L300 45 L360 80 L420 55 L480 85 L500 75 L500 120 L0 120 Z"
          fill="#9CA3AF"
          fillOpacity="0.3"
        />
        {/* Foreground Snow Caps */}
        <path
          d="M150 30 L165 42 L140 45 Z M260 20 L275 35 L248 38 Z M380 35 L395 48 L370 50 Z"
          fill="#FFFFFF"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  )
}
