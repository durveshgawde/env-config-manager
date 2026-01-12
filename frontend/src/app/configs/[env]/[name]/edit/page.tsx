'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    RefreshCcw,
    Lock
} from 'lucide-react';
import { listVersions, createVersion, ConfigVersion, Environment } from '@/lib/api';

interface KeyValue {
    key: string;
    value: string;
    isSecret: boolean;
}

const SENSITIVE_PATTERNS = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'CREDENTIAL'];

function isSecretKey(key: string): boolean {
    const upperKey = key.toUpperCase();
    return SENSITIVE_PATTERNS.some(pattern => upperKey.includes(pattern));
}

export default function EditConfigPage() {
    const params = useParams();
    const router = useRouter();
    const env = params.env as Environment;
    const name = params.name as string;

    const [keyValues, setKeyValues] = useState<KeyValue[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentVersion, setCurrentVersion] = useState<number>(0);

    useEffect(() => {
        loadLatestVersion();
    }, [env, name]);

    async function loadLatestVersion() {
        try {
            setLoading(true);
            setError(null);
            const versions = await listVersions(env, name);

            if (versions.length > 0) {
                const latest = versions[0];
                setCurrentVersion(latest.version_number);

                // Convert data object to key-value pairs
                const pairs: KeyValue[] = Object.entries(latest.data).map(([key, value]) => ({
                    key,
                    value: String(value),
                    isSecret: isSecretKey(key)
                }));

                if (pairs.length === 0) {
                    pairs.push({ key: '', value: '', isSecret: false });
                }

                setKeyValues(pairs);
            } else {
                setKeyValues([{ key: '', value: '', isSecret: false }]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load config');
        } finally {
            setLoading(false);
        }
    }

    const addKeyValue = () => {
        setKeyValues([...keyValues, { key: '', value: '', isSecret: false }]);
    };

    const removeKeyValue = (index: number) => {
        if (keyValues.length > 1) {
            setKeyValues(keyValues.filter((_, i) => i !== index));
        }
    };

    const updateKeyValue = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...keyValues];
        updated[index][field] = value;
        // Auto-detect if key is sensitive
        if (field === 'key') {
            updated[index].isSecret = isSecretKey(value);
        }
        setKeyValues(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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
            setSaving(true);
            await createVersion(env, name, data, message || `Updated from v${currentVersion}`);
            router.push(`/configs/${env}/${name}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save config');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCcw className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-4" />
                    <p className="text-dark-400">Loading config...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/configs/${env}/${name}`}
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Edit {name}</h1>
                    <p className="text-dark-400 mt-1">
                        Editing v{currentVersion} in {env.toUpperCase()} - saves as new version
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

                {/* Info about encryption */}
                <div className="glass-card p-4 border-l-4 border-accent-cyan">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-accent-cyan mt-0.5" />
                        <div>
                            <p className="text-sm text-dark-300">
                                <span className="text-accent-cyan font-medium">Auto-encryption:</span>{' '}
                                Keys containing SECRET, KEY, PASSWORD, TOKEN, or CREDENTIAL are automatically encrypted.
                            </p>
                        </div>
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
                            <div key={index} className="flex gap-3 items-center">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={kv.key}
                                        onChange={(e) => updateKeyValue(index, 'key', e.target.value)}
                                        placeholder="KEY_NAME"
                                        className={`w-full px-4 py-3 rounded-lg bg-dark-800 border focus:outline-none focus:ring-1 transition-colors font-mono ${kv.isSecret
                                                ? 'border-accent-amber focus:border-accent-amber focus:ring-accent-amber'
                                                : 'border-dark-600 focus:border-accent-cyan focus:ring-accent-cyan'
                                            }`}
                                    />
                                    {kv.isSecret && (
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-amber" />
                                    )}
                                </div>
                                <input
                                    type={kv.isSecret ? "password" : "text"}
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
                        placeholder={`Updated from v${currentVersion}`}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Link
                        href={`/configs/${env}/${name}`}
                        className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save as v{currentVersion + 1}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
