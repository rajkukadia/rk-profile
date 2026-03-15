import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "./index.css";
import "./pages/landing/landing.css";

import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
