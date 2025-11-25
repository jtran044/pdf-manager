import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PageData, RotationDirection } from '../types';
import { SortablePage } from './SortablePage';

interface PageGridProps {
    pages: PageData[];
    onDragEnd: (event: DragEndEvent) => void;
    onRemovePage: (id: string) => void;
    onRotatePage: (id: string, direction: RotationDirection) => void;
}

export const PageGrid: React.FC<PageGridProps> = ({
    pages,
    onDragEnd,
    onRemovePage,
    onRotatePage,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        onDragEnd(event);
    };

    const activePage = activeId ? pages.find(p => p.id === activeId) : null;

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                    {pages.map((page, index) => (
                        <SortablePage
                            key={page.id}
                            page={page}
                            index={index}
                            onRemove={onRemovePage}
                            onRotate={onRotatePage}
                        />
                    ))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activePage ? (
                    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-2xl border-2 border-blue-500 opacity-90">
                        <div className="aspect-[3/4] flex items-center justify-center bg-slate-900 p-2">
                            <img
                                src={activePage.thumbnail}
                                alt="Dragging page"
                                className="max-w-full max-h-full object-contain shadow-sm bg-white"
                                style={{ transform: `rotate(${activePage.rotation}deg)` }}
                            />
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
