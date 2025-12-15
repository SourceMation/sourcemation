/**
 * Theme Switcher - Dark/Light Mode
 * Uses localStorage for persistence (no cookies)
 * Applies theme immediately to prevent FOUC
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'sm-portal-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    /**
     * Get the current theme from localStorage or system preference
     * @returns {string} 'light' or 'dark'
     */
    function getStoredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === THEME_DARK || stored === THEME_LIGHT) {
                return stored;
            }
        } catch (e) {
            // localStorage might be unavailable
            console.warn('localStorage not available for theme storage');
        }

        // Check system preference as fallback
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }

        return THEME_LIGHT;
    }

    /**
     * Save theme to localStorage
     * @param {string} theme - 'light' or 'dark'
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme to localStorage');
        }
    }

    /**
     * Apply theme to the document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        if (theme === THEME_DARK) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    /**
     * Toggle between light and dark theme
     * @returns {string} The new theme
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? THEME_LIGHT : THEME_DARK;

        applyTheme(newTheme);
        saveTheme(newTheme);

        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));

        return newTheme;
    }

    /**
     * Initialize theme switcher buttons
     */
    function initThemeSwitchers() {
        const switchers = document.querySelectorAll('.theme-switcher');

        switchers.forEach(function(switcher) {
            // Remove hidden class
            switcher.classList.remove('hidden');

            // Add click handler
            switcher.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });

            // Add keyboard accessibility
            switcher.setAttribute('role', 'button');
            switcher.setAttribute('aria-label', 'Toggle dark mode');
            switcher.setAttribute('tabindex', '0');

            switcher.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        });
    }

    /**
     * Listen for system theme changes
     */
    function watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Only update if user hasn't explicitly set a preference
            mediaQuery.addEventListener('change', function(e) {
                const storedTheme = localStorage.getItem(STORAGE_KEY);
                // If no stored preference, follow system
                if (!storedTheme) {
                    applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                }
            });
        }
    }

    // Apply theme immediately (before DOM ready) to prevent FOUC
    applyTheme(getStoredTheme());

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initThemeSwitchers();
            watchSystemTheme();
        });
    } else {
        // DOM already loaded
        initThemeSwitchers();
        watchSystemTheme();
    }

    // Expose API for manual control
    window.ThemeSwitcher = {
        toggle: toggleTheme,
        setTheme: function(theme) {
            applyTheme(theme);
            saveTheme(theme);
        },
        getTheme: function() {
            return document.documentElement.getAttribute('data-theme') === 'dark' ? THEME_DARK : THEME_LIGHT;
        }
    };

})();
