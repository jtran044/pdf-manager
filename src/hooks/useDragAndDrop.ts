import { useState } from 'react';

export const useDragAndDrop = () => {
    const [dragActive, setDragActive] = useState(false);

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

    const resetDragActive = () => {
        setDragActive(false);
    };

    return {
        dragActive,
        onDragEnter,
        onDragLeave,
        resetDragActive,
    };
};
