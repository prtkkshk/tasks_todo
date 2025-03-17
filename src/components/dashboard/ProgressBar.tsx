
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  total: number;
  showText?: boolean;
  className?: string;
}

const ProgressBar = ({
  value,
  total,
  showText = true,
  className
}: ProgressBarProps) => {
  const percentage = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{value} of {total} completed</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
