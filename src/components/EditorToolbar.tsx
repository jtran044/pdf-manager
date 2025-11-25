import React from 'react';
import { FilePlus } from 'lucide-react';
import { Button } from './Button';

interface EditorToolbarProps {
    onAddFiles: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onAddFiles }) => {
    return (
        <div className="mb-6 flex flex-wrap items-center gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
            <p className="text-sm text-slate-400 flex-1">
                Drag pages to reorder. Hover to rotate or delete.
            </p>
            <Button
                variant="secondary"
                onClick={onAddFiles}
                icon={<FilePlus size={16} />}
                className="text-xs h-8"
            >
                Add More Files
            </Button>
        </div>
    );
};
