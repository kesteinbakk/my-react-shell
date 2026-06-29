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
  /** Label shown when the document is loading. */
  loadingLabel: string
  /** Label shown when document loading fails. */
  errorLabel: string
  /** Label shown when the document has no data/pages. */
  noDataLabel: string
  /** Label shown when no file is provided. */
  noFileLabel: string
  /** 1-based page to open scrolled to. Omit or `≤ 1` opens at the top. Re-aligns
   *  over a short window as pages paint, so it lands accurately on lazy-rendered
   *  documents. */
  initialPage?: number
  /**
   * Show the loading state in the body even when no `file` is set yet — so the
   * modal + backdrop can open instantly while the consumer fetches the document
   * (e.g. an auth-gated blob). Overrides the no-file state; once the file arrives
   * pass `loading={false}` with the `file`.
   */
  loading?: boolean
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
  loadingLabel,
  errorLabel,
  noDataLabel,
  noFileLabel,
  initialPage,
  loading = false,
  className,
}: PreviewProps) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [aspect, setAspect] = useState(DEFAULT_ASPECT)
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([1]))
  const observerRef = useRef<IntersectionObserver | null>(null)
  const didScrollRef = useRef(false)
  const scrollTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // A new file is a new document — allow the initial-page scroll to run again.
  useEffect(() => {
    didScrollRef.current = false
  }, [file])

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

  // Scroll to `initialPage` once layout is ready, then re-align over a short window
  // (the layout shifts as pages paint / fonts load / the scrollbar appears, so a
  // single align lands wrong). setTimeout (not rAF) so it still fires when the tab
  // isn't foregrounded. Runs once per document.
  useEffect(() => {
    if (didScrollRef.current) return
    if (!initialPage || initialPage <= 1 || !numPages || !width || !containerEl) return
    const n = Math.min(Math.max(1, Math.floor(initialPage)), numPages)
    didScrollRef.current = true
    setVisiblePages((prev) => (prev.has(n) ? prev : new Set(prev).add(n)))

    const align = () => {
      const target = containerEl.querySelector<HTMLElement>(`[data-page="${n}"]`)
      if (!target) return
      const delta =
        target.getBoundingClientRect().top - containerEl.getBoundingClientRect().top
      if (Math.abs(delta) > 1) containerEl.scrollTop += delta
    }
    scrollTimersRef.current = [0, 60, 150, 300, 500, 800].map((ms) =>
      setTimeout(align, ms),
    )
  }, [initialPage, numPages, width, containerEl])

  // Clear any pending re-align timers on unmount.
  useEffect(() => () => scrollTimersRef.current.forEach(clearTimeout), [])

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
            {loading ? (
              <div className="mrs-preview__msg">{loadingLabel}</div>
            ) : !file ? (
              <div className="mrs-preview__msg">{noFileLabel}</div>
            ) : (
              <Document
                file={file}
                onLoadSuccess={onLoadSuccess}
                loading={<div className="mrs-preview__msg">{loadingLabel}</div>}
                error={<div className="mrs-preview__msg">{errorLabel}</div>}
                noData={<div className="mrs-preview__msg">{noDataLabel}</div>}
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
