import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from './cn';
import { Button } from './Button';
// Setup pdf.js worker via unpkg to avoid bundler/URL resolution issues in consumer apps.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const DEFAULT_ASPECT = 1.414; // A4 Portrait
/**
 * A modal PDF Preview component styled like a piece of paper.
 * It takes the full viewport height and adjusts width dynamically.
 * Renders pages using `react-pdf`.
 */
export function Preview({ open, onOpenChange, title, file, actions, showPrintButton = true, printLabel, closeLabel, loadingLabel, errorLabel, noDataLabel, noFileLabel, initialPage, loading = false, className, }) {
    const [containerEl, setContainerEl] = useState(null);
    const [width, setWidth] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [aspect, setAspect] = useState(DEFAULT_ASPECT);
    const [visiblePages, setVisiblePages] = useState(() => new Set([1]));
    const observerRef = useRef(null);
    const didScrollRef = useRef(false);
    const scrollTimersRef = useRef([]);
    // A new file is a new document — allow the initial-page scroll to run again.
    useEffect(() => {
        didScrollRef.current = false;
    }, [file]);
    // Track the container width to fit the pages.
    useEffect(() => {
        if (!open || !containerEl)
            return;
        const update = () => {
            // clientWidth includes padding. Subtract 48px (1.5rem * 2) to prevent horizontal overflow.
            setWidth(Math.max(0, containerEl.clientWidth - 48));
        };
        // Delay first measurement to let modal animate/render
        const timer = setTimeout(update, 50);
        const ro = new ResizeObserver(update);
        ro.observe(containerEl);
        return () => {
            clearTimeout(timer);
            ro.disconnect();
        };
    }, [open, containerEl]);
    // IntersectionObserver for lazy loading pages.
    useEffect(() => {
        if (!open || !containerEl)
            return;
        const io = new IntersectionObserver((entries) => {
            const revealed = [];
            for (const e of entries) {
                if (e.isIntersecting) {
                    const n = Number(e.target.dataset.page);
                    if (n)
                        revealed.push(n);
                }
            }
            if (revealed.length) {
                setVisiblePages((prev) => {
                    const next = new Set(prev);
                    for (const n of revealed)
                        next.add(n);
                    return next;
                });
            }
        }, { root: containerEl, rootMargin: '600px 0px' });
        observerRef.current = io;
        return () => io.disconnect();
    }, [open, containerEl]);
    const pageRef = useCallback((node) => {
        if (node)
            observerRef.current?.observe(node);
    }, []);
    const onLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        // Reset visible pages when document changes.
        setVisiblePages(new Set([1, 2]));
    }, []);
    const onFirstPageLoad = useCallback((page) => {
        try {
            const vp = page.getViewport({ scale: 1 });
            if (vp.width > 0)
                setAspect(vp.height / vp.width);
        }
        catch {
            /* keep default */
        }
    }, []);
    const handlePrint = useCallback(() => {
        window.print();
    }, []);
    // Scroll to `initialPage` once layout is ready, then re-align over a short window
    // (the layout shifts as pages paint / fonts load / the scrollbar appears, so a
    // single align lands wrong). setTimeout (not rAF) so it still fires when the tab
    // isn't foregrounded. Runs once per document.
    useEffect(() => {
        if (didScrollRef.current)
            return;
        if (!initialPage || initialPage <= 1 || !numPages || !width || !containerEl)
            return;
        const n = Math.min(Math.max(1, Math.floor(initialPage)), numPages);
        didScrollRef.current = true;
        setVisiblePages((prev) => (prev.has(n) ? prev : new Set(prev).add(n)));
        const align = () => {
            const target = containerEl.querySelector(`[data-page="${n}"]`);
            if (!target)
                return;
            const delta = target.getBoundingClientRect().top - containerEl.getBoundingClientRect().top;
            if (Math.abs(delta) > 1)
                containerEl.scrollTop += delta;
        };
        scrollTimersRef.current = [0, 60, 150, 300, 500, 800].map((ms) => setTimeout(align, ms));
    }, [initialPage, numPages, width, containerEl]);
    // Clear any pending re-align timers on unmount.
    useEffect(() => () => scrollTimersRef.current.forEach(clearTimeout), []);
    const reservedHeight = width ? Math.round(width * aspect) : undefined;
    return (_jsx(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(RadixDialog.Portal, { children: [_jsx(RadixDialog.Overlay, { className: "mrs-preview__overlay" }), _jsxs(RadixDialog.Content, { className: cn('mrs-preview', className), onPointerDownOutside: () => onOpenChange(false), onEscapeKeyDown: () => onOpenChange(false), "aria-modal": "true", children: [_jsxs("div", { className: "mrs-preview__header print:hidden", children: [_jsx(RadixDialog.Title, { className: "mrs-preview__title", children: title }), _jsxs("div", { className: "mrs-preview__header-actions", children: [actions, showPrintButton && (_jsx(Button, { tone: "neutral", onClick: handlePrint, size: "sm", children: printLabel })), _jsx(RadixDialog.Close, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", children: closeLabel }) })] })] }), _jsx("div", { className: "mrs-preview__body", ref: setContainerEl, children: loading ? (_jsx("div", { className: "mrs-preview__msg", children: loadingLabel })) : !file ? (_jsx("div", { className: "mrs-preview__msg", children: noFileLabel })) : (_jsx(Document, { file: file, onLoadSuccess: onLoadSuccess, loading: _jsx("div", { className: "mrs-preview__msg", children: loadingLabel }), error: _jsx("div", { className: "mrs-preview__msg", children: errorLabel }), noData: _jsx("div", { className: "mrs-preview__msg", children: noDataLabel }), children: Array.from({ length: numPages }, (_, i) => {
                                    const pageNumber = i + 1;
                                    return (_jsx("div", { className: "mrs-preview__page-slot", "data-page": pageNumber, ref: pageRef, style: reservedHeight ? { minHeight: reservedHeight } : undefined, children: visiblePages.has(pageNumber) && width ? (_jsx(Page, { pageNumber: pageNumber, width: width, onLoadSuccess: pageNumber === 1 ? onFirstPageLoad : undefined, renderTextLayer: false, renderAnnotationLayer: false, className: "mrs-preview__page" })) : null }, pageNumber));
                                }) })) })] })] }) }));
}
