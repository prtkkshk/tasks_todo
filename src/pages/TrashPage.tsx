
import { useTask } from "@/context/TaskContext";
import Layout from "@/components/layout/Layout";
import TaskList from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

const TrashPage = () => {
  const { getTasks, tasks, permanentlyDeleteTask } = useTask();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  const deletedTasks = getTasks({ deleted: true });
  
  const handleEmptyTrash = () => {
    deletedTasks.forEach(task => {
      permanentlyDeleteTask(task.id);
    });
    toast({
      title: "Trash emptied",
      description: "All items have been permanently deleted",
    });
    setIsConfirmDialogOpen(false);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trash</h1>
          
          <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={deletedTasks.length === 0}
              >
                Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all items
                  in the trash.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmptyTrash}>
                  Empty Trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {/* Task List */}
        <p className="text-muted-foreground text-sm">
          Items in trash will be automatically deleted after 30 days.
        </p>
        
        <TaskList 
          tasks={deletedTasks} 
          emptyMessage="Your trash is empty" 
          isTrash={true}
        />
      </motion.div>
    </Layout>
  );
};

export default TrashPage;
