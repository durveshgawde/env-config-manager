const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_CONFIG_API_KEY || '';

export type Environment = 'dev' | 'staging' | 'prod';

export interface Config {
    id: string;
    name: string;
    created_at: string;
}

export interface ConfigVersion {
    id: string;
    config_id: string;
    environment: Environment;
    version_number: number;
    data: Record<string, unknown>;
    message: string | null;
    created_at: string;
    created_by: string | null;
}

export interface DiffResult {
    added: Record<string, unknown>;
    removed: Record<string, unknown>;
    changed: Record<string, { from: unknown; to: unknown }>;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add API key header if configured
    if (API_KEY) {
        headers['X-API-Key'] = API_KEY;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...options,
    });

    const json: ApiResponse<T> = await res.json();

    if (!json.success) {
        throw new Error(typeof json.error === 'string' ? json.error : 'API Error');
    }

    return json.data as T;
}

// List all configs
export async function listConfigs(): Promise<Config[]> {
    return fetchApi<Config[]>('/configs');
}

// List versions for a config in an environment
export async function listVersions(env: Environment, configName: string): Promise<ConfigVersion[]> {
    return fetchApi<ConfigVersion[]>(`/configs/${env}/${configName}`);
}

// Get specific version
export async function getVersion(
    env: Environment,
    configName: string,
    version: number
): Promise<ConfigVersion> {
    return fetchApi<ConfigVersion>(`/configs/${env}/${configName}/${version}`);
}

// Create new config version
export async function createVersion(
    env: Environment,
    configName: string,
    data: Record<string, unknown>,
    message?: string
): Promise<ConfigVersion> {
    return fetchApi<ConfigVersion>(`/configs/${env}/${configName}`, {
        method: 'POST',
        body: JSON.stringify({ data, message }),
    });
}

// Get diff between versions
export async function diffVersions(
    env: Environment,
    configName: string,
    from: number,
    to: number
): Promise<DiffResult> {
    return fetchApi<DiffResult>(`/configs/${env}/${configName}/diff?from=${from}&to=${to}`);
}

// Rollback to a previous version
export async function rollback(
    env: Environment,
    configName: string,
    targetVersion: number,
    message?: string
): Promise<ConfigVersion> {
    return fetchApi<ConfigVersion>(`/configs/${env}/${configName}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ targetVersion, message }),
    });
}

// Promote config between environments
export async function promote(
    configName: string,
    fromEnv: Environment,
    toEnv: Environment,
    version: number
): Promise<ConfigVersion> {
    return fetchApi<ConfigVersion>('/configs/promote', {
        method: 'POST',
        body: JSON.stringify({ configName, fromEnv, toEnv, version }),
    });
}
