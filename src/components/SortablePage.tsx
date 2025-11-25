import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, RotateCw, RotateCcw } from 'lucide-react';
import { PageData, RotationDirection } from '../types';
import { clsx } from 'clsx';

interface SortablePageProps {
    page: PageData;
    index: number;
    onRemove: (id: string) => void;
    onRotate: (id: string, direction: RotationDirection) => void;
}

export const SortablePage: React.FC<SortablePageProps> = ({
    page,
    index,
    onRemove,
    onRotate,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: page.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                'relative group bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-700',
                isDragging && 'opacity-50 ring-2 ring-blue-500 scale-105'
            )}
        >
            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 z-10 bg-slate-900/80 text-xs text-white px-2 py-1 rounded backdrop-blur-sm">
                {index + 1}
            </div>

            {/* Thumbnail */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing aspect-[3/4] flex items-center justify-center bg-slate-900 p-2"
            >
                <img
                    src={page.thumbnail}
                    alt={`Page ${index + 1}`}
                    className="max-w-full max-h-full object-contain shadow-sm bg-white"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                    draggable={false}
                />
            </div>

            {/* Hover Controls - pointer-events-none on overlay, auto on buttons */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => onRotate(page.id, 'ccw')}
                        className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 text-white transition-colors"
                        title="Rotate Left"
                        aria-label="Rotate page counter-clockwise"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={() => onRotate(page.id, 'cw')}
                        className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 text-white transition-colors"
                        title="Rotate Right"
                        aria-label="Rotate page clockwise"
                    >
                        <RotateCw size={16} />
                    </button>
                </div>
                <button
                    onClick={() => onRemove(page.id)}
                    className="p-2 bg-slate-800 rounded-full hover:bg-red-600 text-white transition-colors mt-2 pointer-events-auto"
                    title="Delete Page"
                    aria-label="Delete page"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
