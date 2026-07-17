const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Plugin = require('../models/Plugin');

router.use(auth);

// Get all installed plugins for the user
router.get('/', async (req, res) => {
  try {
    const plugins = await Plugin.find({ userId: req.user.id });
    res.status(200).json({ success: true, plugins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle a plugin
router.post('/toggle', async (req, res) => {
  try {
    const { pluginName, isEnabled } = req.body;
    let plugin = await Plugin.findOne({ userId: req.user.id, pluginName });
    
    if (plugin) {
      plugin.isEnabled = isEnabled;
      await plugin.save();
    } else {
      plugin = await Plugin.create({
        userId: req.user.id,
        pluginName,
        isEnabled
      });
    }

    res.status(200).json({ success: true, plugin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
