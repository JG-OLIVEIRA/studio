import { Trophy, Sparkles } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './star-rating';
import AIReviewInsights from './ai-review-insights';
import { Button } from './ui/button';

interface TeacherCardProps {
  teacher: Teacher;
  isTopTeacher: boolean;
}

export default function TeacherCard({ teacher, isTopTeacher }: TeacherCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        isTopTeacher && 'border-primary shadow-primary/20 hover:shadow-primary/30'
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
        {isTopTeacher && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Trophy className="h-4 w-4" />
            <span>Top Teacher</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
          <StarRating rating={teacher.rating} />
          <span className="text-sm font-bold text-muted-foreground">{teacher.rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <AIReviewInsights teacher={teacher}>
          <Button variant="secondary" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </AIReviewInsights>
      </CardFooter>
    </Card>
  );
}
