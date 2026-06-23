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
export { Button } from './Button';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Label } from './Label';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Separator } from './Separator';
export { Skeleton } from './Skeleton';
export { Dialog } from './Dialog';
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
export { Collapsible } from './Collapsible';
export { Accordion } from './Accordion';
export { cn } from './cn';
