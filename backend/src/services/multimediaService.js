const Replicate = require('replicate');

// We use Replicate to generate Images, Videos, Audio, and 3D Models.
// If no token is provided, it returns a mock URL so the UI doesn't break.
const getReplicate = () => {
  if (process.env.REPLICATE_API_TOKEN) {
    return new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }
  return null;
};

class MultimediaService {
  
  async generateImage(prompt) {
    console.log('[MultimediaService] Generating Image for:', prompt);
    const replicate = getReplicate();
    if (!replicate) {
      return `[SIMULATED IMAGE GENERATION] Would have generated image for: "${prompt}". Please add REPLICATE_API_TOKEN to .env`;
    }
    try {
      // Using a fast SDXL model for images
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            num_outputs: 1
          }
        }
      );
      return `<IMAGE>\n${output[0]}\n</IMAGE>`;
    } catch (e) {
      console.error('[MultimediaService] Image Gen Error:', e);
      return `<IMAGE>\n${prompt} (Failed: ${e.message})\n</IMAGE>`;
    }
  }

  async generateVideo(prompt) {
    console.log('[MultimediaService] Generating Video for:', prompt);
    const replicate = getReplicate();
    if (!replicate) {
      return `[SIMULATED VIDEO GENERATION] Would have generated video for: "${prompt}". Please add REPLICATE_API_TOKEN to .env`;
    }
    try {
      // Using Zeroscope or AnimateDiff for video
      const output = await replicate.run(
        "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281d2fa377e48a9f",
        {
          input: {
            motion_module: "mm_sd_v14",
            prompt: prompt
          }
        }
      );
      return `<VIDEO>\n${JSON.stringify({ url: output, prompt: prompt })}\n</VIDEO>`;
    } catch (e) {
      console.error('[MultimediaService] Video Gen Error:', e);
      return `<VIDEO>\n${JSON.stringify({ error: e.message, prompt: prompt })}\n</VIDEO>`;
    }
  }

  async generateAudio(prompt) {
    console.log('[MultimediaService] Generating Audio for:', prompt);
    const replicate = getReplicate();
    if (!replicate) {
      return `[SIMULATED AUDIO GENERATION] Would have generated audio for: "${prompt}". Please add REPLICATE_API_TOKEN to .env`;
    }
    try {
      // Using MusicGen for audio/music
      const output = await replicate.run(
        "meta/musicgen:b05b1dff1d8c6dc63d14b0cdb421ce531d3bcd1c0172e9a31a542b58d3c5cff4",
        {
          input: {
            prompt: prompt,
            model_version: "stereo-melody",
            duration: 8
          }
        }
      );
      return `<AUDIO>\n${JSON.stringify({ url: output, prompt: prompt })}\n</AUDIO>`;
    } catch (e) {
      console.error('[MultimediaService] Audio Gen Error:', e);
      return `<AUDIO>\n${JSON.stringify({ error: e.message, prompt: prompt })}\n</AUDIO>`;
    }
  }

  async generate3DModel(prompt) {
    console.log('[MultimediaService] Generating 3D Model for:', prompt);
    const replicate = getReplicate();
    if (!replicate) {
      return `[SIMULATED 3D GENERATION] Would have generated 3D Model for: "${prompt}". Please add REPLICATE_API_TOKEN to .env`;
    }
    try {
      // Using Luma AI or similar for 3D Gen (Shap-E is a fast open source one)
      const output = await replicate.run(
        "cjwbw/shap-e:5957069d5c509126a73c7cb68abcddbb985aeefa4d318e7c63ec1352ce6da68c",
        {
          input: {
            prompt: prompt,
            save_mesh: true
          }
        }
      );
      const modelUrl = Array.isArray(output) ? (output[1] || output[0]) : output;
      return `<3D>\n${JSON.stringify({ url: modelUrl, prompt: prompt })}\n</3D>`;
    } catch (e) {
      console.error('[MultimediaService] 3D Gen Error:', e);
      return `<3D>\n${JSON.stringify({ error: e.message, prompt: prompt })}\n</3D>`;
    }
  }
}

module.exports = new MultimediaService();
