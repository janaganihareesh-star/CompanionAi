const EventEmitter = require('events');

class HardwareHubService extends EventEmitter {
  constructor() {
    super();
    this.devices = new Map();
  }

  registerDevice(deviceId, deviceInfo) {
    const device = {
      id: deviceId,
      name: deviceInfo.name || 'CloserAI Companion Device',
      type: deviceInfo.type || 'rabbit_r1_equivalent',
      batteryLevel: deviceInfo.batteryLevel || 100,
      status: 'online',
      lastSeen: new Date(),
      ip: deviceInfo.ip || '0.0.0.0',
      fwVersion: deviceInfo.fwVersion || '1.0.0'
    };
    this.devices.set(deviceId, device);
    console.log(`[Hardware Hub] Device registered: ${device.name} (${deviceId})`);
    return device;
  }

  getDevice(deviceId) {
    return this.devices.get(deviceId);
  }

  getAllDevices() {
    return Array.from(this.devices.values());
  }

  updateDeviceStatus(deviceId, statusData) {
    if (this.devices.has(deviceId)) {
      const device = this.devices.get(deviceId);
      Object.assign(device, statusData, { lastSeen: new Date() });
      this.devices.set(deviceId, device);
      return device;
    }
    return null;
  }

  removeDevice(deviceId) {
    if (this.devices.has(deviceId)) {
      this.devices.delete(deviceId);
      console.log(`[Hardware Hub] Device removed: ${deviceId}`);
      return true;
    }
    return false;
  }

  async processDeviceAudio(deviceId, audioBuffer) {
    console.log(`[Hardware Hub] Processing audio from ${deviceId}`);
    // In a real implementation, this would send audio to Whisper for STT, 
    // generate an AI response via Gemini/Claude, and return TTS audio.
    // For now, we mock the pipeline.
    
    return {
      text: "I am your CloserAI companion. I received your voice input.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      action: null
    };
  }

  sendPushAction(deviceId, actionCommand) {
    // Push an action (like 'show_image', 'play_song') to the physical device.
    if (!this.devices.has(deviceId)) return false;
    console.log(`[Hardware Hub] Sending action ${actionCommand.type} to ${deviceId}`);
    this.emit('pushAction', { deviceId, actionCommand });
    return true;
  }
}

module.exports = new HardwareHubService();
