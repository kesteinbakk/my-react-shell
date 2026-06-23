import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const inputVariants = cva('mrs-input', {
    variants: {
        inputSize: {
            sm: 'mrs-input--sm',
            md: 'mrs-input--md',
            lg: 'mrs-input--lg',
        },
        invalid: { true: 'mrs-input--invalid' },
    },
    defaultVariants: { inputSize: 'md' },
});
/**
 * Un-opinionated native `<input>` wrapper. All native input props (`type`, `value`,
 * `onChange`, `placeholder`, `disabled`, `aria-*`, …) pass straight through; the only
 * additions are `invalid` (error styling + `aria-invalid`) and `inputSize`.
 *
 * ```tsx
 * <Input placeholder="Email" />
 * <Input type="password" inputSize="lg" />
 * <Input invalid value={v} onChange={(e) => setV(e.target.value)} />
 * ```
 */
export function Input({ invalid = false, inputSize = 'md', className, ...rest }) {
    return (_jsx("input", { className: cn(inputVariants({ inputSize, invalid: invalid || undefined }), className), "aria-invalid": invalid || undefined, ...rest }));
}
