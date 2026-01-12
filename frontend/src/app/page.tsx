'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    RefreshCcw,
    ChevronRight,
    Database,
    Server,
    AlertCircle
} from 'lucide-react';
import { listConfigs, Config, Environment } from '@/lib/api';
import EnvironmentBadge from '@/components/EnvironmentBadge';

const environments: Environment[] = ['dev', 'staging', 'prod'];

export default function HomePage() {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEnv, setSelectedEnv] = useState<Environment>('dev');

    useEffect(() => {
        loadConfigs();
    }, []);

    async function loadConfigs() {
        try {
            setLoading(true);
            setError(null);
            const data = await listConfigs();
            setConfigs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load configs');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Configuration Dashboard</h1>
                    <p className="text-dark-400 mt-2">
                        Manage, version, and deploy your application configurations
                    </p>
                </div>
                <button
                    onClick={loadConfigs}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Environment Selector */}
            <div className="glass-card p-4 mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-dark-400 font-medium">Select Environment:</span>
                    <div className="flex gap-2">
                        {environments.map((env) => (
                            <button
                                key={env}
                                onClick={() => setSelectedEnv(env)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${selectedEnv === env
                                        ? `badge-${env} text-white`
                                        : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                                    }`}
                            >
                                {env.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 hover-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-cyan/50 flex items-center justify-center">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Total Configs</p>
                            <p className="text-2xl font-bold">{configs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-purple/50 flex items-center justify-center">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Active Environment</p>
                            <p className="text-2xl font-bold uppercase">{selectedEnv}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-emerald/50 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Status</p>
                            <p className="text-2xl font-bold text-accent-emerald">Healthy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Config List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Configuration Entities</h2>
                    <Link
                        href="/create"
                        className="btn-primary px-4 py-2 rounded-lg text-white flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Config
                    </Link>
                </div>

                {loading && (
                    <div className="p-12 text-center">
                        <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                        <p className="text-dark-400">Loading configurations...</p>
                    </div>
                )}

                {error && (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-accent-rose mx-auto mb-4" />
                        <p className="text-accent-rose font-medium mb-2">Failed to load configs</p>
                        <p className="text-dark-400 text-sm mb-4">{error}</p>
                        <button
                            onClick={loadConfigs}
                            className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && configs.length === 0 && (
                    <div className="p-12 text-center">
                        <Database className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                        <p className="text-dark-400 mb-2">No configurations yet</p>
                        <p className="text-dark-500 text-sm">Create your first config to get started</p>
                    </div>
                )}

                {!loading && !error && configs.length > 0 && (
                    <ul className="divide-y divide-dark-700">
                        {configs.map((config) => (
                            <li key={config.id}>
                                <Link
                                    href={`/configs/${selectedEnv}/${config.name}`}
                                    className="flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                                            <Database className="w-5 h-5 text-accent-cyan" />
                                        </div>
                                        <div>
                                            <p className="font-medium group-hover:text-accent-cyan transition-colors">
                                                {config.name}
                                            </p>
                                            <p className="text-dark-500 text-sm">
                                                Created {new Date(config.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <EnvironmentBadge env={selectedEnv} size="sm" />
                                        <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-accent-cyan transition-colors" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
