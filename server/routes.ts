import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertHabitSchema, insertCompletionSchema, insertDailyTaskSchema, insertNoteSchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    try {
      console.log("Received body:", req.body);
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Habit routes
  app.get("/api/users/:userId/habits", async (req, res) => {
    const habits = await storage.getUserHabits(req.params.userId);
    
    const habitsWithCompletions = await Promise.all(
      habits.map(async (habit) => {
        const completionRecords = await storage.getHabitCompletions(habit.id);
        const completions: Record<string, number> = {};
        completionRecords.forEach((c) => {
          completions[c.completedAt] = c.status;
        });
        return {
          ...habit,
          completedDates: completionRecords.map((c) => c.completedAt),
          completions,
        };
      })
    );

    res.json(habitsWithCompletions);
  });

  app.post("/api/users/:userId/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(req.params.userId, habitData);
      res.json({ ...habit, completedDates: [] });
    } catch (error) {
      res.status(400).json({ error: "Invalid habit data" });
    }
  });

  app.patch("/api/users/:userId/habits/:id", async (req, res) => {
    try {
      const updateData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(
        req.params.id,
        req.params.userId,
        updateData
      );
      
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }

      const completionRecords = await storage.getHabitCompletions(habit.id);
      res.json({
        ...habit,
        completedDates: completionRecords.map((c) => c.completedAt),
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/users/:userId/habits/:id", async (req, res) => {
    const deleted = await storage.deleteHabit(req.params.id, req.params.userId);
    if (!deleted) {
      return res.status(404).json({ error: "Habit not found" });
    }
    res.json({ success: true });
  });

  app.post("/api/users/:userId/habits/reorder", async (req, res) => {
    try {
      const { habitIds } = req.body;
      if (!Array.isArray(habitIds)) {
        return res.status(400).json({ error: "habitIds must be an array" });
      }
      await storage.updateHabitOrder(req.params.userId, habitIds);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid reorder data" });
    }
  });

  // Completion routes
  app.post("/api/habits/:habitId/completions", async (req, res) => {
    try {
      const completionData = insertCompletionSchema.parse({
        habitId: req.params.habitId,
        ...req.body,
      });
      const completion = await storage.createCompletion(completionData);
      res.json(completion);
    } catch (error) {
      res.status(400).json({ error: "Invalid completion data" });
    }
  });

  app.delete("/api/habits/:habitId/completions/:completedAt", async (req, res) => {
    const deleted = await storage.deleteCompletion(
      req.params.habitId,
      req.params.completedAt
    );
    if (!deleted) {
      return res.status(404).json({ error: "Completion not found" });
    }
    res.json({ success: true });
  });

  app.patch("/api/habits/:habitId/completions/:completedAt", async (req, res) => {
    try {
      const { status } = req.body;
      if (typeof status !== "number" || status < 0 || status > 2) {
        return res.status(400).json({ error: "Status must be 0, 1, or 2" });
      }
      const completion = await storage.updateCompletionStatus(
        req.params.habitId,
        req.params.completedAt,
        status
      );
      if (!completion) {
        return res.status(404).json({ error: "Completion not found" });
      }
      res.json(completion);
    } catch (error) {
      res.status(400).json({ error: "Failed to update completion status" });
    }
  });

  app.patch("/api/habits/:habitId/streak", async (req, res) => {
    try {
      const { streak } = req.body;
      if (typeof streak !== "number") {
        return res.status(400).json({ error: "Streak must be a number" });
      }
      await storage.updateHabitStreak(req.params.habitId, streak);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid streak data" });
    }
  });

  // Daily entry routes
  app.get("/api/users/:userId/daily/:date", async (req, res) => {
    try {
      const entry = await storage.getOrCreateDailyEntry(req.params.userId, req.params.date);
      const tasks = await storage.getDailyTasks(entry.id);
      res.json({ entry, tasks });
    } catch (error) {
      res.status(400).json({ error: "Failed to get daily entry" });
    }
  });

  app.patch("/api/daily/:entryId/note", async (req, res) => {
    try {
      const { note } = req.body;
      if (typeof note !== "string") {
        return res.status(400).json({ error: "Note must be a string" });
      }
      const entry = await storage.updateDailyNote(req.params.entryId, note);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  // Daily task routes
  app.post("/api/daily/:entryId/tasks", async (req, res) => {
    try {
      const taskData = insertDailyTaskSchema.parse({
        entryId: req.params.entryId,
        ...req.body,
      });
      const task = await storage.createDailyTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.updateDailyTask(req.params.taskId, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:taskId", async (req, res) => {
    const deleted = await storage.deleteDailyTask(req.params.taskId);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  });

  // Notes routes
  app.get("/api/users/:userId/notes", async (req, res) => {
    const notes = await storage.getUserNotes(req.params.userId);
    res.json(notes);
  });

  app.post("/api/users/:userId/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        userId: req.params.userId,
        ...req.body,
      });
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/users/:userId/notes/:noteId", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== "string") {
        return res.status(400).json({ error: "Content must be a string" });
      }
      const note = await storage.updateNote(req.params.noteId, req.params.userId, content);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/users/:userId/notes/:noteId", async (req, res) => {
    const deleted = await storage.deleteNote(req.params.noteId, req.params.userId);
    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  });

  // Standalone tasks routes
  app.get("/api/users/:userId/tasks", async (req, res) => {
    const tasks = await storage.getUserTasks(req.params.userId);
    res.json(tasks);
  });

  app.post("/api/users/:userId/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        userId: req.params.userId,
        ...req.body,
      });
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/users/:userId/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.taskId, req.params.userId, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/users/:userId/tasks/:taskId", async (req, res) => {
    const deleted = await storage.deleteTask(req.params.taskId, req.params.userId);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
