// my-react-shell/components — the opinionated component kit (sub-path
// `my-react-shell/components`).
//
// React composites that bake design / layout / behavior decisions on top of
// shadcn/Radix primitives and render against the semantic theme tokens (light +
// dark, every palette). Un-opinionated shadcn primitives (Button/Input/Checkbox/…)
// are NOT shipped — consumers use shadcn directly for those; the kit only ships the
// pieces that need an opinion. Ship the stylesheet too:
//   import 'my-react-shell/components/styles.css'
// `class-variance-authority`, `clsx`, and `tailwind-merge` are optional peers behind
// this sub-path, so the package barrel stays the theme core. See
// docs/guides/component-kit.md.

export { Alert } from './Alert'
export type { AlertProps, AlertVariant } from './Alert'

export { Spinner, PageSpinner, SectionSpinner } from './Spinner'
export type { SpinnerProps, SpinnerBlockProps, SpinnerSize } from './Spinner'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { InfoBox } from './InfoBox'
export type { InfoBoxProps } from './InfoBox'

export { ConfirmDialog } from './ConfirmDialog'
export type { ConfirmDialogProps } from './ConfirmDialog'

export { ToastProvider, useToast } from './Toast'
export type { ToastApi, ToastOptions, ToastProviderProps, ToastTone } from './Toast'

export { ActionButton, ActionButtonGroup, actionPresets } from './ActionButton'
export type {
  ActionButtonProps,
  ActionButtonPresetProps,
  ActionButtonIconProps,
  ActionButtonGroupProps,
  ActionButtonVariant,
  ActionButtonSize,
  ActionButtonLayout,
  ActionType,
  ActionPreset,
} from './ActionButton'

export { Badge } from './Badge'
export type { BadgeProps, BadgeTone } from './Badge'

export { Chip, ChipGroup } from './Chip'
export type { ChipProps, ChipGroupProps } from './Chip'

export { Avatar, AvatarGroup } from './Avatar'
export type { AvatarProps, AvatarGroupProps, AvatarSize } from './Avatar'

export { Table } from './Table'
export type { TableProps, TableColumn } from './Table'

export { PhiCard, PHI } from './PhiCard'
export type {
  PhiCardProps,
  PhiCardSize,
  PhiCardAction,
  PhiCardFooter,
  PhiCardFooterLine,
  PhiCardFooterLineType,
} from './PhiCard'

export { StatCard } from './StatCard'
export type {
  StatCardProps,
  StatCardBadge,
  StatItem,
  StatCardTone,
  StatCardFooter,
  StatCardFooterLine,
  StatCardFooterLineType,
} from './StatCard'

export { InputField } from './InputField'
export type { InputFieldProps } from './InputField'

export { SegmentedControl } from './SegmentedControl'
export type { SegmentedControlProps, SegmentedOption } from './SegmentedControl'

export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

export { UserPreferences } from './UserPreferences'
export type { UserPreferencesProps } from './UserPreferences'

export { cn } from './cn'
