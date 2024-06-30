import { useMemo, useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Column, ID, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import PlusIcon from "../icons/PlusIcon";
import { SortableContext } from "@dnd-kit/sortable";

type Props = {
  column: Column;
  updateColumn: (id: ID, title: string) => void;
  deleteColumn: (id: ID) => void;

  tasks: Task[];
  createTask: (columnId: ID, tasksCount: number) => void;
  updateTask: (id: ID, content: string) => void;
  deleteTask: (id: ID) => void;
};

const ColumnsContainer = ({
  column,
  updateColumn,
  deleteColumn,
  tasks,
  createTask,
  updateTask,
  deleteTask,
}: Props) => {
  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor w-[350px] h-[500px] min-h-[500px] rounded-md ring-2 ring-rose-500 opacity-60"
      />
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] min-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor border-4 border-columnBackgroundColor rounded-md p-2.5 font-bold flex items-center justify-between cursor-grab"
      >
        <div className="flex items-center gap-2">
          <div className="bg-columnBackgroundColor px-2 py-1 rounded-full">
            {tasks.length}
          </div>
          {editMode ? (
            <input
              type="text"
              autoFocus
              className="bg-black px-2 outline-none ring-2 ring-rose-500 rounded-md"
              value={column.title}
              onChange={(event) => updateColumn(column.id, event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key !== "Enter" ||
                  (event.key === "Enter" && column.title === "")
                )
                  return;
                else if (event.key === "Enter") setEditMode(false);
              }}
              onBlur={() => {
                if (column.title !== "") {
                  setEditMode(false);
                }
              }}
            />
          ) : (
            <div onClick={() => setEditMode(true)}>{column.title}</div>
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="stroke-white opacity-40 hover:opacity-100 bg-columnBackgroundColor px-1.5 py-1 rounded-md"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Column Content */}
      <div className="flex flex-grow flex-col overflow-y-auto overflow-x-hidden gap-4">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <button
        onClick={() => createTask(column.id, tasks.length)}
        className="flex gap-2 p-2.5 border-4 border-columnBackgroundColor hover:bg-mainBackgroundColor rounded-md active:bg-black"
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
};

export default ColumnsContainer;
