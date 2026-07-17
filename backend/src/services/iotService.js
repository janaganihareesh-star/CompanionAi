const axios = require('axios');
const mqtt = require('mqtt'); // Assuming mqtt is installed or will be

class IoTService {
  constructor() {
    this.haUrl = process.env.HOME_ASSISTANT_URL;
    this.haToken = process.env.HOME_ASSISTANT_TOKEN;
    this.mqttUrl = process.env.MQTT_BROKER_URL;
    this.mqttClient = null;

    if (this.mqttUrl) {
      this.mqttClient = mqtt.connect(this.mqttUrl);
      this.mqttClient.on('connect', () => {
        console.log('[IoTService] Connected to MQTT Broker');
      });
    }
  }

  async controlDevice(deviceName, action, state) {
    console.log(`[IoTService] Request received for Device: ${deviceName}, Action: ${action}, State: ${state}`);
    
    // 1. Try Home Assistant
    if (this.haUrl && this.haToken) {
      try {
        const domain = deviceName.includes('light') ? 'light' : 'switch';
        const service = state.toLowerCase() === 'on' ? 'turn_on' : 'turn_off';
        
        await axios.post(`${this.haUrl}/api/services/${domain}/${service}`, 
          { entity_id: `${domain}.${deviceName.replace(/\s+/g, '_').toLowerCase()}` },
          { headers: { 'Authorization': `Bearer ${this.haToken}` } }
        );
        return `Successfully controlled ${deviceName} via Home Assistant.`;
      } catch (e) {
        console.error('[IoTService] HA Error:', e.message);
      }
    }

    // 2. Try MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `home/${deviceName.replace(/\s+/g, '_').toLowerCase()}/set`;
      this.mqttClient.publish(topic, state.toLowerCase());
      return `Successfully published state '${state}' to MQTT topic '${topic}'.`;
    }

    // 3. Fallback Webhook
    const WEBHOOK_URL = process.env.IOT_WEBHOOK_URL;
    if (WEBHOOK_URL) {
      try {
        const response = await axios.post(WEBHOOK_URL, { device: deviceName, action, state });
        return `Successfully controlled ${deviceName} via Webhook.`;
      } catch (e) {
        console.error('[IoTService] Webhook Error:', e.message);
      }
    }

    console.warn('[IoTService] No IoT credentials configured. Running in simulated mode.');
    return `[SIMULATED IoT] Successfully performed "${action}" to set "${deviceName}" to "${state}".`;
  }
}

module.exports = new IoTService();
