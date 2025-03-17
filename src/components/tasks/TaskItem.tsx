import { useState } from "react";
import { Task, useTask } from "@/context/TaskContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, MoreHorizontal, Star, Clock, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
  task: Task;
  showActions?: boolean;
  isTrash?: boolean;
}

const TaskItem = ({
  task,
  showActions = true,
  isTrash = false,
}: TaskItemProps) => {
  const {
    completeTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    updateTask,
    categories,
  } = useTask();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || "",
    category: task.category || "",
    priority: task.priority,
    dueDate: task.dueDate || "",
  });

  const handleToggleComplete = () => {
    completeTask(task.id);
  };

  const handleDelete = () => {
    if (isTrash) {
      setIsDeleting(true);
      setTimeout(() => {
        permanentlyDeleteTask(task.id);
      }, 300);
    } else {
      deleteTask(task.id);
    }
  };

  const handleRestore = () => {
    restoreTask(task.id);
  };

  const handleEdit = () => {
    updateTask(task.id, editedTask);
    setIsEditing(false);
  };

  // Format due date if exists
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "PPP")
    : null;

  // Check if task is overdue
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  // Priority color mapping
  const priorityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    medium:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-start gap-3 p-4 rounded-lg border border-border transition-all",
          "hover:shadow-sm hover:border-primary/20",
          task.completed && "bg-muted/50",
          isDeleting && "opacity-0 scale-95 transition-all duration-300",
          "animate-scale-in"
        )}
      >
        {/* Task Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            className={cn(
              task.completed ? "border-primary" : "border-muted-foreground/50"
            )}
            disabled={isTrash}
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            {/* Task Title */}
            <h3
              className={cn(
                "text-base font-medium leading-tight",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>

            {/* Task Description */}
            {task.description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground line-clamp-2",
                  task.completed && "line-through"
                )}
              >
                {task.description}
              </p>
            )}

            {/* Task Metadata */}
            <div className="flex flex-wrap gap-2 mt-2">
              {/* Category Badge */}
              {task.category && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-xs"
                >
                  <Tag size={12} />
                  {task.category}
                </Badge>
              )}

              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-xs",
                  priorityColors[task.priority]
                )}
              >
                <Star size={12} />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>

              {/* Due Date Badge */}
              {formattedDueDate && (
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue &&
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  )}
                >
                  <Clock size={12} />
                  {formattedDueDate}
                  {isOverdue && " (Overdue)"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Task Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isTrash ? (
                <>
                  <DropdownMenuItem onClick={handleRestore}>
                    Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete permanently
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={editedTask.title}
                            onChange={(e) =>
                              setEditedTask({
                                ...editedTask,
                                title: e.target.value,
                              })
                            }
                            placeholder="Task title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editedTask.description}
                            onChange={(e) =>
                              setEditedTask({
                                ...editedTask,
                                description: e.target.value,
                              })
                            }
                            placeholder="Task description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={editedTask.category}
                            onValueChange={(value) =>
                              setEditedTask({ ...editedTask, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={editedTask.priority}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setEditedTask({ ...editedTask, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={editedTask.dueDate}
                            onChange={(e) =>
                              setEditedTask({
                                ...editedTask,
                                dueDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button onClick={handleEdit} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash size={16} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
};

export default TaskItem;
