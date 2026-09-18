export default function TricolorBar({ className = 'w-16 h-1' }) {
  return (
    <div className={`flex rounded-full overflow-hidden shadow-sm ${className}`}>
      <div className="flex-1 bg-[#FF9933]"></div>
      <div className="flex-1 bg-[#FFFFFF]"></div>
      <div className="flex-1 bg-[#138808]"></div>
    </div>
  )
}
