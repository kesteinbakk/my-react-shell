import { isValidElement } from 'react';
/**
 * Discriminate the `{ content, placement }` icon config from a bare `ReactNode` shorthand.
 * A config is a plain object carrying `content`; a React element, array, or primitive is the
 * shorthand (implies `{ content: icon, placement: 'title' }`).
 */
export function isIconConfig(icon) {
    return typeof icon === 'object' && icon !== null && !isValidElement(icon) && !Array.isArray(icon) && 'content' in icon;
}
