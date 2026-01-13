'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Loading...</p>
                </div>
            </div>
        );
    }

    // On login page, don't guard
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Not authenticated, will redirect
    if (!user) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Authenticated, show content
    return <>{children}</>;
}
