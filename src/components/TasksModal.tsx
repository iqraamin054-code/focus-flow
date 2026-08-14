import React, { useState } from 'react';
import { Task } from '../types/focus';
import { actions } from '../utils/store';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  const [inputTitle, setInputTitle] = useState<string>('');

  if (!isOpen) return null;

  const handleAdd = () => {
    const title = inputTitle.trim();
    if (title) {
      actions.addTask(title);
      setInputTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div id="modal-tasks" className="modal-wrapper active modal-full">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>📝</span> Today's Tasks
          </h2>
          <span
            id="tasks-fraction"
            className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground tabular-nums"
          >
            {doneCount}/{tasks.length}
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            id="task-input"
            type="text"
            placeholder="Add a task..."
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition"
          />
          <button
            id="task-add-btn"
            onClick={handleAdd}
            className="rounded-xl bg-primary text-primary-foreground px-4 text-sm font-bold hover:opacity-90 transition cursor-pointer"
          >
            Add
          </button>
        </div>

        <ul id="tasks-list" className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <li className="text-sm text-muted-foreground italic text-center py-6">
              Quiet here. Add your first task.
            </li>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition group animate-[fade-in-up_0.2s_ease-out]"
              >
                <button
                  onClick={() => actions.toggleTask(task.id)}
                  className={`h-5 w-5 rounded-md border-2 grid place-items-center transition cursor-pointer ${
                    task.done ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  {task.done && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.done ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => actions.removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition px-1 cursor-pointer"
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
