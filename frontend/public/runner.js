// Capacitor Background Runner
// This script runs in a separate V8 isolate on iOS/Android when the app goes into the background.

addEventListener('audioStateChange', (resolve, reject, args) => {
  try {
    // Keep the audio context alive by registering a continuous background task
    console.log('Background Runner: Audio State Changed', args);
    
    // We can emit messages back to the main Capacitor plugin to notify the WebView
    Capacitor.toWebView({
      action: 'background_audio_tick',
      timestamp: Date.now()
    });

    resolve();
  } catch (err) {
    console.error('Background Runner Error:', err);
    reject(err);
  }
});

// Periodic keep-alive for WebSockets
addEventListener('keepAlive', (resolve, reject, args) => {
  try {
    console.log('Background Runner: Keep-Alive Ping');
    // Ping main app to keep Socket.io WebSockets open during background sleep
    Capacitor.toWebView({
      action: 'ping_socket'
    });
    resolve();
  } catch (err) {
    reject(err);
  }
});
