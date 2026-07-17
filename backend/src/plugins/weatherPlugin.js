/**
 * Example Dynamic Plugin: Weather
 */
module.exports = {
  name: 'WeatherPlugin',
  description: 'Fetches weather for a location',
  execute: async (context) => {
    // In a real plugin, this would hit an API
    return `The weather in ${context.location || 'your area'} is sunny and 75°F.`;
  }
};
