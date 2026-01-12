import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as configService from '../services/configService';
import { Environment, ApiResponse } from '../types';

const router = Router();

// Validation schemas
const environmentSchema = z.enum(['dev', 'staging', 'prod']);

const createConfigSchema = z.object({
    data: z.record(z.unknown()),
    message: z.string().optional(),
    created_by: z.string().optional()
});

const promoteSchema = z.object({
    configName: z.string().min(1),
    fromEnv: environmentSchema,
    toEnv: environmentSchema,
    version: z.number().int().positive()
});

const rollbackSchema = z.object({
    targetVersion: z.number().int().positive(),
    message: z.string().optional(),
    created_by: z.string().optional()
});

/**
 * GET /configs
 * List all config entities
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const configs = await configService.listConfigs();
        res.json({ success: true, data: configs } as ApiResponse);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * POST /configs/:env/:configName
 * Create a new config version
 */
router.post('/:env/:configName', async (req: Request, res: Response) => {
    try {
        const env = environmentSchema.parse(req.params.env) as Environment;
        const configName = req.params.configName;
        const body = createConfigSchema.parse(req.body);

        const version = await configService.createConfigVersion(configName, env, body);
        res.status(201).json({ success: true, data: version } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * GET /configs/:env/:configName
 * List all versions for a config in an environment
 */
router.get('/:env/:configName', async (req: Request, res: Response) => {
    try {
        const env = environmentSchema.parse(req.params.env) as Environment;
        const configName = req.params.configName;

        const versions = await configService.listVersions(configName, env);
        res.json({ success: true, data: versions } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * GET /configs/:env/:configName/diff?from=X&to=Y
 * Get diff between two versions
 */
router.get('/:env/:configName/diff', async (req: Request, res: Response) => {
    try {
        const env = environmentSchema.parse(req.params.env) as Environment;
        const configName = req.params.configName;
        const from = parseInt(req.query.from as string, 10);
        const to = parseInt(req.query.to as string, 10);

        if (isNaN(from) || isNaN(to)) {
            res.status(400).json({
                success: false,
                error: 'Missing or invalid "from" and "to" query parameters'
            } as ApiResponse);
            return;
        }

        const diff = await configService.diffVersions(configName, env, from, to);
        res.json({ success: true, data: diff } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * GET /configs/:env/:configName/:version
 * Get a specific version
 */
router.get('/:env/:configName/:version', async (req: Request, res: Response) => {
    try {
        const env = environmentSchema.parse(req.params.env) as Environment;
        const configName = req.params.configName;
        const versionNumber = parseInt(req.params.version, 10);

        if (isNaN(versionNumber)) {
            res.status(400).json({
                success: false,
                error: 'Invalid version number'
            } as ApiResponse);
            return;
        }

        const version = await configService.getVersion(configName, env, versionNumber);

        if (!version) {
            res.status(404).json({
                success: false,
                error: 'Version not found'
            } as ApiResponse);
            return;
        }

        res.json({ success: true, data: version } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * POST /configs/:env/:configName/rollback
 * Rollback to a previous version (creates new version)
 */
router.post('/:env/:configName/rollback', async (req: Request, res: Response) => {
    try {
        const env = environmentSchema.parse(req.params.env) as Environment;
        const configName = req.params.configName;
        const body = rollbackSchema.parse(req.body);

        const newVersion = await configService.rollback(
            configName,
            env,
            body.targetVersion,
            body.message,
            body.created_by
        );

        res.status(201).json({ success: true, data: newVersion } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

/**
 * POST /configs/promote
 * Promote config from one environment to another
 */
router.post('/promote', async (req: Request, res: Response) => {
    try {
        const body = promoteSchema.parse(req.body);

        const newVersion = await configService.promote(body);
        res.status(201).json({ success: true, data: newVersion } as ApiResponse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: error.errors } as ApiResponse);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message } as ApiResponse);
    }
});

export default router;
