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

export interface CreateConfigRequest {
    data: Record<string, unknown>;
    message?: string;
    created_by?: string;
}

export interface PromoteRequest {
    configName: string;
    fromEnv: Environment;
    toEnv: Environment;
    version: number;
}

export interface RollbackRequest {
    targetVersion: number;
    message?: string;
    created_by?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: unknown;
}
