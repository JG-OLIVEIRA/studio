
'use client';

import Header from "./header";
import type { HeaderProps } from "./header";

interface MainLayoutProps {
    children: React.ReactNode;
    headerProps: HeaderProps;
}

export default function MainLayout({ children, headerProps }: MainLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-background font-sans text-foreground">
            <Header {...headerProps} />
            <main>
                {children}
            </main>
        </div>
    );
}
