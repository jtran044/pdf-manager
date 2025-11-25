import { useState, useCallback, useRef } from 'react';
import { PageData, RotationDirection } from '../types';
import { processPdfFile, generateFinalPdf } from '../utils/pdfWorker';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export const usePdfProcessor = () => {
    const [pages, setPages] = useState<PageData[]>([]);
    const [files, setFiles] = useState<Map<string, ArrayBuffer>>(new Map());
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle File Upload
    const handleFileUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let selectedFiles: FileList | null = null;

            if ('dataTransfer' in event) {
                selectedFiles = event.dataTransfer.files;
            } else {
                selectedFiles = (event as React.ChangeEvent<HTMLInputElement>).target.files;
            }

            if (!selectedFiles || selectedFiles.length === 0) return;

            setIsProcessing(true);

            try {
                const newPages: PageData[] = [];
                const newFiles = new Map(files);

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    if (file.type !== 'application/pdf') {
                        console.warn(`Skipping non-PDF file: ${file.name}`);
                        continue;
                    }

                    const { pdfFile, pages: filePages } = await processPdfFile(file);
                    newFiles.set(pdfFile.id, pdfFile.data);
                    newPages.push(...filePages);
                }

                setFiles(newFiles);
                setPages((prev) => [...prev, ...newPages]);
            } catch (error) {
                console.error('Error processing PDF', error);
                alert('Failed to process PDF. Please try a valid file.');
            } finally {
                setIsProcessing(false);
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        },
        [files]
    );

    // Page Reordering
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);

    // Page Actions
    const removePage = useCallback((id: string) => {
        setPages((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const rotatePage = useCallback((id: string, direction: RotationDirection) => {
        setPages((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    const delta = direction === 'cw' ? 90 : -90;
                    const rawRotation = (p.rotation + delta) % 360;
                    // Normalize negative angles
                    const rotation = rawRotation < 0 ? rawRotation + 360 : rawRotation;
                    return { ...p, rotation };
                }
                return p;
            })
        );
    }, []);

    const clearAll = useCallback(() => {
        if (confirm('Are you sure you want to clear all pages?')) {
            setPages([]);
            setFiles(new Map());
        }
    }, []);

    // Export PDF
    const handleDownload = useCallback(async () => {
        if (pages.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfBytes = await generateFinalPdf(files, pages);
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `merged-document-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert('Failed to generate PDF');
        } finally {
            setIsProcessing(false);
        }
    }, [files, pages]);

    return {
        pages,
        isProcessing,
        fileInputRef,
        handleFileUpload,
        handleDragEnd,
        removePage,
        rotatePage,
        clearAll,
        handleDownload,
    };
};
