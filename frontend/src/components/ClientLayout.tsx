'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <AuthProvider>
            <AuthGuard>
                {isLoginPage ? (
                    // Login page - no sidebar
                    <>{children}</>
                ) : (
                    // Dashboard pages - with sidebar
                    <div className="flex min-h-screen">
                        <Sidebar />
                        <main className="flex-1 ml-64 p-8">
                            {children}
                        </main>
                    </div>
                )}
            </AuthGuard>
        </AuthProvider>
    );
}
