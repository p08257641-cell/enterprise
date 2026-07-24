import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider} from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

// Patch fetch to auto-attach auth token from localStorage
const _origFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('erp_token');
  if (token) {
    init = init || {};
    init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
  }
  return _origFetch.call(this, input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
