import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Set API URL from environment variable
if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set. Using default: http://localhost:5000/api');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);