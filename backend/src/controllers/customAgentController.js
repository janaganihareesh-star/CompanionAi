const CustomAgent = require('../models/CustomAgent');

exports.getCustomAgents = async (req, res) => {
  try {
    const agents = await CustomAgent.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching custom agents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCustomAgent = async (req, res) => {
  try {
    const { name, description, systemPromptOverride, icon, traits } = req.body;
    
    if (!name || !systemPromptOverride) {
      return res.status(400).json({ success: false, message: 'Name and system prompt are required' });
    }

    const newAgent = new CustomAgent({
      userId: req.user.id,
      id: `custom_agent_${Date.now()}`,
      name,
      description,
      systemPromptOverride,
      icon: icon || '🤖',
      traits: traits || []
    });

    await newAgent.save();
    res.status(201).json({ success: true, agent: newAgent });
  } catch (error) {
    console.error('Error creating custom agent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCustomAgent = async (req, res) => {
  try {
    const agent = await CustomAgent.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom agent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
