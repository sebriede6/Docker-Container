// frontend/src/components/ThemeSwitcher.jsx
import React, { useEffect, useState } from 'react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      return localTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-switcher-container">
      <label htmlFor="theme-toggle" className="theme-switcher-label">
        <input
          type="checkbox"
          id="theme-toggle"
          className="theme-switcher-checkbox"
          onChange={handleToggle}
          checked={theme === 'dark'}
        />
        <span className="theme-switcher-slider">
          {/* Icons direkt im Slider platziert */}
          <span className="icon sun-icon">☀️</span>
          <span className="icon moon-icon">🌙</span>
        </span>
        <span className="theme-switcher-text">
          {theme === 'light' ? 'Light' : 'Dark'} Mode
        </span>
      </label>
    </div>
  );
};

export default ThemeSwitcher;