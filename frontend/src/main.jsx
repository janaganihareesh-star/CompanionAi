import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App.jsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import axios from 'axios';

// Configure Axios globally to point to Render backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:6999';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);