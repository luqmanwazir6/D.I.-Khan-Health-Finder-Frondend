import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global styles must load first: they declare the cascade layer order.
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
