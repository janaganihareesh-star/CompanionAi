const axios = require('axios');

/**
 * Plugin Store Service
 * Manages dynamic third-party plugins that extend Closer-AI capabilities with REAL API integrations.
 */
class PluginStoreService {
    constructor() {
        this.installedPlugins = new Map();
        this.availablePlugins = [
            { id: 'weather', name: 'Global Weather API', description: 'Real-time weather data via Open-Meteo', version: '1.0.0' },
            { id: 'github', name: 'GitHub API', description: 'Fetch public repo details and user info', version: '1.2.0' },
            { id: 'expedia', name: 'Expedia Flights', description: 'Book flights and hotels autonomously (Mock)', version: '1.0.0' },
            { id: 'zapier', name: 'Zapier Automation', description: 'Connect Closer to 5000+ apps (Mock)', version: '2.0.0' }
        ];
    }

    getAvailablePlugins() { return this.availablePlugins; }
    getInstalledPlugins() { return Array.from(this.installedPlugins.values()); }

    installPlugin(pluginId) {
        const plugin = this.availablePlugins.find(p => p.id === pluginId);
        if (!plugin) throw new Error('Plugin not found');
        if (this.installedPlugins.has(pluginId)) return { success: false, message: 'Plugin already installed' };

        this.installedPlugins.set(pluginId, plugin);
        return { success: true, message: `Successfully installed ${plugin.name}` };
    }

    uninstallPlugin(pluginId) {
        if (!this.installedPlugins.has(pluginId)) return { success: false, message: 'Plugin is not installed' };
        this.installedPlugins.delete(pluginId);
        return { success: true, message: 'Plugin uninstalled successfully' };
    }

    // Real API Execution
    async executePluginAction(pluginId, action, params) {
        if (!this.installedPlugins.has(pluginId)) {
            throw new Error(`Cannot execute action. Plugin ${pluginId} is not installed.`);
        }
        
        console.log(`[PluginStore] Executing REAL action ${action} on ${pluginId} with params:`, params);
        
        try {
            if (pluginId === 'weather') {
                // Real call to Open-Meteo (No API key needed)
                // Defaulting coordinates to New York if missing
                const lat = params?.lat || 40.7128;
                const lon = params?.lon || -74.0060;
                const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                return { success: true, data: res.data.current_weather };
            }
            
            if (pluginId === 'github') {
                // Real call to GitHub Public API
                const username = params?.username || 'octocat';
                const res = await axios.get(`https://api.github.com/users/${username}`);
                return { success: true, data: res.data };
            }

            // Fallback for mock plugins
            await new Promise(r => setTimeout(r, 1000));
            return {
                success: true,
                message: `Mock execution of ${pluginId}.${action} completed.`,
                data: { result: 'success', mock_params_used: params }
            };
        } catch (error) {
            console.error('[PluginStore Error]:', error.message);
            return { success: false, message: `Plugin execution failed: ${error.message}` };
        }
    }
}

module.exports = new PluginStoreService();
