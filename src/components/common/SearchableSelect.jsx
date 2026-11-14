import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search...',
  required = false,
  disabled = false,
  className = '',
  zIndexClass = 'z-50',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Normalize options: handles arrays of primitives or objects
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return []
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) }
      }
      return {
        value: opt.value !== undefined ? opt.value : opt.id || opt.code || opt.name,
        label: opt.label !== undefined ? opt.label : opt.name || String(opt.value || ''),
        sublabel: opt.sublabel || opt.category || opt.sku || null,
        disabled: Boolean(opt.disabled),
      }
    })
  }, [options])

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value))
  }, [normalizedOptions, value])

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions
    const q = search.toLowerCase().trim()
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label && String(opt.label).toLowerCase().includes(q)
      const matchValue = opt.value && String(opt.value).toLowerCase().includes(q)
      const matchSub = opt.sublabel && String(opt.sublabel).toLowerCase().includes(q)
      return matchLabel || matchValue || matchSub
    })
  }, [normalizedOptions, search])

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleSelect = (val) => {
    if (onChange) onChange(val)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full bg-white hover:bg-slate-50/80 border rounded-xl px-3.5 py-2 text-xs text-left font-medium flex items-center justify-between gap-2 transition cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-slate-900 bg-white'
            : 'border-slate-300 text-slate-800 hover:border-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} min-w-[200px] animate-in fade-in zoom-in-95 duration-100 flex flex-col z-[100]`}
          style={{ maxHeight: '320px' }}
        >
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearch('')
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {normalizedOptions.length > 4 && (
              <div className="text-[10px] text-slate-400 px-1 pt-1 flex justify-between">
                <span>{filteredOptions.length} of {normalizedOptions.length} options</span>
                {search && <span>Filtered</span>}
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-56 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-slate-400">
                No options found for "{search}"
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 select-none'
                        : isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold cursor-pointer'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

