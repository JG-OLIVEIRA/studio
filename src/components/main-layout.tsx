
'use client';

import { cn } from "@/lib/utils";

interface MainLayoutProps {
    children: React.ReactNode;
    headerContent: React.ReactNode;
    isSticky?: boolean;
}

export default function MainLayout({ children, headerContent, isSticky = true }: MainLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-background font-sans text-foreground">
            <header className={cn(
                "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                isSticky && "sticky top-0 z-40 w-full border-b shadow-sm"
            )}>
                <div className="container mx-auto px-4 flex h-auto min-h-24 items-center text-center flex-col justify-center py-6">
                    {headerContent}
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}
