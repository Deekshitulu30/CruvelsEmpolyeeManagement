import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Developer Console Easter Egg
if (typeof window !== 'undefined') {
  console.log(
    "%c Cruvels Workplace %c Handcrafted by real human engineers with ☕ \n%cHey there, inquisitive dev! 👋 Inspecting our client bundle? Check out our architecture & test runs in /docs, or say hi at dev@cruvels.com",
    "background: #4f46e5; color: white; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    "background: #1e293b; color: #cbd5e1; font-size: 11px; padding: 4px 8px; border-radius: 4px;",
    "color: #94a3b8; font-size: 11px; padding-top: 4px; display: block;"
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
