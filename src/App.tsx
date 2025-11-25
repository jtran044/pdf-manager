import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUploadZone } from './components/FileUploadZone';
import { EditorToolbar } from './components/EditorToolbar';
import { PageGrid } from './components/PageGrid';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { useDragAndDrop } from './hooks/useDragAndDrop';

const App: React.FC = () => {
    const {
        pages,
        isProcessing,
        fileInputRef,
        handleFileUpload,
        handleDragEnd,
        removePage,
        rotatePage,
        clearAll,
        handleDownload,
    } = usePdfProcessor();

    const { dragActive, onDragEnter, onDragLeave, resetDragActive } = useDragAndDrop();

    const handleFileUploadWithDragReset = (
        event: React.ChangeEvent<HTMLInputElement> | React.DragEvent
    ) => {
        resetDragActive();
        handleFileUpload(event);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200">
            {/* Header */}
            <Header
                pageCount={pages.length}
                onClearAll={clearAll}
                onDownload={handleDownload}
                isProcessing={isProcessing}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col">
                {/* Upload State */}
                {pages.length === 0 ? (
                    <FileUploadZone
                        onFileUpload={handleFileUploadWithDragReset}
                        isProcessing={isProcessing}
                        dragActive={dragActive}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                    />
                ) : (
                    /* Editor State */
                    <div className="flex flex-col h-full">
                        {/* Hidden file input for "Add More Files" */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="application/pdf"
                            multiple
                            onChange={handleFileUpload}
                        />

                        {/* Toolbar */}
                        <EditorToolbar onAddFiles={() => fileInputRef.current?.click()} />

                        {/* Grid */}
                        <PageGrid
                            pages={pages}
                            onDragEnd={handleDragEnd}
                            onRemovePage={removePage}
                            onRotatePage={rotatePage}
                        />
                    </div>
                )}
            </main>

            {/* Footer / Privacy Note */}
            <Footer />
        </div>
    );
};

export default App;
