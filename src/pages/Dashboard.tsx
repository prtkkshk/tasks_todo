import { useState, useEffect } from "react";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import TaskList from "@/components/tasks/TaskList";
import ProgressBar from "@/components/dashboard/ProgressBar";
import TaskForm from "@/components/tasks/TaskForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock, List, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  format,
  isWithinInterval,
  addDays,
  startOfDay,
  endOfDay,
} from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const { getTasks, getCompletionStats } = useTask();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const currentHour = new Date().getHours();
    let newGreeting = "";

    if (currentHour < 12) {
      newGreeting = "Good morning";
    } else if (currentHour < 18) {
      newGreeting = "Good afternoon";
    } else {
      newGreeting = "Good evening";
    }

    setGreeting(newGreeting);
  }, []);

  const stats = getCompletionStats();
  const recentTasks = getTasks({ deleted: false }).slice(0, 5);

  // Get tasks due within the next 24 hours
  const now = new Date();
  const dueSoonTasks = getTasks({ deleted: false, completed: false })
    .filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isWithinInterval(dueDate, {
        start: startOfDay(now),
        end: endOfDay(addDays(now, 1)),
      });
    })
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 3);

  const highPriorityTasks = getTasks({ deleted: false, completed: false })
    .filter((task) => task.priority === "high")
    .slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">
              {greeting}, {user?.name || "there"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </p>
          </div>
          <TaskForm />
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Task Progress</CardTitle>
              <CardDescription>
                Your overall task completion status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBar value={stats.completed} total={stats.total} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Due Soon Tasks */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-orange-500" />
                  <CardTitle>Due Soon</CardTitle>
                </div>
                <CardDescription>Tasks due within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {dueSoonTasks.length > 0 ? (
                  <TaskList
                    tasks={dueSoonTasks}
                    emptyMessage="No tasks due soon"
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No tasks due within 24 hours
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* High Priority Tasks */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-red-500" />
                  <CardTitle>High Priority</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {highPriorityTasks.length > 0 ? (
                  <TaskList
                    tasks={highPriorityTasks}
                    emptyMessage="No high priority tasks"
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No high priority tasks
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <List size={18} className="text-blue-500" />
                  <CardTitle>Recent Tasks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={recentTasks}
                  emptyMessage="No tasks added yet"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
