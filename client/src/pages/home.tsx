import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Check,
  Pencil,
  Trash2,
  Sun,
  Moon,
  ArrowRight,
  Flame,
  GripVertical,
  Dumbbell,
  BookOpen,
  Heart,
  Droplets,
  Coffee,
  Zap,
  Star,
  Target,
  Clock,
  Filter,
  Trophy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Medal,
  Crown,
  Calendar,
  CalendarDays,
  FileText,
  ListTodo,
  X,
  Settings,
  LogOut,
  User,
  Brain,
  Leaf,
  Music,
  Palette,
  Smile,
  Apple,
  Bike,
  Car,
  Home as HomeIcon,
  Wallet,
  Phone,
  Laptop,
  Camera,
  Gamepad2,
  Headphones,
  Pill,
  Cigarette,
  Wine,
  UtensilsCrossed,
  Bed,
  AlarmClock,
  Briefcase,
  GraduationCap,
  Languages,
  PenTool,
  Scissors,
  Shirt,
  Footprints,
  Mountain,
  Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isToday, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, differenceInDays, subWeeks, addWeeks } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { RichTextEditor } from "@/components/RichTextEditor";
import * as api from "@/lib/api";
import type { HabitWithCompletions, DailyData } from "@/lib/api";
import type { DailyTask, Note, Task } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  unlocked: boolean;
}

const ICONS = [
  { id: "dumbbell", icon: Dumbbell, label: "Fitness" },
  { id: "book", icon: BookOpen, label: "Reading" },
  { id: "heart", icon: Heart, label: "Health" },
  { id: "droplets", icon: Droplets, label: "Water" },
  { id: "coffee", icon: Coffee, label: "Coffee" },
  { id: "zap", icon: Zap, label: "Energy" },
  { id: "star", icon: Star, label: "Goal" },
  { id: "target", icon: Target, label: "Focus" },
  { id: "clock", icon: Clock, label: "Time" },
  { id: "brain", icon: Brain, label: "Mind" },
  { id: "leaf", icon: Leaf, label: "Nature" },
  { id: "music", icon: Music, label: "Music" },
  { id: "palette", icon: Palette, label: "Art" },
  { id: "smile", icon: Smile, label: "Mood" },
  { id: "apple", icon: Apple, label: "Nutrition" },
  { id: "bike", icon: Bike, label: "Cycling" },
  { id: "car", icon: Car, label: "Driving" },
  { id: "home", icon: HomeIcon, label: "Home" },
  { id: "wallet", icon: Wallet, label: "Finance" },
  { id: "phone", icon: Phone, label: "Phone" },
  { id: "laptop", icon: Laptop, label: "Work" },
  { id: "camera", icon: Camera, label: "Photo" },
  { id: "gamepad", icon: Gamepad2, label: "Gaming" },
  { id: "headphones", icon: Headphones, label: "Audio" },
  { id: "pill", icon: Pill, label: "Medicine" },
  { id: "cigarette", icon: Cigarette, label: "Smoking" },
  { id: "wine", icon: Wine, label: "Drinks" },
  { id: "utensils", icon: UtensilsCrossed, label: "Food" },
  { id: "bed", icon: Bed, label: "Sleep" },
  { id: "alarm", icon: AlarmClock, label: "Wake" },
  { id: "briefcase", icon: Briefcase, label: "Business" },
  { id: "graduation", icon: GraduationCap, label: "Study" },
  { id: "languages", icon: Languages, label: "Language" },
  { id: "pen", icon: PenTool, label: "Writing" },
  { id: "scissors", icon: Scissors, label: "Craft" },
  { id: "shirt", icon: Shirt, label: "Clothes" },
  { id: "footprints", icon: Footprints, label: "Walk" },
  { id: "mountain", icon: Mountain, label: "Hiking" },
  { id: "waves", icon: Waves, label: "Swimming" },
];

const getIconComponent = (iconId: string) => {
  const found = ICONS.find(i => i.id === iconId);
  return found?.icon || Target;
};

