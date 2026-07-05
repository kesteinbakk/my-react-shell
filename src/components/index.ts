// my-react-shell/components — the component kit (sub-path `my-react-shell/components`).
//
// The complete component surface: un-opinionated primitives and opinionated
// composites, all built directly on Radix + `class-variance-authority` and rendered
// against the semantic theme tokens (light + dark, every palette) with `mrs-`-prefixed
// CSS — so a consumer needs no shadcn. The kit's convention: `tone` carries semantic
// colour (the shared `Tone` type), `variant` carries structural style. Ship the
// stylesheet too:
//   import 'my-react-shell/components/styles.css'
// `class-variance-authority`, `clsx`, and `tailwind-merge` are optional peers behind
// this sub-path, so the package barrel stays the theme core. The kit's canonical
// doc is docs/specifications/api-reference.md (it ships no separate guide).

export type { Tone } from './tone'
export { TONE_COLOR } from './tone'
export type { IconButtonSize } from './iconButtonScale'
export { ICON_BUTTON_GLYPH_PX } from './iconButtonScale'

export { IconButton } from './IconButton'
export type { IconButtonProps } from './IconButton'

export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

export { HeaderMenuButton } from './HeaderMenuButton'
export type { HeaderMenuButtonProps } from './HeaderMenuButton'

export { useDebounce } from './useDebounce'

export { Input } from './Input'
export type { InputProps, InputSize } from './Input'

export { Textarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { Label } from './Label'
export type { LabelProps } from './Label'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './Card'

export { Separator } from './Separator'
export type { SeparatorProps, SeparatorOrientation } from './Separator'

export { Skeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton'

export { Dialog } from './Dialog'
export type { DialogProps, DialogSize } from './Dialog'

export { LanguagePicker } from './LanguagePicker'
export type { LanguagePickerProps, LanguageTrigger } from './LanguagePicker'

export { Flag } from './Flag'
export type { FlagProps } from './Flag'

export { Popover } from './Popover'
export type { PopoverProps, PopoverAlign, PopoverSide } from './Popover'

export { DropdownMenu } from './DropdownMenu'
export type {
  DropdownMenuProps,
  DropdownMenuItem,
  DropdownMenuActionItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroupItem,
  DropdownMenuRadioOption,
  DropdownMenuSubmenuItem,
} from './DropdownMenu'

export { ContextMenu } from './ContextMenu'
export type { ContextMenuProps } from './ContextMenu'

export { Alert } from './Alert'
export type { AlertProps, AlertTone } from './Alert'

export { Spinner, PageSpinner, SectionSpinner } from './Spinner'
export type { SpinnerProps, SpinnerBlockProps, SpinnerSize } from './Spinner'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { EmptyStateAddButton } from './EmptyStateAddButton'
export type { EmptyStateAddButtonProps, EmptyStateAddButtonSize, EmptyStateAddButtonTone } from './EmptyStateAddButton'

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
  ActionButtonTone,
  ActionButtonSize,
  ActionButtonLayout,
  ActionType,
  ActionPreset,
} from './ActionButton'

export { CopyButton } from './CopyButton'
export type { CopyButtonProps } from './CopyButton'

export { Badge } from './Badge'
export type { BadgeProps, BadgeTone } from './Badge'

export { CountPill } from './CountPill'
export type { CountPillProps, CountPillTone } from './CountPill'

export { Chip, ChipGroup } from './Chip'
export type { ChipProps, ChipGroupProps } from './Chip'

export { Avatar, AvatarGroup } from './Avatar'
export type { AvatarProps, AvatarGroupProps, AvatarSize } from './Avatar'

export { Table } from './Table'
export type { TableProps, TableColumn, TableRowVariant } from './Table'

export { PhiCard, PHI } from './PhiCard'
export type {
  PhiCardProps,
  PhiCardSize,
  PhiCardAction,
  PhiCardFooter,
  PhiCardFooterLine,
  PhiCardFooterLineType,
} from './PhiCard'

// Shared card icon-placement vocabulary — the type + config shape + runtime discriminator
// backing every card's `icon` prop (each card also re-exports its own named aliases).
export { isIconConfig } from './card-icon'
export type { CardIconPlacement, CardIconConfig } from './card-icon'

export { StatCard } from './StatCard'
export type {
  StatCardProps,
  StatCardSize,
  StatCardMedallion,
  StatItem,
  StatCardTone,
  StatCardVariant,
  StatCardFooter,
  StatCardFooterLine,
  StatCardFooterLineType,
  StatCardShape,
  StatCardIconPlacement,
  StatCardIconConfig,
  StatCardLinkProps,
} from './StatCard'

export { ContentCard } from './ContentCard'
export type {
  ContentCardProps,
  ContentCardSize,
  ContentCardTone,
  ContentCardVariant,
  ContentCardFooter,
  ContentCardFooterLine,
  ContentCardFooterLineType,
  ContentCardShape,
  ContentCardIconPlacement,
  ContentCardIconConfig,
  ContentCardLinkProps,
} from './ContentCard'

export { PaperCard } from './PaperCard'
export type {
  PaperCardProps,
  PaperCardSize,
  PaperCardTone,
  PaperCardFooter,
  PaperCardFooterLine,
  PaperCardFooterLineType,
  PaperCardIconPlacement,
  PaperCardIconConfig,
  PaperCardLinkProps,
} from './PaperCard'

export { RevealMark } from './RevealMark'
export type { RevealMarkProps } from './RevealMark'

export { DrawerMark } from './DrawerMark'
export type { DrawerMarkProps } from './DrawerMark'

export { InputField } from './InputField'
export type { InputFieldProps } from './InputField'

export { SearchInput } from './SearchInput'
export type { SearchInputProps, SearchInputSize } from './SearchInput'


export { SegmentedControl } from './SegmentedControl'
export type { SegmentedControlProps, SegmentedOption } from './SegmentedControl'

export { Select } from './Select'
export type { SelectProps, SelectOption, SelectSize } from './Select'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

export { Switch } from './Switch'
export type { SwitchProps } from './Switch'

export { RadioGroup } from './RadioGroup'
export type { RadioGroupProps, RadioOption } from './RadioGroup'

export { Tabs } from './Tabs'
export type { TabsProps, TabItem } from './Tabs'

export { Tooltip } from './Tooltip'
export type { TooltipProps } from './Tooltip'

export { ColorPicker } from './ColorPicker'
export type { ColorPickerProps, ColorFormat } from './ColorPicker'

export { UserPreferences } from './UserPreferences'
export type { UserPreferencesProps } from './UserPreferences'

export { Collapsible } from './Collapsible'
export type { CollapsibleProps, CollapsibleVariant, CollapsibleSize } from './Collapsible'

export { Accordion } from './Accordion'
export type {
  AccordionProps,
  AccordionItem,
  AccordionVariant,
  AccordionSize,
} from './Accordion'

export { Slider } from './Slider'
export type { SliderProps } from './Slider'

export { Progress } from './Progress'
export type { ProgressProps, ProgressSize } from './Progress'

export { Toggle } from './Toggle'
export type { ToggleProps, ToggleVariant, ToggleSize } from './Toggle'

export { ToggleGroup } from './ToggleGroup'
export type {
  ToggleGroupProps,
  ToggleGroupOption,
  ToggleGroupSingleProps,
  ToggleGroupMultipleProps,
} from './ToggleGroup'

export { Sheet } from './Sheet'
export type { SheetProps, SheetSide, SheetSize } from './Sheet'

export { Calendar } from './Calendar'
export type { CalendarProps } from './Calendar'

export { DatePicker } from './DatePicker'
export type { DatePickerProps } from './DatePicker'

export { EmojiPicker, EmojiEmpty, EMOJI_FREQUENT } from './EmojiPicker'
export type { EmojiPickerProps } from './EmojiPicker'

export { EmojiBar } from './EmojiBar'
export type { EmojiBarProps } from './EmojiBar'

export { cn } from './cn'

// Static grid — fixed-size cards, fixed gap, flow + wrap, no stretching.
export { CardGrid } from './CardGrid'
export type { CardGridProps } from './CardGrid'

// Dynamic grid — fluid cards that stretch to fill uniform `1fr` columns, with a
// built-in search / filter / sort toolbar.
// DynamicCards — the fluid card grid (search / filter / sort toolbar, cardSize scale). Map
// each item to a card with `getCard` (renders a DynamicCard), or `renderCard` for a raw node;
// `wrapCard` wraps each tile (e.g. a drag Sortable). DynamicCard is the standalone card
// primitive it renders — reach for it directly in a drag overlay or a fully custom layout.
export { DynamicCards } from './DynamicCards'
export type {
  DynamicCardsProps,
  DynamicCardsCommonProps,
  DynamicCardBuilder,
  ToggleFilter,
  SortOption,
} from './DynamicCards'
export { DynamicCard } from './DynamicCard'
export type {
  DynamicCardProps,
  DynamicCardSize,
  DynamicCardShape,
  DynamicCardIconPlacement,
  DynamicCardIconConfig,
  DynamicCardFooter,
  DynamicCardFooterLine,
  DynamicCardFooterLineType,
  DynamicCardLinkProps,
} from './DynamicCard'

// DynamicNavCards — a self-contained grid of lean navigation tiles. Rides the same
// DynamicCards grid but renders its own tile (never a DynamicCard);
// each tile's single `title` grows large when short and steps down (2-line cap) as it grows.
// `NavTile` is the single-tile primitive behind the grid — for a lone tile outside
// `DynamicNavCards` (e.g. wrapped in a drag handle), same look, one `DynamicNavCard`.
export { DynamicNavCards, NavTile } from './DynamicNavCards'
export type {
  DynamicNavCardsProps,
  DynamicNavCard,
  DynamicNavCardLinkProps,
} from './DynamicNavCards'
