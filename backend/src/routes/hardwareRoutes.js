const express = require('express');
const router = express.Router();
const hardwareHubService = require('../services/hardwareHubService');
const authMiddleware = require('../middleware/auth'); // Assume auth is needed

// Get all registered devices
router.get('/devices', authMiddleware, (req, res) => {
  try {
    const devices = hardwareHubService.getAllDevices();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pair a new device
router.post('/devices/pair', authMiddleware, (req, res) => {
  try {
    const { deviceId, name, type } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Device ID required' });
    
    const newDevice = hardwareHubService.registerDevice(deviceId, {
      name: name || 'Rabbit R1 Clone',
      type: type || 'smart_companion',
      ip: req.ip
    });
    
    res.json({ message: 'Device paired successfully', device: newDevice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a device
router.delete('/devices/:id', authMiddleware, (req, res) => {
  try {
    const success = hardwareHubService.removeDevice(req.params.id);
    if (!success) return res.status(404).json({ error: 'Device not found' });
    res.json({ message: 'Device removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ping device status
router.post('/devices/:id/ping', authMiddleware, (req, res) => {
  try {
    const { batteryLevel } = req.body;
    const device = hardwareHubService.updateDeviceStatus(req.params.id, {
      status: 'online',
      batteryLevel: batteryLevel || 100
    });
    
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process audio from device (Mocked for testing)
router.post('/devices/:id/audio', authMiddleware, async (req, res) => {
  try {
    // req.body.audioData would contain base64 or buffer in reality
    const response = await hardwareHubService.processDeviceAudio(req.params.id, null);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
