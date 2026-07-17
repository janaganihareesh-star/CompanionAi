const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '../plugins');

/**
 * Dynamic Plugin Architecture
 * Automatically reads and loads .js plugins from the plugins directory.
 */
class PluginService {
  constructor() {
    this.plugins = new Map();
  }

  loadPlugins() {
    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(PLUGINS_DIR).filter(file => file.endsWith('.js'));
    
    files.forEach(file => {
      try {
        const pluginPath = path.join(PLUGINS_DIR, file);
        // Clear require cache to allow hot-reloading plugins
        delete require.cache[require.resolve(pluginPath)];
        const plugin = require(pluginPath);
        
        if (plugin.name && plugin.execute) {
          this.plugins.set(plugin.name, plugin);
          console.log(`[PluginService] Loaded dynamic plugin: ${plugin.name}`);
        }
      } catch (err) {
        console.error(`[PluginService Error] Failed to load plugin ${file}:`, err.message);
      }
    });
  }

  async executePlugin(name, context) {
    if (this.plugins.has(name)) {
      const plugin = this.plugins.get(name);
      return await plugin.execute(context);
    }
    throw new Error(`Plugin ${name} not found`);
  }
}

module.exports = new PluginService();
