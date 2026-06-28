import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from './cn';
import { Button } from './Button';
// Setup pdf.js worker.
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
const DEFAULT_ASPECT = 1.414; // A4 Portrait
/**
 * A modal PDF Preview component styled like a piece of paper.
 * It takes the full viewport height and adjusts width dynamically.
 * Renders pages using `react-pdf`.
 */
export function Preview({ open, onOpenChange, title, file, headerContent, className, }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [aspect, setAspect] = useState(DEFAULT_ASPECT);
    const [visiblePages, setVisiblePages] = useState(() => new Set([1]));
    const observerRef = useRef(null);
    // Track the container width to fit the pages.
    useEffect(() => {
        if (!open)
            return;
        const el = containerRef.current;
        if (!el)
            return;
        const update = () => setWidth(el.clientWidth);
        // Delay first measurement to let modal animate/render
        const timer = setTimeout(update, 50);
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            clearTimeout(timer);
            ro.disconnect();
        };
    }, [open]);
    // IntersectionObserver for lazy loading pages.
    useEffect(() => {
        if (!open)
            return;
        const root = containerRef.current;
        if (!root)
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
        }, { root, rootMargin: '600px 0px' });
        observerRef.current = io;
        return () => io.disconnect();
    }, [open]);
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
    const reservedHeight = width ? Math.round(width * aspect) : undefined;
    return (_jsx(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(RadixDialog.Portal, { children: [_jsx(RadixDialog.Overlay, { className: "mrs-preview__overlay" }), _jsxs(RadixDialog.Content, { className: cn('mrs-preview', className), onPointerDownOutside: () => onOpenChange(false), onEscapeKeyDown: () => onOpenChange(false), "aria-modal": "true", children: [_jsxs("div", { className: "mrs-preview__header print:hidden", children: [_jsx(RadixDialog.Title, { className: "mrs-preview__title", children: title }), _jsxs("div", { className: "mrs-preview__header-actions", children: [headerContent, _jsx(Button, { tone: "neutral", onClick: handlePrint, size: "sm", children: "Skriv ut" }), _jsx(RadixDialog.Close, { className: "mrs-dialog__close", "aria-label": "Lukk", children: _jsxs("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }) })] })] }), _jsx("div", { className: "mrs-preview__body", ref: containerRef, children: !file ? (_jsx("div", { className: "mrs-preview__msg", children: "Ingen dokument er valgt." })) : (_jsx(Document, { file: file, onLoadSuccess: onLoadSuccess, loading: _jsx("div", { className: "mrs-preview__msg", children: "Laster dokument..." }), error: _jsx("div", { className: "mrs-preview__msg", children: "Kunne ikke laste dokumentet." }), noData: _jsx("div", { className: "mrs-preview__msg", children: "Dokumentet er tomt." }), children: Array.from({ length: numPages }, (_, i) => {
                                    const pageNumber = i + 1;
                                    return (_jsx("div", { className: "mrs-preview__page-slot", "data-page": pageNumber, ref: pageRef, style: reservedHeight ? { minHeight: reservedHeight } : undefined, children: visiblePages.has(pageNumber) && width ? (_jsx(Page, { pageNumber: pageNumber, width: width, onLoadSuccess: pageNumber === 1 ? onFirstPageLoad : undefined, renderTextLayer: false, renderAnnotationLayer: false, className: "mrs-preview__page" })) : null }, pageNumber));
                                }) })) })] })] }) }));
}
