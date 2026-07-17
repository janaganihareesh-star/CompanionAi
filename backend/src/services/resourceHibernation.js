const { exec } = require('child_process');

class ResourceHibernationService {
  constructor() {
    this.idleThreshold = 5 * 60 * 1000; // 5 minutes
    this.serviceTimers = new Map();
    this.activeServices = new Set(['rag-service', 'vision-service']);
    this.isHibernating = new Map();
  }

  // Called whenever a microservice receives a request
  pingService(serviceName) {
    if (this.isHibernating.get(serviceName)) {
      this.wakeUpService(serviceName);
    }
    
    if (this.serviceTimers.has(serviceName)) {
      clearTimeout(this.serviceTimers.get(serviceName));
    }
    
    const timer = setTimeout(() => {
      this.hibernateService(serviceName);
    }, this.idleThreshold);
    
    this.serviceTimers.set(serviceName, timer);
  }

  hibernateService(serviceName) {
    console.log(`[Hibernation] Service ${serviceName} has been idle for 5 minutes. Hibernating...`);
    this.isHibernating.set(serviceName, true);
    
    // Using PM2 to suspend the process to save CPU/Memory
    exec(`npx pm2 stop ${serviceName}`, (err) => {
      if (err) console.error(`Failed to hibernate ${serviceName}:`, err.message);
      else console.log(`[Hibernation] ${serviceName} is now sleeping.`);
    });
  }

  wakeUpService(serviceName) {
    console.log(`[Hibernation] Waking up ${serviceName}...`);
    this.isHibernating.set(serviceName, false);
    
    exec(`npx pm2 start ${serviceName}`, (err) => {
      if (err) console.error(`Failed to wake up ${serviceName}:`, err.message);
      else console.log(`[Hibernation] ${serviceName} is awake and ready.`);
    });
  }
}

module.exports = new ResourceHibernationService();
