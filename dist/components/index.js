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
export { TONE_COLOR } from './tone';
export { ICON_BUTTON_GLYPH_PX } from './iconButtonScale';
export { IconButton } from './IconButton';
export { Button } from './Button';
export { HeaderMenuButton } from './HeaderMenuButton';
export { useDebounce } from './useDebounce';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Label } from './Label';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Separator } from './Separator';
export { Skeleton } from './Skeleton';
export { Dialog } from './Dialog';
export { LanguagePicker } from './LanguagePicker';
export { Flag } from './Flag';
export { Popover } from './Popover';
export { DropdownMenu } from './DropdownMenu';
export { ContextMenu } from './ContextMenu';
export { Alert } from './Alert';
export { Spinner, PageSpinner, SectionSpinner } from './Spinner';
export { EmptyState } from './EmptyState';
export { EmptyStateAddButton } from './EmptyStateAddButton';
export { InfoBox } from './InfoBox';
export { ConfirmDialog } from './ConfirmDialog';
export { ToastProvider, useToast } from './Toast';
export { ActionButton, ActionButtonGroup, actionPresets } from './ActionButton';
export { CopyButton } from './CopyButton';
export { Badge } from './Badge';
export { CountPill } from './CountPill';
export { Chip, ChipGroup } from './Chip';
export { Avatar, AvatarGroup } from './Avatar';
export { Table } from './Table';
export { PhiCard, PHI } from './PhiCard';
// Shared card icon-placement vocabulary — the type + config shape + runtime discriminator
// backing every card's `icon` prop (each card also re-exports its own named aliases).
export { isIconConfig } from './card-icon';
export { StatCard } from './StatCard';
export { ContentCard } from './ContentCard';
export { PaperCard } from './PaperCard';
export { RevealMark } from './RevealMark';
export { DrawerMark } from './DrawerMark';
export { InputField } from './InputField';
export { SearchInput } from './SearchInput';
export { SegmentedControl } from './SegmentedControl';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { Switch } from './Switch';
export { RadioGroup } from './RadioGroup';
export { Tabs } from './Tabs';
export { Tooltip } from './Tooltip';
export { ColorPicker } from './ColorPicker';
export { UserPreferences } from './UserPreferences';
export { Collapsible } from './Collapsible';
export { Accordion } from './Accordion';
export { Slider } from './Slider';
export { Progress } from './Progress';
export { Toggle } from './Toggle';
export { ToggleGroup } from './ToggleGroup';
export { Sheet } from './Sheet';
export { Calendar } from './Calendar';
export { DatePicker } from './DatePicker';
export { EmojiPicker, EmojiEmpty, EMOJI_FREQUENT } from './EmojiPicker';
export { EmojiBar } from './EmojiBar';
export { cn } from './cn';
// Static grid — fixed-size cards, fixed gap, flow + wrap, no stretching.
export { CardGrid } from './CardGrid';
// Dynamic grid — fluid cards that stretch to fill uniform `1fr` columns, with a
// built-in search / filter / sort toolbar.
export { DynamicCardGrid } from './DynamicCardGrid';
export { DynamicGridCard } from './DynamicGridCard';
// DynamicNavCards — a self-contained grid of lean navigation tiles. Rides the same
// DynamicCardGrid as the card family but renders its own tile (never a DynamicGridCard);
// each tile's single `title` grows large when short and steps down (2-line cap) as it grows.
// `NavTile` is the single-tile primitive behind the grid — for a lone tile outside
// `DynamicNavCards` (e.g. wrapped in a drag handle), same look, one `DynamicNavCard`.
export { DynamicNavCards, NavTile } from './DynamicNavCards';
