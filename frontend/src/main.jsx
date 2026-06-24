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

// Configure Axios globally to point to Render backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:6999';

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