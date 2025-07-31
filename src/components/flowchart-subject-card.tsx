
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { CheckCircle2, Circle } from "lucide-react";

interface FlowchartSubjectCardProps {
  subjectName: string;
  isCompleted: boolean;
  onClick: () => void;
  className?: string;
}

export default function FlowchartSubjectCard({ subjectName, isCompleted, onClick, className }: FlowchartSubjectCardProps) {
  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "h-auto min-h-[40px] whitespace-normal justify-start py-2 transition-all text-left text-xs",
        "hover:bg-primary/10 hover:border-primary",
        "bg-background",
        isCompleted && "bg-primary/80 text-primary-foreground hover:bg-primary",
        className
      )}
    >
      {isCompleted ? <CheckCircle2 className="mr-2 h-4 w-4 flex-shrink-0" /> : <Circle className="mr-2 h-4 w-4 flex-shrink-0" />}
      <span className="flex-1">{subjectName}</span>
    </Button>
  );
}
