import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/app.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не найден корневой элемент React.');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
