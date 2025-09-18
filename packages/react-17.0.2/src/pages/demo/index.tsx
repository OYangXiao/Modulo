import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/pages/demo/App';

const rootEl = document.getElementById(import.meta.env.MOUNT_ID);
if (rootEl) {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootEl
  );
}
