import React from 'react';

import { useCallback } from 'react';

export function ThemeSwitch({setTheme}) {
    const onThemeChange = useCallback(
        ({currentTarget}) => setTheme(currentTarget.getAttribute('data-theme')),
        [setTheme]
    );

    return (
        <div className="asi-theme-switch">
            <div
                className="asi-theme-toggle asi-theme-toggle-dark"
                onClick={onThemeChange}
                title="Switch to light theme"
                data-theme="light"
            >
                <span role="img" aria-label="moon" className="asi-theme-toggle-icon">🌙</span>
            </div>
            <div
                className="asi-theme-toggle asi-theme-toggle-light"
                onClick={onThemeChange}
                title="Switch to dark theme"
                data-theme="dark"
            >
                <span role="img" aria-label="sun" className="asi-theme-toggle-icon">☀️</span>
            </div>
            <div className="asi-theme-switch-button" />
        </div>
    );
}
