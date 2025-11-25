import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import { PDFFile, PageData } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Loads a PDF file, renders thumbnails for each page, and returns a list of PageData objects.
 */
export const processPdfFile = async (
    file: File
): Promise<{ pdfFile: PDFFile; pages: PageData[] }> => {
    // Read the file as ArrayBuffer
    const originalBuffer = await file.arrayBuffer();
    const fileId = uuidv4();

    // Create a copy for pdf.js to prevent ArrayBuffer detachment
    // pdf.js may transfer the buffer, so we keep the original for pdf-lib
    const bufferCopy = originalBuffer.slice(0);

    // Load using PDF.js for rendering (uses the copy)
    const loadingTask = pdfjsLib.getDocument({ data: bufferCopy });
    const pdf = await loadingTask.promise;

    const pages: PageData[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

            pages.push({
                id: uuidv4(),
                fileId,
                pageIndex: i - 1, // 0-based index for pdf-lib
                rotation: 0,
                thumbnail,
            });
        }
    }

    return {
        pdfFile: {
            id: fileId,
            name: file.name,
            data: originalBuffer, // Use original, not the copy
        },
        pages,
    };
};

/**
 * Generates the final PDF based on the current state of pages.
 */
export const generateFinalPdf = async (
    files: Map<string, ArrayBuffer>,
    pages: PageData[]
): Promise<Uint8Array> => {
    const finalPdf = await PDFDocument.create();

    for (const pageData of pages) {
        const fileBuffer = files.get(pageData.fileId);
        if (!fileBuffer) continue;

        // Clone the buffer to prevent detachment issues
        // pdf-lib may modify the buffer, so we use a copy
        const bufferCopy = fileBuffer.slice(0);

        const sourcePdf = await PDFDocument.load(bufferCopy);
        const [copiedPage] = await finalPdf.copyPages(sourcePdf, [pageData.pageIndex]);

        // Apply rotation
        const existingRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(existingRotation + pageData.rotation));

        finalPdf.addPage(copiedPage);
    }

    return await finalPdf.save();
};
