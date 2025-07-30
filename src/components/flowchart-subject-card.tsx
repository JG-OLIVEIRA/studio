
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FlowchartSubjectCardProps {
  subjectName: string;
  onClick: () => void;
  className?: string;
}

export default function FlowchartSubjectCard({ subjectName, onClick, className }: FlowchartSubjectCardProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn("h-auto w-48 whitespace-normal text-center justify-center py-2 transition-all hover:bg-primary/10 hover:border-primary", className)}
    >
      {subjectName}
    </Button>
  );
}
