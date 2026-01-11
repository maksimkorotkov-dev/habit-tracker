import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, desc } from "drizzle-orm";
import {
  users,
  habits,
  completions,
  dailyEntries,
  dailyTasks,
  notes,
  tasks,
  type User,
  type InsertUser,
  type Habit,
  type InsertHabit,
  type Completion,
  type InsertCompletion,
  type DailyEntry,
  type InsertDailyEntry,
  type DailyTask,
  type InsertDailyTask,
  type Note,
  type InsertNote,
  type Task,
  type InsertTask,
} from "@shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Habit operations
  getUserHabits(userId: string): Promise<Habit[]>;
  getHabit(id: string, userId: string): Promise<Habit | undefined>;
  createHabit(userId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, userId: string, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;
  updateHabitOrder(userId: string, habitIds: string[]): Promise<void>;

  // Completion operations
  getHabitCompletions(habitId: string): Promise<Completion[]>;
  createCompletion(completion: InsertCompletion): Promise<Completion>;
  deleteCompletion(habitId: string, completedAt: string): Promise<boolean>;
  updateCompletionStatus(habitId: string, completedAt: string, status: number): Promise<Completion | undefined>;
  getCompletion(habitId: string, completedAt: string): Promise<Completion | undefined>;
  updateHabitStreak(habitId: string, streak: number): Promise<void>;

  // Daily entry operations
  getDailyEntry(userId: string, entryDate: string): Promise<DailyEntry | undefined>;
  getOrCreateDailyEntry(userId: string, entryDate: string): Promise<DailyEntry>;
  updateDailyNote(entryId: string, note: string): Promise<DailyEntry | undefined>;

  // Daily task operations
  getDailyTasks(entryId: string): Promise<DailyTask[]>;
  createDailyTask(task: InsertDailyTask): Promise<DailyTask>;
  updateDailyTask(taskId: string, data: Partial<InsertDailyTask>): Promise<DailyTask | undefined>;
  deleteDailyTask(taskId: string): Promise<boolean>;

  // Notes operations
  getUserNotes(userId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(noteId: string, userId: string, content: string): Promise<Note | undefined>;
  deleteNote(noteId: string, userId: string): Promise<boolean>;

  // Tasks operations
  getUserTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, userId: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(taskId: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.name);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    return db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(habits.order);
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    return habit;
  }

  async createHabit(userId: string, insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values({ ...insertHabit, userId })
      .returning();
    return habit;
  }

  async updateHabit(
    id: string,
    userId: string,
    updateData: Partial<InsertHabit>
  ): Promise<Habit | undefined> {
    const [habit] = await db
      .update(habits)
      .set(updateData)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return habit;
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async updateHabitOrder(userId: string, habitIds: string[]): Promise<void> {
    for (let i = 0; i < habitIds.length; i++) {
      await db
        .update(habits)
        .set({ order: i })
        .where(and(eq(habits.id, habitIds[i]), eq(habits.userId, userId)));
    }
  }

  async getHabitCompletions(habitId: string): Promise<Completion[]> {
    return db
      .select()
      .from(completions)
      .where(eq(completions.habitId, habitId))
      .orderBy(desc(completions.completedAt));
  }

  async createCompletion(insertCompletion: InsertCompletion): Promise<Completion> {
    const [completion] = await db
      .insert(completions)
      .values(insertCompletion)
      .returning();
    return completion;
  }

  async deleteCompletion(habitId: string, completedAt: string): Promise<boolean> {
    const result = await db
      .delete(completions)
      .where(
        and(
          eq(completions.habitId, habitId),
          eq(completions.completedAt, completedAt)
        )
      )
      .returning();
    return result.length > 0;
  }

  async updateCompletionStatus(habitId: string, completedAt: string, status: number): Promise<Completion | undefined> {
    const [completion] = await db
      .update(completions)
      .set({ status })
      .where(
        and(
          eq(completions.habitId, habitId),
          eq(completions.completedAt, completedAt)
        )
      )
      .returning();
    return completion;
  }

  async getCompletion(habitId: string, completedAt: string): Promise<Completion | undefined> {
    const [completion] = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.habitId, habitId),
          eq(completions.completedAt, completedAt)
        )
      );
    return completion;
  }

  async updateHabitStreak(habitId: string, streak: number): Promise<void> {
    await db.update(habits).set({ streak }).where(eq(habits.id, habitId));
  }

  async getDailyEntry(userId: string, entryDate: string): Promise<DailyEntry | undefined> {
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.entryDate, entryDate)));
    return entry;
  }

  async getOrCreateDailyEntry(userId: string, entryDate: string): Promise<DailyEntry> {
    let entry = await this.getDailyEntry(userId, entryDate);
    if (!entry) {
      const [newEntry] = await db
        .insert(dailyEntries)
        .values({ userId, entryDate, note: "" })
        .returning();
      entry = newEntry;
    }
    return entry;
  }

  async updateDailyNote(entryId: string, note: string): Promise<DailyEntry | undefined> {
    const [entry] = await db
      .update(dailyEntries)
      .set({ note })
      .where(eq(dailyEntries.id, entryId))
      .returning();
    return entry;
  }

  async getDailyTasks(entryId: string): Promise<DailyTask[]> {
    return db
      .select()
      .from(dailyTasks)
      .where(eq(dailyTasks.entryId, entryId))
      .orderBy(dailyTasks.sortOrder);
  }

  async createDailyTask(task: InsertDailyTask): Promise<DailyTask> {
    const [newTask] = await db.insert(dailyTasks).values(task).returning();
    return newTask;
  }

  async updateDailyTask(taskId: string, data: Partial<InsertDailyTask>): Promise<DailyTask | undefined> {
    const [task] = await db
      .update(dailyTasks)
      .set(data)
      .where(eq(dailyTasks.id, taskId))
      .returning();
    return task;
  }

  async deleteDailyTask(taskId: string): Promise<boolean> {
    const result = await db.delete(dailyTasks).where(eq(dailyTasks.id, taskId)).returning();
    return result.length > 0;
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(noteId: string, userId: string, content: string): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return note;
  }

  async deleteNote(noteId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(taskId: string, userId: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
