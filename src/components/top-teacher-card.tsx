
import Image from 'next/image';
import { Trophy, Book } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import StarRating from './star-rating';

interface TopTeacherCardProps {
  teacher: Teacher & { averageRating: number; subject: string };
}

export function TopTeacherCard({ teacher }: TopTeacherCardProps) {
  return (
    <section aria-labelledby="top-ranked-teacher" className="mb-12">
      <h2 id="top-ranked-teacher" className="text-2xl font-bold tracking-tight text-center mb-6">
        Professor em Destaque
      </h2>
      <Card className="overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300 bg-gradient-to-br from-secondary via-card to-card">
        <div className="grid md:grid-cols-3 items-center">
          <div className="p-6 md:col-span-2">
            <CardHeader className="p-0">
                <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-amber-400" />
                    <div>
                        <CardTitle className="text-2xl font-bold text-primary">{teacher.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-md mt-1">
                            <Book className="h-4 w-4" />
                            {teacher.subject}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="flex items-center gap-4">
                <StarRating rating={teacher.averageRating} className="text-amber-400" />
                <div className="text-xl font-bold">
                  {teacher.averageRating.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ 5.0</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado em {teacher.reviews.length} avaliações
              </p>
            </CardContent>
          </div>
          <div className="hidden md:block h-full">
            <div className="relative h-full w-full min-h-[150px]">
                <Image
                src="https://placehold.co/400x400.png"
                alt={`Foto de ${teacher.name}`}
                data-ai-hint="professional teacher portrait"
                fill
                className="object-cover"
                />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
