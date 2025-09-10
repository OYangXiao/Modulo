import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export function init(root: string | Element) {

  const rootEl = typeof root === 'string' ? document.querySelector(root) : root;
  if (rootEl instanceof HTMLElement) {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      rootEl
    );
  } else {
    console.error('没找到挂载点')
  }
}
