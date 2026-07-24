import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught React Error:", error, errorInfo);
  }

  handleRestart = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
        window.location.reload(true);
      }).catch(() => {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen mesh-bg text-text flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-6 border border-rose-500/30">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">System Recovery</h1>
            <p className="text-muted mb-6 text-sm leading-relaxed">
              CloserAI encountered an unexpected memory anomaly. The cognitive core has safely paused to prevent data corruption.
            </p>
            <button 
              onClick={this.handleRestart}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl font-medium transition-all w-full justify-center"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot Core Systems
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
