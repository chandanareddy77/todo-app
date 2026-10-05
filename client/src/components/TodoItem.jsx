import { useEffect, useState } from "react";

function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.title);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(todo.title);
  }, [todo.title]);

  const handleSave = async () => {
    const title = text.trim();

    if (!title) {
      setText(todo.title);
      setIsEditing(false);
      return;
    }

    if (title === todo.title) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);

      await onUpdate(todo._id, { title });

      setIsEditing(false);
    } catch {
      // Error is displayed by App
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setText(todo.title);
    setIsEditing(false);
  };

  const handleToggle = async () => {
    if (saving) return;

    try {
      setSaving(true);

      await onUpdate(todo._id, {
        completed: !todo.completed,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li
      className={`todo-item ${
        todo.completed ? "completed" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={saving}
        aria-label={`Mark "${todo.title}" as ${
          todo.completed ? "not done" : "done"
        }`}
      />

      {isEditing ? (
        <input
          className="edit-input"
          value={text}
          maxLength={200}
          disabled={saving}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            }

            if (e.key === "Escape") {
              handleCancel();
            }
          }}
          autoFocus
        />
      ) : (
        <div
          className="todo-text"
          onDoubleClick={() => setIsEditing(true)}
        >
          <span className="title">{todo.title}</span>

          <span className="meta">
            Added{" "}
            {new Date(todo.createdAt).toLocaleDateString(
              undefined,
              {
                day: "numeric",
                month: "short",
              }
            )}
          </span>
        </div>
      )}

      {!isEditing && (
        <div className="actions">
          <button
            onClick={() => setIsEditing(true)}
            disabled={saving}
          >
            Edit
          </button>

          <button
            className="delete"
            onClick={() => onDelete(todo._id)}
            disabled={saving}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;
