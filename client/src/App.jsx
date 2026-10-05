import { useEffect, useState } from "react";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./api";

import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs an API action and shows errors in the UI
  const run = async (action) => {
    try {
      setError("");
      await action();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  };

  // Load todos when application starts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setError("");
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load todos");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Add todo
  const handleAdd = (title) =>
    run(async () => {
      const newTodo = await createTodo(title);

      setTodos((prev) => [newTodo, ...prev]);
    });

  // Update todo
  const handleUpdate = (id, data) =>
    run(async () => {
      const updated = await updateTodo(id, data);

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === updated._id ? updated : todo
        )
      );
    });

  // Delete todo
  const handleDelete = (id) =>
    run(async () => {
      await deleteTodo(id);

      setTodos((prev) =>
        prev.filter((todo) => todo._id !== id)
      );
    });

  // Delete all completed todos
  const handleClearDone = () =>
    run(async () => {
      const done = todos.filter(FILTERS.done.test);

      await Promise.all(
        done.map((todo) => deleteTodo(todo._id))
      );

      setTodos((prev) =>
        prev.filter((todo) => !todo.completed)
      );
    });

  const filteredTodos = todos.filter(FILTERS[filter].test);

  return (
    <div className="layout">
      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={setFilter}
        onClearDone={handleClearDone}
      />

      <main className="panel content">
        <header className="content-header">
          <h2>{FILTERS[filter].label}</h2>

          <span className="content-count">
            {filteredTodos.length}{" "}
            {filteredTodos.length === 1 ? "task" : "tasks"}
          </span>
        </header>

        <TodoForm onAdd={handleAdd} />

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <p className="empty">Loading...</p>
        ) : filteredTodos.length === 0 ? (
          <div className="empty">
            <img src="/logo.png" alt="" />

            <p>
              {filter === "done"
                ? "Nothing completed yet"
                : "You're all caught up. Add a task above."}
            </p>
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
