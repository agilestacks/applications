import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';

import './App.scss';

import { Teaser, StylesExtractor, ThemeSwitch } from './components';
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

  return (
    <div className={className}>
        <header className="App-header">
            <StylesExtractor />
            <ThemeSwitch setTheme={setTheme} />
            <Teaser />
        </header>
    </div>
  );
}

export default App;
