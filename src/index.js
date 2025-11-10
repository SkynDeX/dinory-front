import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import mouseCursor from './assets/icons/mouse.png'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Dinory 전용 커서 설정
document.addEventListener("DOMContentLoaded", () => {
  const cursorUrl = `url(${mouseCursor}) 4 4, auto`;
  document.body.style.cursor = cursorUrl;

  // hover 시 커서 유지
  const hoverTargets = document.querySelectorAll("a, button, input, textarea");
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.style.cursor = `url(${mouseCursor}) 4 4, pointer`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.cursor = cursorUrl;
    });
  });

});

reportWebVitals();
