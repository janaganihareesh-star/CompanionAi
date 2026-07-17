import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';

class MobileBackgroundService {
  constructor() {
    this.isBackgrounded = false;
  }

  init() {
    App.addListener('appStateChange', async (state) => {
      this.isBackgrounded = !state.isActive;
      
      if (this.isBackgrounded) {
        console.log('[MobileBackground] App moved to background. Hooking OS APIs...');
        
        // Use Capacitor Background Task plugin to keep OS from killing the app
        // Useful for continuous voice calls or listening mode when screen is off
        const taskId = await BackgroundTask.beforeExit(async () => {
          // Perform any vital cleanup or continuous memory saves here
          console.log('[MobileBackground] Running essential tasks before potential suspend...');
          
          // Finish the background task gracefully to avoid OS penalty
          BackgroundTask.finish({ taskId });
        });
      } else {
        console.log('[MobileBackground] App returned to foreground.');
      }
    });
  }
}

export default new MobileBackgroundService();
