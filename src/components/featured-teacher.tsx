
'use client';

import { Trophy } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import StarRating from './star-rating';
import { useMemo } from 'react';

interface FeaturedTeacherProps {
  teacher: Teacher;
}

export default function FeaturedTeacher({ teacher }: FeaturedTeacherProps) {
  
  const averageRating = useMemo(() => {
    if (teacher.reviews.length === 0) return 0;
    const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / teacher.reviews.length;
  }, [teacher.reviews]);

  return (
    <div className="hidden md:flex items-center gap-4 mr-auto pl-4 border-l ml-4" onClick={(e) => e.stopPropagation()}>
        <Trophy className="h-6 w-6 text-amber-400 shine" />
        <div className="flex flex-col items-start">
             <span className="font-semibold text-sm text-primary shine">
                Destaque: {teacher.name}
            </span>
            <div className="flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="text-xs font-bold text-muted-foreground">{averageRating.toFixed(1)}</span>
            </div>
        </div>
    </div>
  );
}
