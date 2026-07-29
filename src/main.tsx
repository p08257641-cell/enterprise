import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider} from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

// Patch fetch to auto-attach auth token from localStorage
// and auto-clear stale/expired tokens on 401 responses
const _origFetch = window.fetch;
let _authErrorPending = false;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('erp_token');
  if (token) {
    init = init || {};
    init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
  }
  return _origFetch.call(this, input, init).then((response) => {
    // If the server returns 401 on an API call while we have a stored token,
    // the token is stale or expired — clear it and force re-login.
    if (
      response.status === 401 &&
      typeof input === 'string' &&
      input.startsWith('/api/') &&
      !input.startsWith('/api/auth/') &&
      localStorage.getItem('erp_token') &&
      !_authErrorPending
    ) {
      _authErrorPending = true;
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      // Small delay so in-flight requests can settle before reload
      setTimeout(() => window.location.reload(), 100);
    }
    return response;
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