function HabitCalendarDialog({ 
  habit, 
  allDatesCount 
}: { 
  habit: HabitWithCompletions; 
  allDatesCount: number;
}) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const IconComp = getIconComponent(habit.icon || "target");
  
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground hover:bg-foreground hover:text-background">
          <CalendarDays className="w-4 h-4 mr-2" />
          View all ({allDatesCount} days)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComp className="w-5 h-5" />
            {habit.name}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
              className="hover:bg-foreground hover:text-background"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
              className="hover:bg-foreground hover:text-background"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfWeek).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {daysInMonth.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const status = habit.completions?.[dateStr] || 0;
              return (
                <div
                  key={dateStr}
                  className="aspect-square flex items-center justify-center relative"
                >
                  <span className="text-sm">{format(day, "d")}</span>
                  {status > 0 && (
                    <div className={`absolute bottom-0.5 w-2 h-2 rounded-full ${
                      status === 2 ? "bg-foreground" : "bg-foreground/50"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-foreground" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-foreground/50" />
              <span>Half done</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortableHabitItem({ 
  habit, 
  isCompleted, 
  todayStr, 
  onToggle, 
  onEdit, 
  onDelete 
}: {
  habit: HabitWithCompletions;
  isCompleted: boolean;
  todayStr: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComp = getIconComponent(habit.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isCompleted 
          ? "glass-card shadow-sm" 
          : "hover:bg-white/60 dark:hover:bg-white/5"
      }`}
      data-testid={`card-habit-${habit.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-40 hover:opacity-70 transition-opacity"
        data-testid={`drag-handle-${habit.id}`}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isCompleted 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "bg-white/80 dark:bg-white/10 border border-border/50 hover:border-primary/50 hover:shadow-sm"
        }`}
        data-testid={`button-toggle-habit-${habit.id}`}
      >
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          <IconComp className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p 
          className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : ""}`}
          data-testid={`text-habit-name-${habit.id}`}
        >
          {habit.name}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-foreground hover:text-background"
          onClick={onEdit}
          data-testid={`button-edit-habit-${habit.id}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-foreground hover:text-background"
          onClick={onDelete}
          data-testid={`button-delete-habit-${habit.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithCompletions | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [userName, setUserName] = useState("");
  const [tempName, setTempName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [showAchievements, setShowAchievements] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [localNote, setLocalNote] = useState("");
  const [isNoteEditing, setIsNoteEditing] = useState(false);
  const noteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [activeTab, setActiveTab] = useState("week");
  const [editUserName, setEditUserName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("habitTrackerUserId");
    const storedUserName = localStorage.getItem("habitTrackerUserName");
    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
  }, []);

  const createUserMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: (user) => {
      setUserId(user.id);
      setUserName(user.name);
      localStorage.setItem("habitTrackerUserId", user.id);
      localStorage.setItem("habitTrackerUserName", user.name);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.updateUser(id, name),
    onSuccess: (user) => {
      setUserName(user.name);
      localStorage.setItem("habitTrackerUserName", user.name);
      setShowUserSettings(false);
      toast({ title: "Name updated" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      handleLogout();
      toast({ title: "Account deleted" });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("habitTrackerUserId");
    localStorage.removeItem("habitTrackerUserName");
    setUserId(null);
    setUserName("");
    setShowUserSettings(false);
    queryClient.clear();
  };

  const handleUpdateUser = () => {
    if (!editUserName.trim() || !userId) return;
    updateUserMutation.mutate({ id: userId, name: editUserName.trim() });
  };

  const handleDeleteUser = () => {
    if (!userId) return;
    if (confirm("Are you sure you want to delete your account? All your data will be lost.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleStartApp = () => {
    if (!tempName.trim()) {
      toast({ title: "Enter your name", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(tempName.trim());
  };

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits", userId],
    queryFn: () => api.getUserHabits(userId!),
    enabled: !!userId,
  });

  const selectedDayStr = format(selectedDay, "yyyy-MM-dd");
  
  const { data: dailyData } = useQuery({
    queryKey: ["dailyData", userId, selectedDayStr],
    queryFn: () => api.getDailyData(userId!, selectedDayStr),
    enabled: !!userId,
  });

  const { data: userNotes = [] } = useQuery({
    queryKey: ["notes", userId],
    queryFn: () => api.getUserNotes(userId!),
    enabled: !!userId,
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) =>
      api.createNote(userId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
      setIsNoteDialogOpen(false);
      setNoteContent("");
      toast({ title: "Note created" });
    },
  });

  const updateNoteMutationNew = useMutation({
    mutationFn: ({ userId, noteId, content }: { userId: string; noteId: string; content: string }) =>
      api.updateNote(userId, noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
      setIsNoteDialogOpen(false);
      setEditingNote(null);
      setNoteContent("");
      toast({ title: "Note updated" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: ({ userId, noteId }: { userId: string; noteId: string }) =>
      api.deleteNote(userId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
      toast({ title: "Note deleted" });
    },
  });

  const handleSaveNote = () => {
    if (!noteContent.trim() || !userId) return;
    if (editingNote) {
      updateNoteMutationNew.mutate({ userId, noteId: editingNote.id, content: noteContent });
    } else {
      createNoteMutation.mutate({ userId, content: noteContent });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsNoteDialogOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!userId) return;
    if (confirm("Delete this note?")) {
      deleteNoteMutation.mutate({ userId, noteId });
    }
  };

  const { data: userTasks = [] } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => api.getUserTasks(userId!),
    enabled: !!userId,
  });

  const createStandaloneTaskMutation = useMutation({
    mutationFn: ({ userId, title }: { userId: string; title: string }) =>
      api.createTask(userId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      setIsTaskDialogOpen(false);
      setTaskTitle("");
      toast({ title: "Task created" });
    },
  });

  const updateStandaloneTaskMutation = useMutation({
    mutationFn: ({ userId, taskId, data }: { userId: string; taskId: string; data: Partial<{ title: string; isCompleted: number }> }) =>
      api.updateTask(userId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const deleteStandaloneTaskMutation = useMutation({
    mutationFn: ({ userId, taskId }: { userId: string; taskId: string }) =>
      api.deleteTask(userId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      toast({ title: "Task deleted" });
    },
  });

  const handleSaveTask = () => {
    if (!taskTitle.trim() || !userId) return;
    createStandaloneTaskMutation.mutate({ userId, title: taskTitle.trim() });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!userId) return;
    if (confirm("Delete this task?")) {
      deleteStandaloneTaskMutation.mutate({ userId, taskId });
    }
  };

  const updateNoteMutation = useMutation({
    mutationFn: ({ entryId, note }: { entryId: string; note: string }) =>
      api.updateDailyNote(entryId, note),
  });

  useEffect(() => {
    if (dailyData?.entry?.note !== undefined) {
      setLocalNote(dailyData.entry.note || "");
    }
  }, [dailyData?.entry?.note, selectedDayStr]);

  const handleNoteChange = useCallback((note: string, entryId: string) => {
    setLocalNote(note);
    if (noteTimeoutRef.current) {
      clearTimeout(noteTimeoutRef.current);
    }
    noteTimeoutRef.current = setTimeout(() => {
      updateNoteMutation.mutate({ entryId, note });
    }, 500);
  }, [updateNoteMutation]);

  const createTaskMutation = useMutation({
    mutationFn: ({ entryId, title }: { entryId: string; title: string }) =>
      api.createDailyTask(entryId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyData", userId, selectedDayStr] });
      setNewTaskTitle("");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<DailyTask> }) =>
      api.updateDailyTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyData", userId, selectedDayStr] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.deleteDailyTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyData", userId, selectedDayStr] });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: (data: { name: string; color: string; icon: string; streak: number; order: number }) =>
      api.createHabit(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: Partial<{ name: string; color: string; icon: string }> }) =>
      api.updateHabit(userId!, habitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => api.deleteHabit(userId!, habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const reorderHabitsMutation = useMutation({
    mutationFn: (habitIds: string[]) => api.reorderHabits(userId!, habitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: ({ habitId, completedAt, isCompleting }: { habitId: string; completedAt: string; isCompleting: boolean }) =>
      api.toggleCompletion(habitId, completedAt, isCompleting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const setCompletionStatusMutation = useMutation({
    mutationFn: ({ habitId, completedAt, status, currentStatus }: { habitId: string; completedAt: string; status: number; currentStatus: number }) =>
      api.setCompletionStatus(habitId, completedAt, status, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const updateStreakMutation = useMutation({
    mutationFn: ({ habitId, streak }: { habitId: string; streak: number }) =>
      api.updateStreak(habitId, streak),
  });

  const [newHabit, setNewHabit] = useState<{
    name: string;
    color: string;
    icon: string;
  }>({
    name: "",
    color: "#4ade80",
    icon: "dumbbell",
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const achievements = useMemo((): Achievement[] => {
    const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const habitsCount = habits.length;

    return [
      { id: "first-habit", title: "First Step", description: "Create your first habit", icon: Star, unlocked: habitsCount >= 1 },
      { id: "five-habits", title: "Collector", description: "Create 5 habits", icon: Trophy, unlocked: habitsCount >= 5 },
      { id: "first-complete", title: "Starting Out", description: "Complete a habit 1 time", icon: Check, unlocked: totalCompleted >= 1 },
      { id: "ten-complete", title: "On a Roll", description: "Complete habits 10 times", icon: Zap, unlocked: totalCompleted >= 10 },
      { id: "fifty-complete", title: "Habit Master", description: "Complete habits 50 times", icon: Award, unlocked: totalCompleted >= 50 },
      { id: "streak-3", title: "Three Day Streak", description: "Reach a 3-day streak", icon: Flame, unlocked: maxStreak >= 3 },
      { id: "streak-7", title: "Power Week", description: "Reach a 7-day streak", icon: Medal, unlocked: maxStreak >= 7 },
      { id: "streak-30", title: "Month of Discipline", description: "Reach a 30-day streak", icon: Crown, unlocked: maxStreak >= 30 },
    ];
  }, [habits]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const stats = useMemo(() => {
    const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
    const bestStreak = Math.max(...habits.map(h => h.streak), 0);
    const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
    const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    
    return { completedToday, bestStreak, completionRate, totalCompleted };
  }, [habits, todayStr]);

  
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  }, [selectedMonth]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = [...completedDates].sort().reverse();
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    
    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
      return 0;
    }
    
    let streak = 0;
    let currentDate = sortedDates.includes(today) ? new Date() : subDays(new Date(), 1);
    
    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const toggleCompletionForDate = async (habit: HabitWithCompletions, dateStr: string) => {
    const currentStatus = habit.completions?.[dateStr] ?? 0;
    const nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? 2 : 0;
    
    await setCompletionStatusMutation.mutateAsync({
      habitId: habit.id,
      completedAt: dateStr,
      status: nextStatus,
      currentStatus,
    });

    const newCompletedDates = nextStatus === 0
      ? habit.completedDates.filter(d => d !== dateStr)
      : habit.completedDates.includes(dateStr) ? habit.completedDates : [...habit.completedDates, dateStr];
    
    const newStreak = calculateStreak(newCompletedDates);

    await updateStreakMutation.mutateAsync({
      habitId: habit.id,
      streak: newStreak,
    });
  };

  const getWeekCompletionCount = (habit: HabitWithCompletions) => {
    return weekDays.filter(day => habit.completedDates.includes(format(day, "yyyy-MM-dd"))).length;
  };

  const handleSaveHabit = async () => {
    if (!newHabit.name.trim()) {
      toast({ title: "Enter a name", variant: "destructive" });
      return;
    }

    if (editingHabit) {
      await updateHabitMutation.mutateAsync({
        habitId: editingHabit.id,
        data: newHabit,
      });
    } else {
      await createHabitMutation.mutateAsync({
        ...newHabit,
        streak: 0,
        order: habits.length,
      });
    }

    setNewHabit({ name: "", color: "#4ade80", icon: "dumbbell" });
    setEditingHabit(null);
    setIsDialogOpen(false);
  };

  const handleEditHabit = (habit: HabitWithCompletions) => {
    setEditingHabit(habit);
    setNewHabit({
      name: habit.name,
      color: habit.color || "#D97706",
      icon: habit.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabitMutation.mutateAsync(habitId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex(h => h.id === active.id);
      const newIndex = habits.findIndex(h => h.id === over.id);
      const newOrder = arrayMove(habits, oldIndex, newIndex);
      
      queryClient.setQueryData(["habits", userId], newOrder);
      
      await reorderHabitsMutation.mutateAsync(newOrder.map(h => h.id));
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const { data: existingUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: api.getAllUsers,
    enabled: !userId,
  });

  const selectExistingUser = (user: { id: string; name: string }) => {
    setUserId(user.id);
    setUserName(user.name);
    localStorage.setItem("habitTrackerUserId", user.id);
    localStorage.setItem("habitTrackerUserName", user.name);
  };

  if (!userId) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-primary/10 flex items-center justify-center"
            >
              <Target className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-semibold mb-3 tracking-tight" data-testid="text-welcome-title">
              Habit Tracker
            </h1>
            <p className="text-muted-foreground">
              Build better habits, one day at a time
            </p>
          </div>

          {existingUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-sm text-muted-foreground mb-4 text-center font-medium">Welcome back</p>
              <div className="space-y-3">
                {existingUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start rounded-2xl glass-card border-0 hover:shadow-md transition-all duration-200"
                      onClick={() => selectExistingUser(user)}
                      data-testid={`button-select-user-${user.id}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-background/80 backdrop-blur-sm px-4 text-muted-foreground">or create new</span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: existingUsers.length > 0 ? 0.5 : 0.2 }}
            className="space-y-4"
          >
            <Input
              placeholder="Enter your name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartApp()}
              className="h-14 text-center rounded-2xl bg-white/80 dark:bg-white/10 border-0 shadow-sm focus:shadow-md transition-shadow text-base"
              data-testid="input-user-name"
              autoFocus={existingUsers.length === 0}
              disabled={createUserMutation.isPending}
            />
            <Button 
              onClick={handleStartApp} 
              className="w-full h-14 rounded-2xl text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              data-testid="button-start-app"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating..." : "Get Started"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Target className="w-8 h-8 text-primary animate-pulse" />
          </motion.div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  const motivationalPhrases = [
    { min: 0, max: 25, text: "Every journey starts with a single step!", emoji: "🌱" },
    { min: 25, max: 50, text: "You're building momentum!", emoji: "💪" },
    { min: 50, max: 75, text: "Halfway there, keep pushing!", emoji: "🔥" },
    { min: 75, max: 99, text: "Almost there, don't stop now!", emoji: "⚡" },
    { min: 100, max: 100, text: "Perfect day! You're unstoppable!", emoji: "🏆" },
  ];

  const currentPhrase = motivationalPhrases.find(
    p => stats.completionRate >= p.min && stats.completionRate <= p.max
  ) || motivationalPhrases[0];

  return (
    <div className="min-h-screen gradient-soft pb-28 md:pb-8">
      <header className="liquid-glass ios26-header sticky top-2 z-50 mx-4">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {format(new Date(), "EEEE, d MMMM", { locale: enUS })}
              </p>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-greeting">
                Hello, {userName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAchievements(true)}
                className="relative glass-button h-11 w-11"
                data-testid="button-achievements"
              >
                <Trophy className="w-5 h-5" />
                {unlockedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center shadow-sm">
                    {unlockedCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="glass-button h-11 w-11"
                onClick={() => {
                  setEditUserName(userName);
                  setShowUserSettings(true);
                }}
                data-testid="button-user-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="glass-button h-11 w-11"
                onClick={toggleDarkMode}
                data-testid="button-theme-toggle"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-6 mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold" data-testid="text-motivation">
                {currentPhrase.emoji} {currentPhrase.text}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.completedToday} / {habits.length}
              </p>
            </div>
            
            <div className="w-full h-10 bg-muted border border-border rounded-md overflow-hidden">
              <motion.div
                className="h-full rounded-md striped-progress"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                data-testid="stat-rate"
              />
            </div>
            
            {habits.length > 0 && stats.completedToday < habits.length && (
              <Button 
                className="btn-cta rounded-2xl h-11 px-6 self-center mt-2"
                onClick={() => {
                  const incompleteHabit = habits.find(h => !h.completedDates.includes(todayStr));
                  if (incompleteHabit) {
                    toggleCompletionForDate(incompleteHabit, todayStr);
                  }
                }}
                data-testid="button-complete-next"
              >
                <Check className="w-5 h-5 mr-2" />
                Complete Next Habit
              </Button>
            )}
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <TabsList className="bg-secondary border border-border rounded-2xl p-1 h-auto">
              <TabsTrigger value="week" data-testid="tab-week" className="rounded-xl px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                My Habits
              </TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="rounded-xl px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                My Notes
              </TabsTrigger>
              <TabsTrigger value="tasks" data-testid="tab-tasks" className="rounded-xl px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                My Tasks
              </TabsTrigger>
              <TabsTrigger value="stats" data-testid="tab-stats" className="rounded-xl px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                My Stats
              </TabsTrigger>
            </TabsList>

            {activeTab !== "stats" && (
              <Button 
                className="rounded-2xl shadow-md btn-cta h-11 px-5 hidden md:flex" 
                data-testid="button-add-dynamic"
                onClick={() => {
                  if (activeTab === "week") {
                    setIsDialogOpen(true);
                  } else if (activeTab === "notes") {
                    setEditingNote(null);
                    setNoteContent("");
                    setIsNoteDialogOpen(true);
                  } else if (activeTab === "tasks") {
                    setTaskTitle("");
                    setIsTaskDialogOpen(true);
                  }
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                {activeTab === "week" ? "New Habit" : activeTab === "notes" ? "New Note" : "New Task"}
              </Button>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingHabit(null);
                  setNewHabit({ name: "", color: "#4ade80", icon: "dumbbell" });
                }
              }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingHabit ? "Edit Habit" : "New Habit"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="E.g.: Morning jog"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="input-habit-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {ICONS.map((item) => {
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setNewHabit(prev => ({ ...prev, icon: item.id }))}
                              className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${
                                newHabit.icon === item.id 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-secondary hover:bg-secondary/80"
                              }`}
                              data-testid={`button-icon-${item.id}`}
                            >
                              <IconComp className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveHabit} 
                      className="w-full"
                      data-testid="button-save-habit"
                      disabled={createHabitMutation.isPending || updateHabitMutation.isPending}
                    >
                      {createHabitMutation.isPending || updateHabitMutation.isPending
                        ? "Saving..."
                        : editingHabit ? "Save" : "Create"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
          </div>

          <TabsContent value="week" className="mt-0">
            {habits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No habits yet</p>
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-habit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first habit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {habits.map(habit => {
                  const status = habit.completions?.[todayStr] ?? 0;
                  const isPartial = status === 1;
                  const isFull = status === 2;
                  const IconComp = getIconComponent(habit.icon);
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative"
                    >
                      <motion.button
                        onClick={() => toggleCompletionForDate(habit, todayStr)}
                        whileTap={{ scale: 0.95 }}
                        disabled={setCompletionStatusMutation.isPending}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-300 ${
                          isFull 
                            ? "shadow-lg" 
                            : isPartial
                            ? "shadow-md border-2"
                            : "border-2 hover:shadow-md"
                        }`}
                        style={{
                          backgroundColor: isFull ? "hsl(var(--foreground))" : isPartial ? "hsl(var(--muted))" : "transparent",
                          borderColor: isFull ? "transparent" : "hsl(var(--border))",
                        }}
                        data-testid={`habit-square-${habit.id}`}
                      >
                        <IconComp 
                          className={`w-20 h-20 transition-colors ${
                            isFull ? "text-background" : "text-foreground"
                          }`}
                        />
                        <span 
                          className={`text-base font-semibold text-center line-clamp-2 transition-colors ${
                            isFull ? "text-background" : "text-foreground"
                          }`}
                          data-testid={`text-habit-name-${habit.id}`}
                        >
                          {habit.name}
                        </span>
                        {isFull && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 bg-background/30 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-background" />
                          </motion.div>
                        )}
                        {isPartial && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-foreground"
                          >
                            <span className="text-background text-xs font-bold">½</span>
                          </motion.div>
                        )}
                      </motion.button>
                      
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md hover:bg-foreground hover:text-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditHabit(habit);
                          }}
                          data-testid={`button-edit-habit-${habit.id}`}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md hover:bg-foreground hover:text-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHabit(habit.id);
                          }}
                          data-testid={`button-delete-habit-${habit.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="rounded-lg bg-secondary border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-medium">
                    {format(selectedMonth, "LLLL yyyy", { locale: enUS })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 max-w-sm mx-auto mb-2">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => (
                    <div key={day} className="w-10 text-center text-sm text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 max-w-sm mx-auto">
                  {Array.from({ length: (startOfMonth(selectedMonth).getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-10 h-10" />
                  ))}
                  {calendarDays.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
                    const isCurrentDay = isToday(day);
                    const isSelected = format(selectedDay, "yyyy-MM-dd") === dateStr;
                    const intensity = habits.length > 0 ? completedCount / habits.length : 0;
                    const bgColor = intensity === 0 ? "bg-secondary" : intensity < 0.33 ? "bg-primary/30" : intensity < 0.66 ? "bg-primary/60" : "bg-primary";

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDay(day)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-base font-medium transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50 ${
                          isCurrentDay ? "ring-1 ring-primary" : ""
                        } ${isSelected ? "ring-2 ring-primary" : ""} ${bgColor}`}
                        data-testid={`calendar-day-${dateStr}`}
                      >
                        <span className={intensity > 0.5 ? "text-primary-foreground" : ""}>
                          {format(day, "d")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg bg-secondary border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDay(subDays(selectedDay, 1))}
                    data-testid="button-prev-day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-medium text-sm" data-testid="text-selected-day">
                    {format(selectedDay, "d MMMM yyyy", { locale: enUS })}
                    {isToday(selectedDay) && <span className="text-primary ml-2">(today)</span>}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDay(addDays(selectedDay, 1))}
                    data-testid="button-next-day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {habits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">
                    No habits to track
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {habits.map(habit => {
                      const selectedDayStr = format(selectedDay, "yyyy-MM-dd");
                      const status = habit.completions?.[selectedDayStr] ?? 0;
                      const isPartial = status === 1;
                      const isFull = status === 2;
                      const weeklyProgress = getWeekCompletionCount(habit) / 7;
                      const IconComp = getIconComponent(habit.icon);
                      return (
                        <motion.button
                          key={habit.id}
                          onClick={() => toggleCompletionForDate(habit, selectedDayStr)}
                          disabled={setCompletionStatusMutation.isPending}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                            isFull
                              ? "glass-card shadow-md"
                              : isPartial
                              ? "glass-card shadow-sm"
                              : "bg-background hover:shadow-sm"
                          }`}
                          data-testid={`day-habit-${habit.id}`}
                        >
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 habit-ring" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-secondary"
                              />
                              <motion.circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="hsl(var(--foreground))"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 176" }}
                                animate={{ strokeDasharray: `${weeklyProgress * 176} 176` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              />
                            </svg>
                            <div className={`absolute inset-0 flex items-center justify-center rounded-full m-2 ${
                              isFull ? "bg-primary text-primary-foreground" : isPartial ? "bg-primary/50 text-primary-foreground" : "bg-secondary"
                            }`}>
                              {isFull ? (
                                <Check className="w-6 h-6" />
                              ) : isPartial ? (
                                <span className="text-sm font-bold">½</span>
                              ) : (
                                <IconComp className="w-8 h-8" />
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium text-center ${isFull || isPartial ? "text-muted-foreground" : ""}`}>
                            {habit.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0 space-y-4">
            {userNotes.length === 0 ? (
              <div className="text-center py-12 rounded-lg bg-secondary border border-border">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No notes yet</p>
                <p className="text-muted-foreground text-xs mt-1">Click "New Note" to create your first note</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-secondary border border-border p-4 group"
                    data-testid={`note-card-${note.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), "d MMM yyyy, HH:mm", { locale: enUS })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-foreground hover:text-background"
                          onClick={() => handleEditNote(note)}
                          data-testid={`button-edit-note-${note.id}`}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-foreground hover:text-background"
                          onClick={() => handleDeleteNote(note.id)}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="text-base prose max-w-none cursor-pointer"
                      onClick={() => handleEditNote(note)}
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 space-y-4">
            {userTasks.length === 0 ? (
              <div className="text-center py-12 rounded-lg bg-secondary border border-border">
                <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No tasks yet</p>
                <p className="text-muted-foreground text-xs mt-1">Click "New Task" to create your first task</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg bg-secondary border border-border p-4 group"
                    data-testid={`task-card-${task.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (userId) {
                            updateStandaloneTaskMutation.mutate({
                              userId,
                              taskId: task.id,
                              data: { isCompleted: task.isCompleted === 1 ? 0 : 1 },
                            });
                          }
                        }}
                        className={`w-6 h-6 rounded-lg flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                          task.isCompleted === 1
                            ? "bg-black border-black"
                            : "border-gray-400 bg-transparent hover:border-gray-600"
                        }`}
                        data-testid={`checkbox-task-${task.id}`}
                      >
                        {task.isCompleted === 1 && (
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-base ${
                          task.isCompleted === 1 ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground hover:text-background"
                        onClick={() => handleDeleteTask(task.id)}
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-0 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Habit History
              </h3>
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="rounded-lg bg-secondary border border-border p-4">
                    <p className="text-center text-muted-foreground text-sm py-8">
                      Add habits to track your progress
                    </p>
                  </div>
                ) : (
                  habits.map(habit => {
                    const IconComp = getIconComponent(habit.icon || "target");
                    const allDates = Object.keys(habit.completions || {}).sort().reverse();
                    const displayDates = allDates.slice(0, 5);
                    const hasMore = allDates.length > 5;
                    return (
                      <div key={habit.id} className="rounded-lg bg-secondary border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <IconComp className="w-5 h-5" />
                          <span className="font-medium">{habit.name}</span>
                        </div>
                        {allDates.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No activity yet</p>
                        ) : (
                          <div className="space-y-2">
                            {displayDates.map(date => {
                              const status = habit.completions[date];
                              return (
                                <div key={date} className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 border-foreground flex items-center justify-center ${
                                    status === 2 ? "bg-foreground" : status === 1 ? "bg-transparent" : "bg-transparent"
                                  }`}>
                                    {status === 1 && (
                                      <div className="w-2 h-2 rounded-full bg-foreground" />
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(date), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {status === 2 ? "Completed" : status === 1 ? "Half done" : "Not done"}
                                  </span>
                                </div>
                              );
                            })}
                            {hasMore && (
                              <HabitCalendarDialog habit={habit} allDatesCount={allDates.length} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements ({unlockedCount}/{achievements.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map(achievement => {
                  const IconComp = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border border-border transition-colors ${
                        achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                      data-testid={`achievement-${achievement.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComp className="w-4 h-4" />
                        <span className="font-medium text-sm">{achievement.title}</span>
                      </div>
                      <p className={`text-xs ${achievement.unlocked ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {achievement.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isNoteDialogOpen} onOpenChange={(open) => {
        setIsNoteDialogOpen(open);
        if (!open) {
          setEditingNote(null);
          setNoteContent("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editingNote ? "Edit Note" : "New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RichTextEditor
              content={noteContent}
              onChange={setNoteContent}
              placeholder="Write your note here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsNoteDialogOpen(false)}
              data-testid="button-cancel-note-dialog"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={!noteContent.trim() || createNoteMutation.isPending || updateNoteMutationNew.isPending}
              data-testid="button-save-note-dialog"
            >
              {createNoteMutation.isPending || updateNoteMutationNew.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        setIsTaskDialogOpen(open);
        if (!open) {
          setTaskTitle("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              New Task
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter task title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && taskTitle.trim()) {
                  handleSaveTask();
                }
              }}
              data-testid="input-task-title"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsTaskDialogOpen(false)}
              data-testid="button-cancel-task-dialog"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTask}
              disabled={!taskTitle.trim() || createStandaloneTaskMutation.isPending}
              data-testid="button-save-task-dialog"
            >
              {createStandaloneTaskMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {achievements.map(achievement => {
              const IconComp = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border border-border transition-colors ${
                    achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-5 h-5" />
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className={`text-xs ${achievement.unlocked ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserSettings} onOpenChange={setShowUserSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <div className="flex gap-2">
                <Input
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="Enter your name"
                  data-testid="input-edit-user-name"
                />
                <Button 
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending || !editUserName.trim()}
                  data-testid="button-save-user-name"
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will log you out. You can create a new account or log in again.
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteUserMutation.isPending ? "Deleting..." : "Delete Account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will permanently delete your account and all your data.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="liquid-glass ios26-tab-bar">
          <div className="flex items-center justify-around py-3">
            <Link href="/">
              <button className="flex flex-col items-center gap-1 px-4 py-1 text-primary" data-testid="nav-home">
                <Target className="w-6 h-6" />
                <span className="text-xs font-medium">Habits</span>
              </button>
            </Link>
            <button 
              onClick={() => {
                if (activeTab === "week" || activeTab === "stats") {
                  setIsDialogOpen(true);
                } else if (activeTab === "notes") {
                  setEditingNote(null);
                  setNoteContent("");
                  setIsNoteDialogOpen(true);
                } else if (activeTab === "tasks") {
                  setTaskTitle("");
                  setIsTaskDialogOpen(true);
                }
              }}
              className="flex items-center justify-center"
              data-testid="nav-add"
            >
              <div className="w-14 h-14 rounded-full btn-cta flex items-center justify-center -mt-8 shadow-xl">
                <Plus className="w-7 h-7" />
              </div>
            </button>
            <button 
              onClick={() => setShowAchievements(true)}
              className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground"
              data-testid="nav-achievements"
            >
              <Trophy className="w-6 h-6" />
              <span className="text-xs font-medium">Awards</span>
            </button>
            <button 
              onClick={() => {
                setEditUserName(userName);
                setShowUserSettings(true);
              }}
              className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground"
              data-testid="nav-profile"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
