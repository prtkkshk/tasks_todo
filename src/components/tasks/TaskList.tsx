
import { Task, useTask } from "@/context/TaskContext";
import TaskItem from "@/components/tasks/TaskItem";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  isTrash?: boolean;
  className?: string;
}

const TaskList = ({ 
  tasks, 
  emptyMessage = "No tasks found", 
  isTrash = false,
  className
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", className)}>
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TaskItem task={task} isTrash={isTrash} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
