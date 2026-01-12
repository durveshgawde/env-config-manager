'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { createVersion, Environment } from '@/lib/api';

const environments: Environment[] = ['dev', 'staging', 'prod'];

interface KeyValue {
    key: string;
    value: string;
}

export default function CreateConfigPage() {
    const router = useRouter();
    const [configName, setConfigName] = useState('');
    const [selectedEnv, setSelectedEnv] = useState<Environment>('dev');
    const [message, setMessage] = useState('');
    const [keyValues, setKeyValues] = useState<KeyValue[]>([
        { key: '', value: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addKeyValue = () => {
        setKeyValues([...keyValues, { key: '', value: '' }]);
    };

    const removeKeyValue = (index: number) => {
        if (keyValues.length > 1) {
            setKeyValues(keyValues.filter((_, i) => i !== index));
        }
    };

    const updateKeyValue = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...keyValues];
        updated[index][field] = value;
        setKeyValues(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!configName.trim()) {
            setError('Config name is required');
            return;
        }

        const validKeyValues = keyValues.filter(kv => kv.key.trim());
        if (validKeyValues.length === 0) {
            setError('At least one key-value pair is required');
            return;
        }

        // Build data object
        const data: Record<string, string> = {};
        for (const kv of validKeyValues) {
            data[kv.key.trim()] = kv.value;
        }

        try {
            setLoading(true);
            await createVersion(selectedEnv, configName.trim(), data, message || 'Initial config');
            router.push(`/configs/${selectedEnv}/${configName.trim()}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create config');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/"
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Create New Config</h1>
                    <p className="text-dark-400 mt-1">
                        Add a new configuration to your environment
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                    <div className="glass-card p-4 border border-accent-rose/50 bg-accent-rose/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-accent-rose" />
                            <p className="text-accent-rose">{error}</p>
                        </div>
                    </div>
                )}

                {/* Config Name */}
                <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Config Name
                    </label>
                    <input
                        type="text"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="e.g., auth-service, api-gateway, database-config"
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
                    />
                </div>

                {/* Environment Selector */}
                <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-dark-300 mb-3">
                        Environment
                    </label>
                    <div className="flex gap-3">
                        {environments.map((env) => (
                            <button
                                key={env}
                                type="button"
                                onClick={() => setSelectedEnv(env)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedEnv === env
                                        ? `badge-${env} text-white`
                                        : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                                    }`}
                            >
                                {env.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key-Value Pairs */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-dark-300">
                            Configuration Data (Key-Value Pairs)
                        </label>
                        <button
                            type="button"
                            onClick={addKeyValue}
                            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Field
                        </button>
                    </div>
                    <div className="space-y-3">
                        {keyValues.map((kv, index) => (
                            <div key={index} className="flex gap-3">
                                <input
                                    type="text"
                                    value={kv.key}
                                    onChange={(e) => updateKeyValue(index, 'key', e.target.value)}
                                    placeholder="KEY_NAME"
                                    className="flex-1 px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors font-mono"
                                />
                                <input
                                    type="text"
                                    value={kv.value}
                                    onChange={(e) => updateKeyValue(index, 'value', e.target.value)}
                                    placeholder="value"
                                    className="flex-1 px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeKeyValue(index)}
                                    disabled={keyValues.length === 1}
                                    className="p-3 rounded-lg bg-dark-800 hover:bg-accent-rose/20 hover:text-accent-rose disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Commit Message (Optional)
                    </label>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Initial configuration, Updated API keys"
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Config
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
