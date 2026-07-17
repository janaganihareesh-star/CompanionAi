import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const GoogleDrivePicker = ({ onFilePicked, children }) => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const appId = import.meta.env.VITE_GOOGLE_APP_ID;

  // Define scopes for Drive access
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const loadGoogleApis = async () => {
      await loadScript('https://apis.google.com/js/api.js');
      await loadScript('https://accounts.google.com/gsi/client');
      
      if (window.gapi) {
        window.gapi.load('auth2', () => setIsApiLoaded(true));
        window.gapi.load('picker', () => setPickerApiLoaded(true));
      }
    };
    
    loadGoogleApis();
  }, []);

  const handleAuth = () => {
    if (!clientId || !apiKey) {
      toast.error('Google Cloud Client ID and API Key are missing in .env!', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    if (window.gapi && window.gapi.auth2) {
      window.gapi.auth2.authorize(
        {
          client_id: clientId,
          scope: SCOPES,
          immediate: false
        },
        handleAuthResult
      );
    } else {
      toast.error('Google API failed to load.');
    }
  };

  const handleAuthResult = (authResult) => {
    if (authResult && !authResult.error) {
      createPicker(authResult.access_token);
    } else {
      console.error('Google Auth Error:', authResult.error);
      toast.error('Failed to authenticate with Google Drive.');
    }
  };

  const createPicker = (oauthToken) => {
    if (pickerApiLoaded && window.google && window.google.picker) {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      view.setIncludeFolders(true);
      
      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(appId)
        .setOAuthToken(oauthToken)
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setDeveloperKey(apiKey)
        .setCallback(pickerCallback)
        .build();
        
      picker.setVisible(true);
      
      // Fix Picker z-index issues in modern frameworks
      setTimeout(() => {
        const pickerElements = document.getElementsByClassName('picker-dialog-bg');
        if (pickerElements.length > 0) {
          pickerElements[0].style.zIndex = '99998';
        }
        const pickerDialogs = document.getElementsByClassName('picker-dialog');
        if (pickerDialogs.length > 0) {
          pickerDialogs[0].style.zIndex = '99999';
        }
      }, 100);
    }
  };

  const pickerCallback = async (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const docs = data.docs;
      
      // Simulate reading the file content since we are a frontend-only proxy for now
      // A real implementation would fetch the file via the Google Drive REST API using the access token
      toast.success(`Selected ${docs.length} file(s) from Google Drive!`);
      
      const attachments = docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        url: doc.url,
        source: 'google_drive',
        size: doc.sizeBytes || 0,
        // Mock content for demonstration of Ecosystem capability until OAuth verified
        content: `[Content of Google Drive Document: ${doc.name}]\n[Link: ${doc.url}]`
      }));
      
      onFilePicked(attachments);
    }
  };

  return (
    <div onClick={handleAuth} className="cursor-pointer inline-flex items-center">
      {children}
    </div>
  );
};

export default GoogleDrivePicker;
