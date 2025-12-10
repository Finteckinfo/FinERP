import { ref } from 'vue';
import type { KanbanTask, TaskPosition, DragDropResult } from '../types/kanban';

export function useDragDrop() {
  // State
  const isDragging = ref(false);
  const draggedTask = ref<KanbanTask | null>(null);
  const draggedElement = ref<HTMLElement | null>(null);
  const dropZoneElement = ref<HTMLElement | null>(null);

  // Methods
  const startDrag = (task: KanbanTask, element: HTMLElement) => {
    isDragging.value = true;
    draggedTask.value = task;
    draggedElement.value = element;
    
    // Add visual feedback
    element.classList.add('dragging');
    document.body.classList.add('drag-active');
    
    console.log('[useDragDrop] Started dragging task:', task.id);
  };

  const endDrag = () => {
    if (draggedElement.value) {
      draggedElement.value.classList.remove('dragging');
    }
    
    document.body.classList.remove('drag-active');
    
    // Clear drag state
    isDragging.value = false;
    draggedTask.value = null;
    draggedElement.value = null;
    dropZoneElement.value = null;
    
    console.log('[useDragDrop] Ended drag operation');
  };

  const handleDragOver = (event: DragEvent, columnStatus: string) => {
    event.preventDefault();
    
    if (!isDragging.value || !draggedTask.value) return;
    
    // Don't allow dropping in the same column
    if (draggedTask.value.status === columnStatus) {
      event.dataTransfer!.dropEffect = 'none';
      return;
    }
    
    event.dataTransfer!.dropEffect = 'move';
    
    // Add visual feedback to drop zone
    const dropZone = event.currentTarget as HTMLElement;
    if (dropZone && dropZone !== dropZoneElement.value) {
      // Remove previous drop zone highlight
      if (dropZoneElement.value) {
        dropZoneElement.value.classList.remove('drop-zone-active');
      }
      
      // Add new drop zone highlight
      dropZone.classList.add('drop-zone-active');
      dropZoneElement.value = dropZone;
    }
  };

  const handleDragLeave = (event: DragEvent) => {
    const dropZone = event.currentTarget as HTMLElement;
    
    // Only remove highlight if we're actually leaving the drop zone
    if (!dropZone.contains(event.relatedTarget as Node)) {
      dropZone.classList.remove('drop-zone-active');
      if (dropZoneElement.value === dropZone) {
        dropZoneElement.value = null;
      }
    }
  };

  const handleDrop = (
    event: DragEvent, 
    targetColumnStatus: string,
    targetIndex?: number
  ): DragDropResult | null => {
    event.preventDefault();
    
    if (!isDragging.value || !draggedTask.value) {
      endDrag();
      return null;
    }
    
    // Remove drop zone highlight
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('drop-zone-active');
    
    // Don't allow dropping in the same column
    if (draggedTask.value.status === targetColumnStatus) {
      endDrag();
      return null;
    }
    
    const result: DragDropResult = {
      taskId: draggedTask.value.id,
      sourceColumnId: draggedTask.value.status,
      destinationColumnId: targetColumnStatus,
      sourceIndex: 0, // This would be calculated based on current position
      destinationIndex: targetIndex || 0
    };
    
    console.log('[useDragDrop] Drop completed:', result);
    
    endDrag();
    return result;
  };

  const calculateDropPosition = (
    event: DragEvent,
    columnElement: HTMLElement,
    tasks: KanbanTask[]
  ): number => {
    const taskCards = columnElement.querySelectorAll('.kanban-task-card');
    const mouseY = event.clientY;
    
    let dropIndex = tasks.length; // Default to end of list
    
    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i] as HTMLElement;
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;
      
      if (mouseY < cardMiddle) {
        dropIndex = i;
        break;
      }
    }
    
    return dropIndex;
  };

  const getTaskPosition = (
    taskId: string,
    newStatus: string,
    newIndex: number,
    departmentId?: string
  ): TaskPosition => {
    return {
      taskId,
      status: newStatus as any,
      order: newIndex,
      departmentId
    };
  };

  // Touch support for mobile
  const handleTouchStart = (task: KanbanTask, element: HTMLElement) => {
    // Add touch feedback
    element.classList.add('touch-dragging');
    startDrag(task, element);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging.value || !draggedTask.value) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the column element
    const columnElement = elementBelow?.closest('.kanban-column');
    if (columnElement) {
      const columnStatus = columnElement.getAttribute('data-status');
      if (columnStatus && columnStatus !== draggedTask.value.status) {
        // Add visual feedback for mobile
        columnElement.classList.add('drop-zone-active');
        
        // Remove previous highlights
        document.querySelectorAll('.kanban-column.drop-zone-active').forEach(el => {
          if (el !== columnElement) {
            el.classList.remove('drop-zone-active');
          }
        });
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!isDragging.value || !draggedTask.value) {
      endDrag();
      return null;
    }
    
    const touch = event.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const columnElement = elementBelow?.closest('.kanban-column');
    
    // Clean up touch feedback
    if (draggedElement.value) {
      draggedElement.value.classList.remove('touch-dragging');
    }
    
    // Remove all drop zone highlights
    document.querySelectorAll('.kanban-column.drop-zone-active').forEach(el => {
      el.classList.remove('drop-zone-active');
    });
    
    if (columnElement) {
      const columnStatus = columnElement.getAttribute('data-status');
      if (columnStatus && columnStatus !== draggedTask.value.status) {
        const result: DragDropResult = {
          taskId: draggedTask.value.id,
          sourceColumnId: draggedTask.value.status,
          destinationColumnId: columnStatus,
          sourceIndex: 0,
          destinationIndex: 0
        };
        
        endDrag();
        return result;
      }
    }
    
    endDrag();
    return null;
  };

  return {
    // State
    isDragging,
    draggedTask,
    
    // Methods
    startDrag,
    endDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    calculateDropPosition,
    getTaskPosition,
    
    // Touch support
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
