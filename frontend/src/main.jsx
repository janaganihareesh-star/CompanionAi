import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App.jsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import axios from 'axios';

import { GoogleOAuthProvider } from '@react-oauth/google';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Provide a robust fallback if VITE_API_URL is missing
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://closerai-qcj3.onrender.com';
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('closer-token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '832155996880-n01g8gaidc6b4a417ska2ron3c8gh4mr.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={clientId}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </Provider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
