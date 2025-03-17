import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { useAuth, User } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  userId: string;
  category?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  isDeleted: boolean;
}

interface TaskContextType {
  tasks: Task[];
  categories: string[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'isDeleted'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  getTasks: (filter?: { completed?: boolean; category?: string; deleted?: boolean }) => Task[];
  getTaskById: (id: string) => Task | undefined;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  getCompletionStats: () => { completed: number; total: number; percentage: number };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(['Personal', 'Work', 'Study']);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tasks from Supabase when user changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        setIsInitialized(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // Transform to our Task model
        const transformedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          completed: task.completed,
          createdAt: task.created_at,
          userId: task.user_id,
          category: task.category || undefined,
          dueDate: task.due_date || undefined,
          priority: task.priority as 'low' | 'medium' | 'high',
          isDeleted: task.is_deleted
        }));

        setTasks(transformedTasks);

        // Extract unique categories
        const uniqueCategories = [...new Set(data
          .filter(task => task.category)
          .map(task => task.category)
        )];
        
        // Merge with default categories
        const allCategories = [...new Set([...categories, ...uniqueCategories])];
        setCategories(allCategories as string[]);

      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load your tasks",
          variant: "destructive",
        });
      } finally {
        setIsInitialized(true);
      }
    };

    fetchTasks();
  }, [user]);

  // Save categories to localStorage (we'll keep this simple)
  useEffect(() => {
    if (user && isInitialized) {
      localStorage.setItem(`categories-${user.id}`, JSON.stringify(categories));
    }
  }, [categories, user, isInitialized]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'isDeleted'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          completed: task.completed,
          user_id: user.id,
          category: task.category,
          due_date: task.dueDate,
          priority: task.priority,
          is_deleted: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        completed: data.completed,
        createdAt: data.created_at,
        userId: data.user_id,
        category: data.category || undefined,
        dueDate: data.due_date || undefined,
        priority: data.priority as 'low' | 'medium' | 'high',
        isDeleted: data.is_deleted
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      toast({
        title: "Task added",
        description: `"${task.title}" has been added to your tasks`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Transform our model to Supabase model
      const supabaseUpdates: any = {};
      if ('title' in updates) supabaseUpdates.title = updates.title;
      if ('description' in updates) supabaseUpdates.description = updates.description;
      if ('completed' in updates) supabaseUpdates.completed = updates.completed;
      if ('category' in updates) supabaseUpdates.category = updates.category;
      if ('dueDate' in updates) supabaseUpdates.due_date = updates.dueDate;
      if ('priority' in updates) supabaseUpdates.priority = updates.priority;
      if ('isDeleted' in updates) supabaseUpdates.is_deleted = updates.isDeleted;

      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      );
      
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, isDeleted: true } : task
        )
      );
      
      toast({
        title: "Task moved to trash",
        description: "You can restore it from the trash if needed",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to move task to trash",
        variant: "destructive",
      });
    }
  };

  const restoreTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_deleted: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, isDeleted: false } : task
        )
      );
      
      toast({
        title: "Task restored",
        description: "Your task has been restored successfully",
      });
    } catch (error) {
      console.error('Error restoring task:', error);
      toast({
        title: "Error",
        description: "Failed to restore task",
        variant: "destructive",
      });
    }
  };

  const permanentlyDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
      toast({
        title: "Task permanently deleted",
        description: "The task has been permanently removed",
      });
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to permanently delete task",
        variant: "destructive",
      });
    }
  };

  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompletedState = !task.completed;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedState })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: newCompletedState } : task
        )
      );
      
      const action = newCompletedState ? 'completed' : 'marked as incomplete';
      toast({
        title: `Task ${action}`,
        description: `"${task.title}" has been ${action}`,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getTasks = (filter?: { completed?: boolean; category?: string; deleted?: boolean }) => {
    if (!user) return [];
    
    return tasks.filter(task => {
      if (task.userId !== user.id) return false;
      if (filter?.deleted !== undefined && task.isDeleted !== filter.deleted) return false;
      if (filter?.completed !== undefined && task.completed !== filter.completed) return false;
      if (filter?.category && task.category !== filter.category) return false;
      return true;
    });
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const addCategory = (category: string) => {
    if (categories.includes(category)) return;
    setCategories(prev => [...prev, category]);
    toast({
      title: "Category added",
      description: `"${category}" has been added to your categories`,
    });
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    toast({
      title: "Category removed",
      description: `"${category}" has been removed from your categories`,
    });
  };

  const getCompletionStats = () => {
    const activeTasks = getTasks({ deleted: false });
    const completed = activeTasks.filter(task => task.completed).length;
    const total = activeTasks.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        restoreTask,
        permanentlyDeleteTask,
        getTasks,
        getTaskById,
        addCategory,
        removeCategory,
        getCompletionStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
