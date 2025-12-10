import { ref } from 'vue';

// Theme storage key
const THEME_STORAGE_KEY = 'siz-erp-theme';

// System preference detection
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Get stored theme preference
const getStoredTheme = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === null) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading stored theme:', error);
    return null;
  }
};

// Store theme preference
const storeTheme = (isDarkMode: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
  } catch (error) {
    console.error('Error storing theme:', error);
  }
};

// Apply theme to DOM - optimized function
const applyTheme = (darkMode: boolean) => {
  if (typeof window === 'undefined') return;
  
  // Use requestAnimationFrame for smoother transitions
  requestAnimationFrame(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  });
};

// Initialize theme - check storage/system preference
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const storedTheme = getStoredTheme();
  if (storedTheme !== null) {
    return storedTheme;
  }
  
  return getSystemPreference();
};

// Global theme state
const isDark = ref<boolean>(getInitialTheme());

// Apply theme to DOM immediately on initialization
if (typeof window !== 'undefined') {
  const applyInitialTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  };
  
  // Apply immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInitialTheme);
  } else {
    applyInitialTheme();
  }
}

// Toggle theme - optimized for performance
const toggle = () => {
  isDark.value = !isDark.value;
  storeTheme(isDark.value);
  applyTheme(isDark.value);
};

// Set specific theme
const setTheme = (darkMode: boolean) => {
  isDark.value = darkMode;
  storeTheme(darkMode);
  applyTheme(darkMode);
};

// Reset to system preference
const resetToSystem = () => {
  const systemPrefersDark = getSystemPreference();
  setTheme(systemPrefersDark);
  localStorage.removeItem(THEME_STORAGE_KEY);
};

export const useTheme = () => {
  return {
    isDark,
    toggle,
    setTheme,
    resetToSystem
  };
};
