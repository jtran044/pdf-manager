import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
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
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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
        </DndContext>
    );
};
