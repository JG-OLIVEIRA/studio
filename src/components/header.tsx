
'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
            {/* Top Bar - Consistent across all pages */}
            <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-3">
                    <LucideIcons.GraduationCap className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold tracking-tight">CcompTeacherRate</span>
                </Link>
            </div>

            {/* Bottom Bar - Page specific content */}
            <div className="flex flex-col items-center justify-center py-6">
                <div className="flex items-center gap-4 mb-4">
                    <PageIcon className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
                        {pageTitle}
                    </h1>
                </div>
                {children}
            </div>
        </div>
    </header>
  );
}
