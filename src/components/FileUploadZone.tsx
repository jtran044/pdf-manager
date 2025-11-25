import React, { useRef } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface FileUploadZoneProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => void;
    isProcessing: boolean;
    dragActive: boolean;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFileUpload,
    isProcessing,
    dragActive,
    onDragEnter,
    onDragLeave,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
                }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onFileUpload}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                multiple
                onChange={onFileUpload}
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
                    Drag and drop your PDF documents here, or click to browse. Files are processed locally
                    in your browser.
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
    );
};
