// Entry point that renders the main application component
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './app';

// Error boundary to catch any React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CodeClash Error:', error, errorInfo);
    // In production, you'd send this to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-6">Don't worry, even the best coders encounter bugs.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root and render app
console.log("🔍 React.version =", React.version);
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Hide loading spinner once React is ready
const loading = document.getElementById('loading');
if (loading) {
  loading.style.display = 'none';
}

// Web Vitals (optional - for performance monitoring)
// reportWebVitals(console.log);