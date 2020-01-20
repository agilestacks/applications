import React, { useState, useMemo, useCallback, useEffect } from 'react';
import classNames from 'classnames';

import './App.scss';

import sun from './images/sun.svg';
import moon from './images/moon.svg';

import { Teaser } from './components';
import { localStorageSet, localStorageGet } from './localStorage';

function App() {
  const [theme, setTheme] = useState(localStorageGet('theme') || 'default');
  const className = useMemo(
    () => classNames(
      'App',
      `asi-theme-${theme}`
    ),
    [theme]
  );

  useEffect(() => {
    if (theme) {
      localStorageSet('theme', theme);
    }
  }, [theme]);

  const setDarkTheme = useCallback(() => setTheme('dark'), [setTheme]);
  const setLightTheme = useCallback(() => setTheme('light'), [setTheme]);

  return (
    <div className={className}>
        <header className="App-header">
            <div className="asi-theme-switch">
            <div
                className="asi-theme-toggle asi-theme-toggle-dark"
                onClick={setLightTheme}
                data-theme="light"
              >
                  <img
                      className="asi-theme-toggle-image" src={moon}
                      alt="moon"
                />
              </div>
              <div
                className="asi-theme-toggle asi-theme-toggle-light"
                onClick={setDarkTheme}
                title="Switch to dark theme"
                data-theme="dark"
              >
                  <img
                      className="asi-theme-toggle-image" src={sun}
                      alt="sun"
                  />
              </div>
            </div>
            <Teaser />
        </header>
    </div>
  );
}

export default App;
