
'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName = keyof typeof LucideIcons;

export interface HeaderProps {
    pageTitle: string;
    pageIconName: IconName;
    children?: React.ReactNode;
}

const getIconComponent = (iconName: IconName): React.ElementType => {
    return LucideIcons[iconName] || LucideIcons.GraduationCap;
};

export default function Header({ pageTitle, pageIconName, children }: HeaderProps) {
  const PageIcon = getIconComponent(pageIconName);
    
  return (
    <header 
        className="w-full border-b bg-background relative bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: `url(https://storage.googleapis.com/datsal-latam-dev-f9z9.appspot.com/6c205e46-17b5-4e71-97b7-548981f9b097.png)`}}
    >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex items-center gap-4 mb-4">
                    <PageIcon className="h-10 w-10 text-primary" />
                    <h1 className={cn(
                        "text-5xl sm:text-6xl font-bold tracking-tighter",
                        "font-headline-retro text-primary-dark"
                    )}>
                        <span className="shine">{pageTitle}</span>
                    </h1>
                </div>
                {children}
            </div>
        </div>
    </header>
  );
}
