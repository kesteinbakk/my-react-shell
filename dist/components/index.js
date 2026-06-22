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
// this sub-path, so the package barrel stays the theme core. The kit's canonical
// doc is docs/specifications/api-reference.md (it ships no separate guide).
export { Alert } from './Alert';
export { Spinner, PageSpinner, SectionSpinner } from './Spinner';
export { EmptyState } from './EmptyState';
export { InfoBox } from './InfoBox';
export { ConfirmDialog } from './ConfirmDialog';
export { ToastProvider, useToast } from './Toast';
export { ActionButton, ActionButtonGroup, actionPresets } from './ActionButton';
export { Badge } from './Badge';
export { Chip, ChipGroup } from './Chip';
export { Avatar, AvatarGroup } from './Avatar';
export { Table } from './Table';
export { PhiCard, PHI } from './PhiCard';
export { StatCard } from './StatCard';
export { InputField } from './InputField';
export { SegmentedControl } from './SegmentedControl';
export { Select } from './Select';
export { ColorPicker } from './ColorPicker';
export { UserPreferences } from './UserPreferences';
export { cn } from './cn';
