'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    GitCompare,
    ArrowUpRight,
    Settings,
    Layers,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/diff', label: 'Diff Viewer', icon: GitCompare },
    { href: '/promote', label: 'Promote', icon: ArrowUpRight },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-950 border-r border-dark-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-dark-700">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg gradient-text">Config Manager</h1>
                        <p className="text-xs text-dark-400">Version Control</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border border-accent-cyan/30'
                                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-accent-cyan' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-dark-700 space-y-3">
                {/* User Email */}
                {user && (
                    <div className="glass-card p-3">
                        <div className="flex items-center gap-2 text-dark-300 text-sm">
                            <User className="w-4 h-4 text-accent-cyan" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>
                )}

                {/* Environment Status */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 text-dark-400 text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Environment</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 text-xs rounded-full badge-dev text-white">dev</span>
                        <span className="px-2 py-1 text-xs rounded-full badge-staging text-white">staging</span>
                        <span className="px-2 py-1 text-xs rounded-full badge-prod text-white">prod</span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-dark-800 hover:bg-accent-rose/20 hover:text-accent-rose text-dark-400 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

