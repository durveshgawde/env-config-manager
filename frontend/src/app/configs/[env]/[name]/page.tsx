'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    RefreshCcw,
    GitCompare,
    RotateCcw,
    Clock,
    User,
    FileJson,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { listVersions, rollback, ConfigVersion, Environment } from '@/lib/api';
import EnvironmentBadge from '@/components/EnvironmentBadge';

export default function ConfigVersionsPage() {
    const params = useParams();
    const env = params.env as Environment;
    const name = params.name as string;

    const [versions, setVersions] = useState<ConfigVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
    const [rollingBack, setRollingBack] = useState<number | null>(null);

    useEffect(() => {
        loadVersions();
    }, [env, name]);

    async function loadVersions() {
        try {
            setLoading(true);
            setError(null);
            const data = await listVersions(env, name);
            setVersions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load versions');
        } finally {
            setLoading(false);
        }
    }

    async function handleRollback(targetVersion: number) {
        if (!confirm(`Are you sure you want to rollback to version ${targetVersion}?`)) {
            return;
        }

        try {
            setRollingBack(targetVersion);
            await rollback(env, name, targetVersion, `Rollback to v${targetVersion}`);
            await loadVersions();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Rollback failed');
        } finally {
            setRollingBack(null);
        }
    }

    function toggleExpand(versionNumber: number) {
        setExpandedVersion(expandedVersion === versionNumber ? null : versionNumber);
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/"
                    className="w-10 h-10 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold gradient-text">{name}</h1>
                        <EnvironmentBadge env={env} />
                    </div>
                    <p className="text-dark-400 mt-1">
                        Version history and configuration data
                    </p>
                </div>
                <button
                    onClick={loadVersions}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Actions Bar */}
            <div className="glass-card p-4 mb-6 flex items-center justify-between">
                <div className="text-dark-400">
                    <span className="font-medium text-white">{versions.length}</span> versions tracked
                </div>
                <div className="flex gap-2">
                    {versions.length >= 2 && (
                        <Link
                            href={`/diff?env=${env}&config=${name}&from=${versions[1]?.version_number}&to=${versions[0]?.version_number}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
                        >
                            <GitCompare className="w-4 h-4" />
                            Compare Latest
                        </Link>
                    )}
                </div>
            </div>

            {/* Version List */}
            {loading && (
                <div className="glass-card p-12 text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Loading versions...</p>
                </div>
            )}

            {error && (
                <div className="glass-card p-8 text-center">
                    <p className="text-accent-rose mb-4">{error}</p>
                    <button
                        onClick={loadVersions}
                        className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && versions.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <FileJson className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400">No versions found for this environment</p>
                </div>
            )}

            {!loading && !error && versions.length > 0 && (
                <div className="space-y-4">
                    {versions.map((version, index) => (
                        <div
                            key={version.id}
                            className={`glass-card overflow-hidden hover-card ${index === 0 ? 'ring-2 ring-accent-cyan/30' : ''
                                }`}
                        >
                            {/* Version Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(version.version_number)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${index === 0
                                            ? 'bg-gradient-to-br from-accent-cyan to-accent-purple'
                                            : 'bg-dark-700'
                                        }`}>
                                        <span className="font-bold text-lg">v{version.version_number}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium flex items-center gap-2">
                                            {version.message || `Version ${version.version_number}`}
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-accent-cyan/20 text-accent-cyan">
                                                    LATEST
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-dark-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(version.created_at).toLocaleString()}
                                            </span>
                                            {version.created_by && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {version.created_by}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {index > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRollback(version.version_number);
                                            }}
                                            disabled={rollingBack !== null}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30 transition-colors disabled:opacity-50"
                                        >
                                            {rollingBack === version.version_number ? (
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="w-4 h-4" />
                                            )}
                                            Rollback
                                        </button>
                                    )}
                                    {expandedVersion === version.version_number ? (
                                        <ChevronUp className="w-5 h-5 text-dark-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-dark-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Data View */}
                            {expandedVersion === version.version_number && (
                                <div className="border-t border-dark-700 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-dark-400 font-medium">Configuration Data</span>
                                        <span className="text-xs text-dark-500">
                                            {Object.keys(version.data).length} keys
                                        </span>
                                    </div>
                                    <pre className="code-block p-4 overflow-x-auto text-dark-200">
                                        {JSON.stringify(version.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
