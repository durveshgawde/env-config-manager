'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    GitCompare,
    Plus,
    Minus,
    RefreshCcw,
    ArrowRight
} from 'lucide-react';
import { diffVersions, DiffResult, Environment } from '@/lib/api';
import EnvironmentBadge from '@/components/EnvironmentBadge';

function DiffViewerContent() {
    const searchParams = useSearchParams();

    const env = (searchParams.get('env') || 'dev') as Environment;
    const config = searchParams.get('config') || '';
    const fromVersion = parseInt(searchParams.get('from') || '1', 10);
    const toVersion = parseInt(searchParams.get('to') || '2', 10);

    const [diff, setDiff] = useState<DiffResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formEnv, setFormEnv] = useState<Environment>(env);
    const [formConfig, setFormConfig] = useState(config);
    const [formFrom, setFormFrom] = useState(fromVersion.toString());
    const [formTo, setFormTo] = useState(toVersion.toString());

    useEffect(() => {
        if (config && fromVersion && toVersion) {
            loadDiff();
        }
    }, [env, config, fromVersion, toVersion]);

    async function loadDiff() {
        if (!formConfig) return;

        try {
            setLoading(true);
            setError(null);
            const data = await diffVersions(formEnv, formConfig, parseInt(formFrom), parseInt(formTo));
            setDiff(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compute diff');
            setDiff(null);
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        loadDiff();
    }

    const hasAdditions = diff && Object.keys(diff.added).length > 0;
    const hasRemovals = diff && Object.keys(diff.removed).length > 0;
    const hasChanges = diff && Object.keys(diff.changed).length > 0;
    const hasDifferences = hasAdditions || hasRemovals || hasChanges;

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
                    <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                        <GitCompare className="w-8 h-8" />
                        Diff Viewer
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Compare configuration versions side-by-side
                    </p>
                </div>
            </div>

            {/* Diff Form */}
            <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-400 mb-2">
                            Environment
                        </label>
                        <select
                            value={formEnv}
                            onChange={(e) => setFormEnv(e.target.value as Environment)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                        >
                            <option value="dev">Development</option>
                            <option value="staging">Staging</option>
                            <option value="prod">Production</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-400 mb-2">
                            Config Name
                        </label>
                        <input
                            type="text"
                            value={formConfig}
                            onChange={(e) => setFormConfig(e.target.value)}
                            placeholder="e.g., auth-service"
                            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                From Version
                            </label>
                            <input
                                type="number"
                                value={formFrom}
                                onChange={(e) => setFormFrom(e.target.value)}
                                min="1"
                                className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <ArrowRight className="w-5 h-5 text-dark-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                To Version
                            </label>
                            <input
                                type="number"
                                value={formTo}
                                onChange={(e) => setFormTo(e.target.value)}
                                min="1"
                                className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={!formConfig || loading}
                            className="w-full btn-primary px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <RefreshCcw className="w-4 h-4 animate-spin" />
                            ) : (
                                <GitCompare className="w-4 h-4" />
                            )}
                            Compare
                        </button>
                    </div>
                </div>
            </form>

            {/* Loading State */}
            {loading && (
                <div className="glass-card p-12 text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Computing diff...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="glass-card p-8 text-center">
                    <p className="text-accent-rose mb-4">{error}</p>
                </div>
            )}

            {/* Diff Results */}
            {!loading && diff && (
                <div className="space-y-6">
                    {/* Summary Bar */}
                    <div className="glass-card p-4 flex items-center gap-6">
                        <EnvironmentBadge env={formEnv} />
                        <span className="text-dark-400">
                            <span className="font-medium text-white">{formConfig}</span>
                            {' '}v{formFrom} → v{formTo}
                        </span>
                        <div className="flex-1" />
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-accent-emerald">
                                <Plus className="w-4 h-4" />
                                {Object.keys(diff.added).length} added
                            </span>
                            <span className="flex items-center gap-1 text-accent-rose">
                                <Minus className="w-4 h-4" />
                                {Object.keys(diff.removed).length} removed
                            </span>
                            <span className="flex items-center gap-1 text-accent-purple">
                                <RefreshCcw className="w-4 h-4" />
                                {Object.keys(diff.changed).length} changed
                            </span>
                        </div>
                    </div>

                    {/* No Changes */}
                    {!hasDifferences && (
                        <div className="glass-card p-12 text-center">
                            <GitCompare className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                            <p className="text-dark-400">No differences between versions</p>
                        </div>
                    )}

                    {/* Added Keys */}
                    {hasAdditions && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-dark-700 bg-accent-emerald/10">
                                <h3 className="font-medium text-accent-emerald flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Added Keys ({Object.keys(diff.added).length})
                                </h3>
                            </div>
                            <div className="divide-y divide-dark-700">
                                {Object.entries(diff.added).map(([key, value]) => (
                                    <div key={key} className="p-4 diff-added">
                                        <p className="font-mono text-sm text-accent-emerald mb-2">+ {key}</p>
                                        <pre className="code-block p-3 text-sm overflow-x-auto">
                                            {JSON.stringify(value, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Removed Keys */}
                    {hasRemovals && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-dark-700 bg-accent-rose/10">
                                <h3 className="font-medium text-accent-rose flex items-center gap-2">
                                    <Minus className="w-5 h-5" />
                                    Removed Keys ({Object.keys(diff.removed).length})
                                </h3>
                            </div>
                            <div className="divide-y divide-dark-700">
                                {Object.entries(diff.removed).map(([key, value]) => (
                                    <div key={key} className="p-4 diff-removed">
                                        <p className="font-mono text-sm text-accent-rose mb-2">- {key}</p>
                                        <pre className="code-block p-3 text-sm overflow-x-auto">
                                            {JSON.stringify(value, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Changed Keys */}
                    {hasChanges && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-dark-700 bg-accent-purple/10">
                                <h3 className="font-medium text-accent-purple flex items-center gap-2">
                                    <RefreshCcw className="w-5 h-5" />
                                    Changed Keys ({Object.keys(diff.changed).length})
                                </h3>
                            </div>
                            <div className="divide-y divide-dark-700">
                                {Object.entries(diff.changed).map(([key, { from, to }]) => (
                                    <div key={key} className="p-4 diff-changed">
                                        <p className="font-mono text-sm text-accent-purple mb-3">~ {key}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-dark-400 mb-2">FROM (v{formFrom})</p>
                                                <pre className="code-block p-3 text-sm overflow-x-auto border border-accent-rose/30">
                                                    {JSON.stringify(from, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-xs text-dark-400 mb-2">TO (v{formTo})</p>
                                                <pre className="code-block p-3 text-sm overflow-x-auto border border-accent-emerald/30">
                                                    {JSON.stringify(to, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DiffPage() {
    return (
        <Suspense fallback={
            <div className="animate-fade-in">
                <div className="glass-card p-12 text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Loading diff viewer...</p>
                </div>
            </div>
        }>
            <DiffViewerContent />
        </Suspense>
    );
}
