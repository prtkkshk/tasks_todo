import { useState } from "react";
import { useTask } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  ChevronDown,
  Tag,
  CheckCircle,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskFilterProps {
  onFilterChange: (filters: TaskFilters) => void;
  className?: string;
}

export interface TaskFilters {
  status: "all" | "active" | "completed";
  category: string | null;
  priority: "all" | "low" | "medium" | "high";
  date: Date | null;
}

const TaskFilter = ({ onFilterChange, className }: TaskFilterProps) => {
  const { categories } = useTask();
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    category: null,
    priority: "all",
    date: null,
  });

  const handleChange = <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3",
        className
      )}
    >
      {/* Status Filter */}
      <Tabs
        value={filters.status}
        onValueChange={(value) =>
          handleChange("status", value as TaskFilters["status"])
        }
        className="w-full sm:w-auto"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category Filter */}
      <Select
        value={filters.category || "all"}
        onValueChange={(value) =>
          handleChange("category", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <div className="flex items-center gap-2">
            <Tag size={16} />
            <SelectValue placeholder="Category" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectGroup>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority}
        onValueChange={(value) =>
          handleChange("priority", value as TaskFilters["priority"])
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <div className="flex items-center gap-2">
            <Star size={16} />
            <SelectValue placeholder="Priority" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[180px] justify-start text-left font-normal",
              !filters.date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.date ? format(filters.date, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.date || undefined}
            onSelect={(date) => handleChange("date", date)}
            initialFocus
            footer={
              filters.date && (
                <div className="flex justify-center pb-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleChange("date", null)}
                    size="sm"
                  >
                    Clear Date
                  </Button>
                </div>
              )
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskFilter;
