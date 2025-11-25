import React, { useState, useRef, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  Upload, 
  Download, 
  FilePlus, 
  RefreshCw, 
  Trash, 
  FileText 
} from 'lucide-react';

import { PageData, PDFFile } from './types';
import { processPdfFile, generateFinalPdf } from './utils/pdfWorker';
import { SortablePage } from './components/SortablePage';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [files, setFiles] = useState<Map<string, ArrayBuffer>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

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
      console.error("Error processing PDF", error);
      alert("Failed to process PDF. Please try a valid file.");
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and Drop Handlers for File Upload Zone
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Page Reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Page Actions
  const removePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const rotatePage = useCallback((id: string, direction: 'cw' | 'ccw') => {
    setPages((prev) => prev.map((p) => {
      if (p.id === id) {
        const delta = direction === 'cw' ? 90 : -90;
        const rawRotation = (p.rotation + delta) % 360;
        // Normalize negative angles
        const rotation = rawRotation < 0 ? rawRotation + 360 : rawRotation;
        return { ...p, rotation };
      }
      return p;
    }));
  }, []);

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all pages?")) {
      setPages([]);
      setFiles(new Map());
    }
  };

  // Export PDF
  const handleDownload = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await generateFinalPdf(files, pages);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `merged-document-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <FileText className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">PDF Manager</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {pages.length > 0 && (
               <>
                <span className="text-sm text-slate-400 mr-2 hidden sm:inline">
                  {pages.length} page{pages.length !== 1 ? 's' : ''}
                </span>
                <Button variant="secondary" onClick={clearAll} icon={<Trash size={16}/>}>
                  Clear
                </Button>
                <Button onClick={handleDownload} isLoading={isProcessing} icon={<Download size={16}/>}>
                  Export PDF
                </Button>
               </>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col">
        
        {/* Upload State */}
        {pages.length === 0 ? (
           <div 
             className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 ${
               dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
             }`}
             onDragEnter={onDragEnter}
             onDragLeave={onDragLeave}
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleFileUpload}
           >
             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden" 
               accept="application/pdf" 
               multiple 
               onChange={handleFileUpload}
             />
             <div className="text-center p-12">
               <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 {isProcessing ? (
                   <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                 ) : (
                   <Upload className="w-8 h-8 text-blue-400" />
                 )}
               </div>
               <h3 className="text-lg font-semibold text-slate-200 mb-2">
                 {isProcessing ? 'Processing files...' : 'Upload your PDF files'}
               </h3>
               <p className="text-slate-400 max-w-sm mx-auto mb-6">
                 Drag and drop your PDF documents here, or click to browse. Files are processed locally in your browser.
               </p>
               <Button 
                 disabled={isProcessing} 
                 onClick={() => fileInputRef.current?.click()}
                 variant="secondary"
               >
                 Select Files
               </Button>
             </div>
           </div>
        ) : (
          /* Editor State */
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
               <p className="text-sm text-slate-400 flex-1">
                 Drag pages to reorder. Hover to rotate or delete.
               </p>
               <Button 
                 variant="secondary" 
                 onClick={() => fileInputRef.current?.click()} 
                 icon={<FilePlus size={16}/>}
                 className="text-xs h-8"
               >
                 Add More Files
               </Button>
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept="application/pdf" 
                 multiple 
                 onChange={handleFileUpload}
               />
            </div>

            {/* Grid */}
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                  {pages.map((page, index) => (
                    <SortablePage 
                      key={page.id} 
                      page={page} 
                      index={index} 
                      onRemove={removePage}
                      onRotate={rotatePage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </main>

      {/* Footer / Privacy Note */}
      <footer className="border-t border-slate-800 py-4 bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>Secure Client-Side Processing. Files are never uploaded to a server.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
