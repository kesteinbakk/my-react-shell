import type { ReactNode } from 'react'
import { useShellContextOptional } from './shellContext'
import type { ShellIcon } from './shellContract'

export interface PageSectionProps {
  /** The section title text or element. */
  title: ReactNode
  /** Optional icon: a string key resolved by the shell config's renderIcon, or a custom ReactNode. */
  icon?: Exclude<ReactNode, string> | ShellIcon
  /** Optional action items (elements/buttons) to display on the right side of the header. */
  actions?: ReactNode[]
  /** Custom CSS class name for the card container. */
  className?: string
  /** The main content area of the section. */
  children: ReactNode
}

/**
 * A standalone component rendering a section card matching the App Shell's
 * PageSections card style. Hosts a header (optional icon + title + actions)
 * and a content body surface.
 */
export function PageSection({
  title,
  icon,
  actions,
  className,
  children,
}: PageSectionProps) {
  const shell = useShellContextOptional()
  const renderIcon = shell?.config.renderIcon

  const resolvedIcon =
    typeof icon === 'string' && renderIcon ? renderIcon(icon as ShellIcon, 18) : icon

  return (
    <div className={`mrs-section__card${className ? ` ${className}` : ''}`}>
      <div className="mrs-section__head">
        {resolvedIcon}
        {typeof title === 'string' ? (
          <h3 className="mrs-section__title">{title}</h3>
        ) : (
          title
        )}
        {actions && actions.length > 0 && (
          <div className="mrs-section__actions">
            {actions.map((act, i) => (
              <span key={i}>{act}</span>
            ))}
          </div>
        )}
      </div>
      <div className="mrs-section__body">{children}</div>
    </div>
  )
}
