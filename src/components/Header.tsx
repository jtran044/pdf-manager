import React from 'react';
import { FileText, Download, Trash } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
    pageCount: number;
    onClearAll: () => void;
    onDownload: () => void;
    isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    pageCount,
    onClearAll,
    onDownload,
    isProcessing,
}) => {
    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                        <FileText className="text-white h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-tight">PDF Manager</h1>
                </div>

                <div className="flex items-center gap-3">
                    {pageCount > 0 && (
                        <>
                            <span className="text-sm text-slate-400 mr-2 hidden sm:inline">
                                {pageCount} page{pageCount !== 1 ? 's' : ''}
                            </span>
                            <Button variant="secondary" onClick={onClearAll} icon={<Trash size={16} />}>
                                Clear
                            </Button>
                            <Button onClick={onDownload} isLoading={isProcessing} icon={<Download size={16} />}>
                                Export PDF
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
