import type { User, Habit, InsertUser, InsertHabit, DailyEntry, DailyTask, Note, Task } from "@shared/schema";

export interface HabitWithCompletions extends Habit {
  completedDates: string[];
  completions: Record<string, number>;
}

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(name: string): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function updateUser(id: string, name: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function getUserHabits(userId: string): Promise<HabitWithCompletions[]> {
  const res = await fetch(`/api/users/${userId}/habits`);
  if (!res.ok) throw new Error("Failed to fetch habits");
  return res.json();
}

export async function createHabit(
  userId: string,
  habit: InsertHabit
): Promise<HabitWithCompletions> {
  const res = await fetch(`/api/users/${userId}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error("Failed to create habit");
  return res.json();
}

export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<InsertHabit>
): Promise<HabitWithCompletions> {
  const res = await fetch(`/api/users/${userId}/habits/${habitId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update habit");
  return res.json();
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const res = await fetch(`/api/users/${userId}/habits/${habitId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete habit");
}

export async function reorderHabits(userId: string, habitIds: string[]): Promise<void> {
  const res = await fetch(`/api/users/${userId}/habits/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder habits");
}

export async function toggleCompletion(
  habitId: string,
  completedAt: string,
  isCompleting: boolean
): Promise<void> {
  if (isCompleting) {
    const res = await fetch(`/api/habits/${habitId}/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt }),
    });
    if (!res.ok) throw new Error("Failed to create completion");
  } else {
    const res = await fetch(`/api/habits/${habitId}/completions/${completedAt}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete completion");
  }
}

export async function setCompletionStatus(
  habitId: string,
  completedAt: string,
  status: number,
  currentStatus: number
): Promise<void> {
  if (status === 0) {
    const res = await fetch(`/api/habits/${habitId}/completions/${completedAt}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete completion");
  } else if (currentStatus === 0) {
    const res = await fetch(`/api/habits/${habitId}/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt, status }),
    });
    if (!res.ok) throw new Error("Failed to create completion");
  } else {
    const res = await fetch(`/api/habits/${habitId}/completions/${completedAt}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update completion status");
  }
}

export async function updateStreak(habitId: string, streak: number): Promise<void> {
  const res = await fetch(`/api/habits/${habitId}/streak`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ streak }),
  });
  if (!res.ok) throw new Error("Failed to update streak");
}

export interface DailyData {
  entry: DailyEntry;
  tasks: DailyTask[];
}

export async function getDailyData(userId: string, date: string): Promise<DailyData> {
  const res = await fetch(`/api/users/${userId}/daily/${date}`);
  if (!res.ok) throw new Error("Failed to fetch daily data");
  return res.json();
}

export async function updateDailyNote(entryId: string, note: string): Promise<DailyEntry> {
  const res = await fetch(`/api/daily/${entryId}/note`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function createDailyTask(entryId: string, title: string): Promise<DailyTask> {
  const res = await fetch(`/api/daily/${entryId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, sortOrder: 0 }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateDailyTask(taskId: string, data: Partial<DailyTask>): Promise<DailyTask> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteDailyTask(taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const res = await fetch(`/api/users/${userId}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function createNote(userId: string, content: string): Promise<Note> {
  const res = await fetch(`/api/users/${userId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function updateNote(userId: string, noteId: string, content: string): Promise<Note> {
  const res = await fetch(`/api/users/${userId}/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const res = await fetch(`/api/users/${userId}/notes/${noteId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  const res = await fetch(`/api/users/${userId}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(userId: string, title: string): Promise<Task> {
  const res = await fetch(`/api/users/${userId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(userId: string, taskId: string, data: Partial<{ title: string; isCompleted: number }>): Promise<Task> {
  const res = await fetch(`/api/users/${userId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const res = await fetch(`/api/users/${userId}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
}
