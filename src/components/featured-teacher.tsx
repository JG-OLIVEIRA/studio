
'use client';

import { Trophy } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FeaturedTeacherProps {
  teacher: Teacher;
}

export default function FeaturedTeacher({ teacher }: FeaturedTeacherProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden md:flex items-center gap-2 mr-auto pl-4">
            <Trophy className="h-5 w-5 text-amber-400 shine" />
            <span className="font-semibold text-sm text-primary shine">
              {teacher.name}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Professor em Destaque</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
