import * as pdfjsModule from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import { PDFFile, PageData } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Handle both ESM default export and namespace import
const pdfjsLib = (pdfjsModule as any).default ?? pdfjsModule;

// Configure PDF.js worker using CDN
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

/**
 * Loads a PDF file, renders thumbnails for each page, and returns a list of PageData objects.
 */
export const processPdfFile = async (
    file: File
): Promise<{ pdfFile: PDFFile; pages: PageData[] }> => {
    const arrayBuffer = await file.arrayBuffer();
    const fileId = uuidv4();

    // Load using PDF.js for rendering
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
            data: arrayBuffer,
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

        const sourcePdf = await PDFDocument.load(fileBuffer);
        const [copiedPage] = await finalPdf.copyPages(sourcePdf, [pageData.pageIndex]);

        // Apply rotation
        const existingRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(existingRotation + pageData.rotation));

        finalPdf.addPage(copiedPage);
    }

    return await finalPdf.save();
};
