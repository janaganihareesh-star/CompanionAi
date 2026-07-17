const os = require('os');

class ResourceManager {
  constructor() {
    this.maxCpuUsage = 0.85; // 85%
    this.maxRamUsage = 0.90; // 90%
  }

  /**
   * Calculates current CPU load
   */
  getCpuLoad() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    
    for (let cpu in cpus) {
      if (!cpus.hasOwnProperty(cpu)) continue;
      user += cpus[cpu].times.user;
      nice += cpus[cpu].times.nice;
      sys += cpus[cpu].times.sys;
      irq += cpus[cpu].times.irq;
      idle += cpus[cpu].times.idle;
    }

    const total = user + nice + sys + idle + irq;
    const active = total - idle;
    return active / total;
  }

  /**
   * Checks if system is under heavy load
   * @returns {boolean} True if system is stressed
   */
  isSystemStressed() {
    const ramUsage = 1 - (os.freemem() / os.totalmem());
    const cpuUsage = this.getCpuLoad();

    const isStressed = cpuUsage > this.maxCpuUsage || ramUsage > this.maxRamUsage;
    if (isStressed) {
      console.warn(`[ResourceManager] System Stressed! CPU: ${(cpuUsage*100).toFixed(1)}%, RAM: ${(ramUsage*100).toFixed(1)}%`);
    }
    return isStressed;
  }

  /**
   * Throttles execution if system is stressed
   */
  async throttleIfNeeded() {
    if (this.isSystemStressed()) {
      console.log('[ResourceManager] Throttling background tasks to save battery...');
      return new Promise(resolve => setTimeout(resolve, 5000)); // Pause for 5 seconds
    }
  }
}

module.exports = new ResourceManager();
