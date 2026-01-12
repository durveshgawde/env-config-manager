import { supabase } from '../lib/supabase';
import {
    Config,
    ConfigVersion,
    DiffResult,
    Environment,
    CreateConfigRequest,
    PromoteRequest
} from '../types';

/**
 * Get or create a config entity by name
 */
export async function getOrCreateConfig(name: string): Promise<Config> {
    // Try to find existing config
    const { data: existing, error: findError } = await supabase
        .from('configs')
        .select('*')
        .eq('name', name)
        .single();

    if (existing) return existing;

    // Create new config if not found
    const { data: created, error: createError } = await supabase
        .from('configs')
        .insert({ name })
        .select()
        .single();

    if (createError) throw new Error(`Failed to create config: ${createError.message}`);
    return created;
}

/**
 * Get the latest version number for a config in an environment
 */
export async function getLatestVersionNumber(
    configId: string,
    environment: Environment
): Promise<number> {
    const { data, error } = await supabase
        .from('config_versions')
        .select('version_number')
        .eq('config_id', configId)
        .eq('environment', environment)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to get latest version: ${error.message}`);
    }

    return data?.version_number ?? 0;
}

/**
 * Create a new config version (immutable insert)
 */
export async function createConfigVersion(
    configName: string,
    environment: Environment,
    request: CreateConfigRequest
): Promise<ConfigVersion> {
    const config = await getOrCreateConfig(configName);
    const latestVersion = await getLatestVersionNumber(config.id, environment);
    const newVersionNumber = latestVersion + 1;

    const { data, error } = await supabase
        .from('config_versions')
        .insert({
            config_id: config.id,
            environment,
            version_number: newVersionNumber,
            data: request.data,
            message: request.message || `Version ${newVersionNumber}`,
            created_by: request.created_by || 'system'
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create version: ${error.message}`);
    return data;
}

/**
 * List all versions for a config in an environment
 */
export async function listVersions(
    configName: string,
    environment: Environment
): Promise<ConfigVersion[]> {
    const { data: config } = await supabase
        .from('configs')
        .select('id')
        .eq('name', configName)
        .single();

    if (!config) return [];

    const { data, error } = await supabase
        .from('config_versions')
        .select('*')
        .eq('config_id', config.id)
        .eq('environment', environment)
        .order('version_number', { ascending: false });

    if (error) throw new Error(`Failed to list versions: ${error.message}`);
    return data || [];
}

/**
 * Get a specific version
 */
export async function getVersion(
    configName: string,
    environment: Environment,
    versionNumber: number
): Promise<ConfigVersion | null> {
    const { data: config } = await supabase
        .from('configs')
        .select('id')
        .eq('name', configName)
        .single();

    if (!config) return null;

    const { data, error } = await supabase
        .from('config_versions')
        .select('*')
        .eq('config_id', config.id)
        .eq('environment', environment)
        .eq('version_number', versionNumber)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get version: ${error.message}`);
    }

    return data;
}

/**
 * Compute diff between two versions
 */
export function computeDiff(
    fromData: Record<string, unknown>,
    toData: Record<string, unknown>
): DiffResult {
    const added: Record<string, unknown> = {};
    const removed: Record<string, unknown> = {};
    const changed: Record<string, { from: unknown; to: unknown }> = {};

    // Find added and changed keys
    for (const key of Object.keys(toData)) {
        if (!(key in fromData)) {
            added[key] = toData[key];
        } else if (JSON.stringify(fromData[key]) !== JSON.stringify(toData[key])) {
            changed[key] = { from: fromData[key], to: toData[key] };
        }
    }

    // Find removed keys
    for (const key of Object.keys(fromData)) {
        if (!(key in toData)) {
            removed[key] = fromData[key];
        }
    }

    return { added, removed, changed };
}

/**
 * Diff two versions of a config
 */
export async function diffVersions(
    configName: string,
    environment: Environment,
    fromVersion: number,
    toVersion: number
): Promise<DiffResult> {
    const from = await getVersion(configName, environment, fromVersion);
    const to = await getVersion(configName, environment, toVersion);

    if (!from) throw new Error(`Version ${fromVersion} not found`);
    if (!to) throw new Error(`Version ${toVersion} not found`);

    return computeDiff(
        from.data as Record<string, unknown>,
        to.data as Record<string, unknown>
    );
}

/**
 * Rollback to a previous version (creates new version with old data)
 */
export async function rollback(
    configName: string,
    environment: Environment,
    targetVersion: number,
    message?: string,
    createdBy?: string
): Promise<ConfigVersion> {
    const targetVersionData = await getVersion(configName, environment, targetVersion);

    if (!targetVersionData) {
        throw new Error(`Target version ${targetVersion} not found`);
    }

    // Create new version with the old data (rollback is a new immutable version)
    return createConfigVersion(configName, environment, {
        data: targetVersionData.data as Record<string, unknown>,
        message: message || `Rollback to version ${targetVersion}`,
        created_by: createdBy
    });
}

/**
 * Promote config from one environment to another
 */
export async function promote(request: PromoteRequest): Promise<ConfigVersion> {
    const sourceVersion = await getVersion(
        request.configName,
        request.fromEnv,
        request.version
    );

    if (!sourceVersion) {
        throw new Error(
            `Version ${request.version} not found in ${request.fromEnv} for ${request.configName}`
        );
    }

    // Create new version in target environment with source data
    return createConfigVersion(request.configName, request.toEnv, {
        data: sourceVersion.data as Record<string, unknown>,
        message: `Promoted from ${request.fromEnv} v${request.version}`,
        created_by: 'system'
    });
}

/**
 * List all configs
 */
export async function listConfigs(): Promise<Config[]> {
    const { data, error } = await supabase
        .from('configs')
        .select('*')
        .order('name');

    if (error) throw new Error(`Failed to list configs: ${error.message}`);
    return data || [];
}
