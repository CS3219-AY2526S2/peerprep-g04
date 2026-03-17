import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 屏蔽 ResizeObserver 引起的无害全屏报错
window.addEventListener('error', e => {
  if (
    e.message === 'ResizeObserver loop limit exceeded' ||
    e.message === 'ResizeObserver loop completed with undelivered notifications.'
  ) {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    );
    const resizeObserverErr = document.getElementById(
      'webpack-dev-server-client-overlay'
    );
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
  }
});
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
