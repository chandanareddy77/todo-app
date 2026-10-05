const mongoose = require("mongoose");
const Todo = require("../models/Todo");

// GET /api/todos
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });

    res.status(200).json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({
      message: "Failed to fetch todos",
    });
  }
};

// POST /api/todos
const createTodo = async (req, res) => {
  try {
    const { title } = req.body;

    // Validate title
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const todo = await Todo.create({
      title: title.trim(),
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error("Error creating todo:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Failed to create todo",
    });
  }
};

// PUT /api/todos/:id
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      });
    }

    const updates = {};

    // Only allow fields that actually belong to a todo
    if (req.body.title !== undefined) {
      if (
        typeof req.body.title !== "string" ||
        !req.body.title.trim()
      ) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      updates.title = req.body.title.trim();
    }

    if (req.body.completed !== undefined) {
      if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be a boolean",
        });
      }

      updates.completed = req.body.completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    const todo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Failed to update todo",
    });
  }
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      });
    }

    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully",
      todo,
    });
  } catch (err) {
    console.error("Error deleting todo:", err);

    res.status(500).json({
      message: "Failed to delete todo",
    });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
