import { Request, Response, NextFunction } from 'express';

/**
 * API Key Authentication Middleware
 * 
 * Validates X-API-Key header against CONFIG_API_KEY environment variable.
 * Returns 401 Unauthorized if key is missing or invalid.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;
    const expectedKey = process.env.CONFIG_API_KEY;

    // Skip auth if no API key is configured (development mode)
    if (!expectedKey) {
        console.warn('⚠️ No CONFIG_API_KEY set - API authentication disabled');
        next();
        return;
    }

    // Check if API key is provided and valid
    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: 'Missing API key. Include X-API-Key header.'
        });
        return;
    }

    if (apiKey !== expectedKey) {
        res.status(401).json({
            success: false,
            error: 'Invalid API key'
        });
        return;
    }

    // Valid API key
    next();
}
