import { act, useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, ID, Task } from "../types";
import { generateId } from "../utils/generateId";
import ColumnsContainer from "./ColumnsContainer";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const columnIds = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );

  return (
    <div className="w-full min-h-screen flex items-center gap-4 px-[40px] overflow-y-hidden overflow-x-auto">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4 m-auto">
          <SortableContext items={columnIds}>
            {columns.map((column) => (
              <ColumnsContainer
                key={column.id}
                column={column}
                updateColumn={updateColumn}
                deleteColumn={deleteColumn}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            ))}
          </SortableContext>
          <button
            onClick={createColumn}
            className="h-[60px] w-[350px] min-w-[350px] bg-columnBackgroundColor flex items-center gap-2 p-4 rounded-md hover:ring-2 hover:ring-rose-500"
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnsContainer
                column={activeColumn}
                updateColumn={updateColumn}
                deleteColumn={deleteColumn}
                tasks={tasks.filter((task) => task.id === activeColumn.id)}
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  // Columns
  function createColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function updateColumn(id: ID, title: string) {
    const newColumns = columns.map((column) => {
      if (column.id !== id) return column;

      column.title = title;
      return { ...column, title };
    });

    setColumns(newColumns);
  }

  function deleteColumn(id: ID) {
    const newColumns = columns.filter((column) => column.id !== id);
    setColumns(newColumns);
  }

  // Tasks
  function createTask(columnId: ID, tasksCount: number) {
    const taskToAdd: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasksCount + 1}`,
    };
    setTasks([...tasks, taskToAdd]);
  }

  function updateTask(id: ID, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;

      task.content = content;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function deleteTask(id: ID) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  // Drag Events
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      const activeColumn = event.active.data.current.column;
      setActiveColumn(activeColumn);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      const activeTask = event.active.data.current.task;
      setActiveTask(activeTask);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId);
        const overIndex = tasks.findIndex((task) => task.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId);

        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
};

export default KanbanBoard;
