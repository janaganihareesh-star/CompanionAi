const EventEmitter = require('events');

class VideoGenerationService extends EventEmitter {
  constructor() {
    super();
    this.activeJobs = new Map();
  }

  async generateVideo(prompt, options = {}) {
    const jobId = 'vid_' + Date.now() + Math.random().toString(36).substring(7);
    
    // Default Sora-level parameters
    const params = {
      prompt,
      aspectRatio: options.aspectRatio || '16:9',
      cameraMotion: options.cameraMotion || 'cinematic_pan',
      lighting: options.lighting || 'dramatic',
      resolution: options.resolution || '1080p',
      jobId
    };

    this.activeJobs.set(jobId, { status: 'queued', progress: 0, params });
    console.log(`[Video Gen] Job ${jobId} queued with params:`, params);

    // Simulate Sora Heavy API processing in background
    this.processJob(jobId);

    return { jobId, status: 'queued' };
  }

  getJobStatus(jobId) {
    return this.activeJobs.get(jobId);
  }

  async processJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    const stages = [
      { status: 'initializing', delay: 1000 },
      { status: 'generating_frames', delay: 3000 },
      { status: 'upscaling', delay: 2000 },
      { status: 'finalizing', delay: 1000 }
    ];

    let progress = 0;
    
    for (const stage of stages) {
      job.status = stage.status;
      // Simulate progress over the delay
      const steps = 5;
      const stepDelay = stage.delay / steps;
      
      for (let i = 0; i < steps; i++) {
        await new Promise(r => setTimeout(r, stepDelay));
        progress += (100 / stages.length) / steps;
        job.progress = Math.min(Math.round(progress), 99);
        this.emit('progress', { jobId, status: job.status, progress: job.progress });
      }
    }

    // High quality fallback video as the mock "Sora" output
    const fallbackVideoUrl = 'https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4'; // Placeholder cinematic video
    
    job.status = 'completed';
    job.progress = 100;
    job.videoUrl = fallbackVideoUrl;
    
    this.emit('completed', { jobId, videoUrl: fallbackVideoUrl });
    console.log(`[Video Gen] Job ${jobId} completed`);
  }
}

module.exports = new VideoGenerationService();
