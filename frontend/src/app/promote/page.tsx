'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowUpRight,
    RefreshCcw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { promote, Environment, ConfigVersion } from '@/lib/api';
import EnvironmentBadge from '@/components/EnvironmentBadge';

const environments: Environment[] = ['dev', 'staging', 'prod'];

export default function PromotePage() {
    const [configName, setConfigName] = useState('');
    const [fromEnv, setFromEnv] = useState<Environment>('dev');
    const [toEnv, setToEnv] = useState<Environment>('staging');
    const [version, setVersion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ConfigVersion | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handlePromote(e: React.FormEvent) {
        e.preventDefault();

        if (!configName || !version) {
            setError('Please fill in all fields');
            return;
        }

        if (fromEnv === toEnv) {
            setError('Source and target environments must be different');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const newVersion = await promote(
                configName,
                fromEnv,
                toEnv,
                parseInt(version, 10)
            );

            setResult(newVersion);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Promotion failed');
        } finally {
            setLoading(false);
        }
    }

    function getAvailableTargets(source: Environment): Environment[] {
        return environments.filter(e => e !== source);
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
                    <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                        <ArrowUpRight className="w-8 h-8" />
                        Promote Configuration
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Safely promote config versions between environments
                    </p>
                </div>
            </div>

            {/* Info Card */}
            <div className="glass-card p-6 mb-8 border-l-4 border-accent-cyan">
                <h3 className="font-medium text-accent-cyan mb-2">How Promotion Works</h3>
                <ul className="text-dark-400 text-sm space-y-1">
                    <li>• Copies the exact configuration data from source to target environment</li>
                    <li>• Creates a new version in the target environment (immutable)</li>
                    <li>• Source configuration remains unchanged</li>
                    <li>• Recommended flow: <span className="text-white">dev → staging → prod</span></li>
                </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Promote Form */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-6">Promotion Details</h2>

                    <form onSubmit={handlePromote} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                Configuration Name
                            </label>
                            <input
                                type="text"
                                value={configName}
                                onChange={(e) => setConfigName(e.target.value)}
                                placeholder="e.g., auth-service"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                Source Environment
                            </label>
                            <div className="flex gap-2">
                                {environments.map((env) => (
                                    <button
                                        key={env}
                                        type="button"
                                        onClick={() => {
                                            setFromEnv(env);
                                            // Auto-select next environment as target
                                            const targets = getAvailableTargets(env);
                                            if (!targets.includes(toEnv)) {
                                                setToEnv(targets[0]);
                                            }
                                        }}
                                        className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${fromEnv === env
                                                ? `badge-${env} text-white`
                                                : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                                            }`}
                                    >
                                        {env.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                Target Environment
                            </label>
                            <div className="flex gap-2">
                                {getAvailableTargets(fromEnv).map((env) => (
                                    <button
                                        key={env}
                                        type="button"
                                        onClick={() => setToEnv(env)}
                                        className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${toEnv === env
                                                ? `badge-${env} text-white`
                                                : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                                            }`}
                                    >
                                        {env.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-400 mb-2">
                                Version Number
                            </label>
                            <input
                                type="number"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder="e.g., 5"
                                min="1"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !configName || !version}
                            className="w-full btn-primary px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCcw className="w-5 h-5 animate-spin" />
                                    Promoting...
                                </>
                            ) : (
                                <>
                                    <ArrowUpRight className="w-5 h-5" />
                                    Promote Configuration
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Preview / Result */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-6">Promotion Preview</h2>

                    {/* Flow Visualization */}
                    <div className="flex items-center justify-center gap-4 mb-8 py-8">
                        <div className="text-center">
                            <EnvironmentBadge env={fromEnv} size="lg" />
                            <p className="text-dark-400 text-sm mt-2">Source</p>
                            {configName && (
                                <p className="text-white text-sm mt-1">
                                    {configName} v{version || '?'}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-accent-cyan">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-accent-cyan to-accent-purple" />
                            <ArrowUpRight className="w-6 h-6" />
                            <div className="w-12 h-0.5 bg-gradient-to-r from-accent-purple to-accent-cyan" />
                        </div>
                        <div className="text-center">
                            <EnvironmentBadge env={toEnv} size="lg" />
                            <p className="text-dark-400 text-sm mt-2">Target</p>
                            {configName && (
                                <p className="text-white text-sm mt-1">
                                    {configName} (new version)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-lg bg-accent-rose/10 border border-accent-rose/30 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-accent-rose">Promotion Failed</p>
                                <p className="text-dark-300 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Result */}
                    {result && (
                        <div className="p-4 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-accent-emerald">Promotion Successful!</p>
                                    <p className="text-dark-300 text-sm mt-1">
                                        Created version <span className="text-white font-medium">v{result.version_number}</span> in{' '}
                                        <span className="uppercase font-medium text-white">{result.environment}</span>
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href={`/configs/${result.environment}/${configName}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/30 transition-colors"
                                        >
                                            View Versions
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!error && !result && (
                        <div className="text-center text-dark-400 py-8">
                            <p>Fill in the form to preview your promotion</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
