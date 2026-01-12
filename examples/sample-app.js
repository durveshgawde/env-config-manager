/**
 * EXAMPLE: How Another App Uses the Config Manager
 * 
 * This is a sample Express app that fetches its configuration
 * from the Config Manager API instead of using .env files.
 * 
 * To test this:
 * 1. Make sure Config Manager backend is running (localhost:3000)
 * 2. Create a config called "sample-app" in DEV environment via the UI
 * 3. Run: node examples/sample-app.js
 */

const express = require('express');

// ============================================
// CONFIG MANAGER INTEGRATION
// ============================================

const CONFIG_MANAGER_URL = 'http://localhost:3000';
const CONFIG_NAME = 'sample-app';
const ENVIRONMENT = process.env.NODE_ENV || 'dev'; // 'dev', 'staging', or 'prod'

let appConfig = null; // Will be populated from Config Manager

/**
 * Fetch configuration from the Config Manager API
 */
async function loadConfigFromManager() {
    try {
        console.log(`📡 Fetching config from: ${CONFIG_MANAGER_URL}/configs/${ENVIRONMENT}/${CONFIG_NAME}`);

        const response = await fetch(
            `${CONFIG_MANAGER_URL}/configs/${ENVIRONMENT}/${CONFIG_NAME}`
        );

        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            throw new Error('No config found! Create one in the Config Manager UI first.');
        }

        // Get the latest version (first in the array)
        const latestVersion = result.data[0];

        console.log(`✅ Loaded config v${latestVersion.version_number} from ${ENVIRONMENT}`);
        console.log(`   Message: "${latestVersion.message}"`);
        console.log(`   Data:`, latestVersion.data);

        return latestVersion.data;
    } catch (error) {
        console.error('❌ Failed to load config:', error.message);
        console.log('\n💡 Make sure to:');
        console.log('   1. Config Manager backend is running (npm run dev in backend folder)');
        console.log('   2. Create a config named "sample-app" in DEV environment');
        process.exit(1);
    }
}

// ============================================
// SAMPLE EXPRESS APP
// ============================================

async function startApp() {
    // Step 1: Load config from Config Manager
    appConfig = await loadConfigFromManager();

    // Step 2: Use the config values in your app
    const app = express();
    const PORT = appConfig.PORT || 4000;

    app.get('/', (req, res) => {
        res.json({
            message: 'Hello from Sample App!',
            environment: ENVIRONMENT,
            config: {
                // These values come from Config Manager, not .env!
                apiUrl: appConfig.API_URL,
                debugMode: appConfig.DEBUG_MODE,
                maxRetries: appConfig.MAX_RETRIES,
                featureFlags: appConfig.FEATURE_FLAGS
            }
        });
    });

    app.get('/config', (req, res) => {
        res.json({
            source: 'Config Manager API',
            environment: ENVIRONMENT,
            configName: CONFIG_NAME,
            values: appConfig
        });
    });

    app.listen(PORT, () => {
        console.log(`\n🚀 Sample App running on http://localhost:${PORT}`);
        console.log(`   Using config from Config Manager (${ENVIRONMENT} environment)`);
        console.log(`\n   Try: curl http://localhost:${PORT}/config`);
    });
}

startApp();
