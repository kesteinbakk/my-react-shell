import { forwardRef, useEffect, useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { useDebounce } from './useDebounce'

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="4 5 16 13"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '0.8em', height: '0.65em' }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export type SearchInputSize = 'sm' | 'md' | 'lg'

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  /** Custom icon on the left (overrides the magnifier glass). */
  icon?: ReactNode
  /** Custom icon at the end (positioned on the right). */
  endIcon?: ReactNode
  /** Callback fired debounced when the user types. */
  onDebounceSearch?: (value: string) => void
  /** Debounce delay in ms (default: 500). */
  debounceMs?: number
  /** Controlled value. */
  value?: string
  /** Default initial value. */
  defaultValue?: string
  /** Size variant — sm (1.75rem height), md (2.25rem height), or lg (2.75rem height). Defaults to md. */
  inputSize?: SearchInputSize
  /** Custom change handler. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * State configuration for a loaded indicator. Accepts true or an object.
   * If true (or enabled: true), fades in a green check mark.
   */
  loadedIconState?:
    | boolean
    | {
        icon?: ReactNode
        duration?: number
        enabled?: boolean
        transitionMs?: number
      }
}

/**
 * An opinionated search input component with built-in debouncing, left magnifier glass icon,
 * end icon support, and a loaded icon state (fades in a green check mark).
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    const {
      icon,
      endIcon,
      onDebounceSearch,
      debounceMs = 500,
      value,
      defaultValue,
      inputSize = 'md',
      onChange,
      loadedIconState,
      className,
      ...rest
    } = props

    const id = useId()
    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '')

    // Handle controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value)
      }
    }, [value])

    const scheduleDebounced = useDebounce((val: string) => {
      onDebounceSearch?.(val)
    }, debounceMs)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue(val)
      onChange?.(e)
      scheduleDebounced(val)
    }

    const [showLoaded, setShowLoaded] = useState(false)

    const loadedEnabled = typeof loadedIconState === 'boolean' ? loadedIconState : !!loadedIconState?.enabled
    const loadedIcon = (typeof loadedIconState === 'object' && loadedIconState !== null && loadedIconState.icon) || <CheckIcon />
    const loadedDuration = (typeof loadedIconState === 'object' && loadedIconState !== null && typeof loadedIconState.duration === 'number')
      ? Number(loadedIconState.duration)
      : 2000
    const transitionMs = (typeof loadedIconState === 'object' && loadedIconState !== null && typeof loadedIconState.transitionMs === 'number')
      ? Number(loadedIconState.transitionMs)
      : 300

    useEffect(() => {
      if (loadedEnabled) {
        setShowLoaded(true)
        if (loadedDuration > 0) {
          const timer = setTimeout(() => {
            setShowLoaded(false)
          }, loadedDuration)
          return () => clearTimeout(timer)
        }
      } else {
        setShowLoaded(false)
      }
    }, [loadedEnabled, loadedDuration])

    const hasEndIcon = endIcon != null || showLoaded

    return (
      <div
        className={cn(
          'mrs-search-input-wrapper',
          `mrs-search-input-wrapper--${inputSize}`,
          hasEndIcon && 'mrs-search-input-wrapper--has-end-icon',
        )}
        style={{
          '--mrs-search-transition-duration': `${transitionMs}ms`,
        } as React.CSSProperties}
      >
        <span
          className={cn(
            'mrs-search-input-icon-start',
            `mrs-search-input-icon-start--${inputSize}`,
          )}
          aria-hidden="true"
        >
          {icon ?? <SearchIcon />}
        </span>
        <input
          ref={ref}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleChange}
          className={cn(
            'mrs-search-input',
            `mrs-search-input--${inputSize}`,
            hasEndIcon && 'mrs-search-input--has-end-icon',
            className,
          )}
          {...rest}
        />
        {endIcon != null && !showLoaded && (
          <span
            className={cn(
              'mrs-search-input-icon-end',
              `mrs-search-input-icon-end--${inputSize}`,
            )}
          >
            {endIcon}
          </span>
        )}
        <span
          className={cn(
            'mrs-search-input-loaded-icon',
            `mrs-search-input-loaded-icon--${inputSize}`,
            showLoaded && 'mrs-search-input-loaded-icon--active',
          )}
          aria-hidden="true"
        >
          {loadedIcon}
        </span>
      </div>
    )
  }
)
