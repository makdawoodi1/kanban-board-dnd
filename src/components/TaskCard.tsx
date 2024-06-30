import { useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { ID, Task } from "../types";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: Task;
  updateTask: (id: ID, conten: string) => void;
  deleteTask: (id: ID) => void;
};

const TaskCard = ({ task, updateTask, deleteTask }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const toggleEditMode = () => setEditMode((prev) => !prev);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-4 h-[100px] min-h-[100px] border-4 border-columnBackgroundColor rounded-lg w-full ring-2 ring-inset ring-rose-500 opacity-50 task"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={toggleEditMode}
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
        className="bg-mainBackgroundColor p-2.5 rounded-md overflow-x-hidden overflow-y-auto h-[100px] min-h-[100px] cursor-grab border-4 border-columnBackgroundColor hover:ring-2 hover:ring-inset hover:ring-rose-500 relative flex items-center rounded-xl
         task"
      >
        <textarea
          autoFocus
          placeholder="Task content here"
          className="my-auto h-[90%] w-full resize-none border-none rounded text-white focus:outline-none overflow-y-auto overflow-x-hidden bg-transparent"
          value={task.content}
          onBlur={toggleEditMode}
          onChange={(event) => updateTask(task.id, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) return;
            else if (event.key === "Enter") toggleEditMode();
          }}
        ></textarea>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="bg-mainBackgroundColor p-4 h-[100px] min-h-[100px] border-4 border-columnBackgroundColor rounded-lg flex relative w-full cursor-grab task"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      {isMouseOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 stroke-white bg-columnBackgroundColor px-1.5 py-1 rounded-md opacity-50 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
