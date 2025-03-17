import { useState, useEffect } from "react";
import { useTask, Task } from "@/context/TaskContext";
import Layout from "@/components/layout/Layout";
import TaskList from "@/components/tasks/TaskList";
import TaskFilter, { TaskFilters } from "@/components/tasks/TaskFilter";
import TaskForm from "@/components/tasks/TaskForm";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const TasksPage = () => {
  const { getTasks } = useTask();
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    category: null,
    priority: "all",
    date: null,
  });
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    // Get all non-deleted tasks
    let tasks = getTasks({ deleted: false });

    // Apply status filter
    if (filters.status === "active") {
      tasks = tasks.filter((task) => !task.completed);
    } else if (filters.status === "completed") {
      tasks = tasks.filter((task) => task.completed);
    }

    // Apply category filter
    if (filters.category) {
      tasks = tasks.filter((task) => task.category === filters.category);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      tasks = tasks.filter((task) => task.priority === filters.priority);
    }

    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filterDate.setHours(0, 0, 0, 0);

      tasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === filterDate.getTime();
      });
    }

    setFilteredTasks(tasks);
  }, [getTasks, filters]);

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  // Group tasks by creation date
  const groupedTasks = filteredTasks.reduce(
    (groups, task) => {
      const date = format(new Date(task.createdAt), "MMMM d, yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    },
    {} as Record<string, Task[]>
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <TaskForm />
        </div>

        {/* Filters */}
        <TaskFilter onFilterChange={handleFilterChange} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="log">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <TaskList
              tasks={filteredTasks}
              emptyMessage={
                filters.status === "all" &&
                !filters.category &&
                filters.priority === "all" &&
                !filters.date
                  ? "No tasks yet. Create your first task!"
                  : "No tasks match your filters."
              }
            />
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="space-y-6">
                {Object.entries(groupedTasks).map(([date, tasks]) => (
                  <div key={date} className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {date}
                    </h3>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{task.title}</span>
                              {task.completed && (
                                <span className="text-xs text-muted-foreground">
                                  (Completed)
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(task.createdAt), "h:mm a")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedTasks).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default TasksPage;
