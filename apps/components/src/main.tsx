import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@indxsearch/systm/styles.css';
import '@indxsearch/systm/cursors.css';
import '@indxsearch/systm/patterns.css';
// import '@indxsearch/fonts/fonts.css';
import './globals.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
