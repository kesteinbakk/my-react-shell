import { useCallback, useEffect, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Document, Page, pdfjs } from 'react-pdf'
import { cn } from './cn'
import { Button } from './Button'

// Setup pdf.js worker via unpkg to avoid bundler/URL resolution issues in consumer apps.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const DEFAULT_ASPECT = 1.414 // A4 Portrait

export interface PreviewProps {
  /** Controlled open state. */
  open: boolean
  /** Open-state change handler. */
  onOpenChange: (open: boolean) => void
  /** Dialog heading. */
  title: string
  /** The source URL, Blob, or File for the PDF. */
  file: string | Blob | File | null
  /** Optional action buttons or content to render in the header. */
  actions?: React.ReactNode
  /** Whether to show the print button. Defaults to true. */
  showPrintButton?: boolean
  /** Label for the print button. */
  printLabel: string
  /** Label for the close button. */
  closeLabel: string
  /** Classes applied to the content container. */
  className?: string
}

/**
 * A modal PDF Preview component styled like a piece of paper.
 * It takes the full viewport height and adjusts width dynamically.
 * Renders pages using `react-pdf`.
 */
export function Preview({
  open,
  onOpenChange,
  title,
  file,
  actions,
  showPrintButton = true,
  printLabel,
  closeLabel,
  className,
}: PreviewProps) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [aspect, setAspect] = useState(DEFAULT_ASPECT)
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([1]))
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track the container width to fit the pages.
  useEffect(() => {
    if (!open || !containerEl) return
    const update = () => {
      // clientWidth includes padding. Subtract 48px (1.5rem * 2) to prevent horizontal overflow.
      setWidth(Math.max(0, containerEl.clientWidth - 48))
    }
    // Delay first measurement to let modal animate/render
    const timer = setTimeout(update, 50)
    const ro = new ResizeObserver(update)
    ro.observe(containerEl)
    return () => {
      clearTimeout(timer)
      ro.disconnect()
    }
  }, [open, containerEl])

  // IntersectionObserver for lazy loading pages.
  useEffect(() => {
    if (!open || !containerEl) return
    const io = new IntersectionObserver(
      (entries) => {
        const revealed: number[] = []
        for (const e of entries) {
          if (e.isIntersecting) {
            const n = Number((e.target as HTMLElement).dataset.page)
            if (n) revealed.push(n)
          }
        }
        if (revealed.length) {
          setVisiblePages((prev) => {
            const next = new Set(prev)
            for (const n of revealed) next.add(n)
            return next
          })
        }
      },
      { root: containerEl, rootMargin: '600px 0px' },
    )
    observerRef.current = io
    return () => io.disconnect()
  }, [open, containerEl])

  const pageRef = useCallback((node: HTMLDivElement | null) => {
    if (node) observerRef.current?.observe(node)
  }, [])

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    // Reset visible pages when document changes.
    setVisiblePages(new Set([1, 2]))
  }, [])

  const onFirstPageLoad = useCallback(
    (page: { getViewport: (o: { scale: number }) => { width: number; height: number } }) => {
      try {
        const vp = page.getViewport({ scale: 1 })
        if (vp.width > 0) setAspect(vp.height / vp.width)
      } catch {
        /* keep default */
      }
    },
    [],
  )

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const reservedHeight = width ? Math.round(width * aspect) : undefined

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="mrs-preview__overlay" />
        <RadixDialog.Content
          className={cn('mrs-preview', className)}
          onPointerDownOutside={() => onOpenChange(false)}
          onEscapeKeyDown={() => onOpenChange(false)}
          // Set to handle print properly
          aria-modal="true"
        >
          <div className="mrs-preview__header print:hidden">
            <RadixDialog.Title className="mrs-preview__title">{title}</RadixDialog.Title>
            
            <div className="mrs-preview__header-actions">
              {actions}
              {showPrintButton && (
                <Button tone="neutral" onClick={handlePrint} size="sm">
                  {printLabel}
                </Button>
              )}
              <RadixDialog.Close asChild>
                <Button variant="outline" size="sm">
                  {closeLabel}
                </Button>
              </RadixDialog.Close>
            </div>
          </div>
          
          <div className="mrs-preview__body" ref={setContainerEl}>
            {!file ? (
              <div className="mrs-preview__msg">Ingen dokument er valgt.</div>
            ) : (
              <Document
                file={file}
                onLoadSuccess={onLoadSuccess}
                loading={<div className="mrs-preview__msg">Laster dokument...</div>}
                error={<div className="mrs-preview__msg">Kunne ikke laste dokumentet.</div>}
                noData={<div className="mrs-preview__msg">Dokumentet er tomt.</div>}
              >
                {Array.from({ length: numPages }, (_, i) => {
                  const pageNumber = i + 1
                  return (
                    <div
                      className="mrs-preview__page-slot"
                      key={pageNumber}
                      data-page={pageNumber}
                      ref={pageRef}
                      style={reservedHeight ? { minHeight: reservedHeight } : undefined}
                    >
                      {visiblePages.has(pageNumber) && width ? (
                        <Page
                          pageNumber={pageNumber}
                          width={width}
                          onLoadSuccess={pageNumber === 1 ? onFirstPageLoad : undefined}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="mrs-preview__page"
                        />
                      ) : null}
                    </div>
                  )
                })}
              </Document>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
