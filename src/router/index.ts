import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';

// Dev bypass (for headless testing / no MetaMask)
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

// Synchronous wallet connection check (no composable reactivity needed)
function hasWalletConnection(): boolean {
  if (DEV_BYPASS_AUTH) return true;

  // Check localStorage for MetaMask connection state
  try {
    const mmState = localStorage.getItem('metamask-state');
    if (mmState) {
      const state = JSON.parse(mmState);
      return !!(state?.isConnected && state?.selectedAddress);
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Check for Ethereum provider (synchronous check)
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const ethereum = (window as any).ethereum;
      // Quick synchronous check for connection
      return !!(ethereum.selectedAddress || ethereum.isConnected);
    } catch (e) {
      // Ignore errors
    }
  }

  return false;
}

// Handle GitHub Pages SPA routing
// https://github.com/rafgraph/spa-github-pages
const router = createRouter({
  history: createWebHistory('/FinERP/'), // Explicitly set base path for GitHub Pages
  routes: [
    { path: '/:pathMatch(.*)*', component: () => import('@/views/pages/maintenance/error/Error404Page.vue') },
    { path: '/auth-loading', component: () => import('@/views/pages/maintenance/AuthLoadingPage.vue') },
    MainRoutes,
    PublicRoutes
  ]
});

// Handle GitHub Pages SPA routing redirect
if (typeof window !== 'undefined') {
  // Check if we're on GitHub Pages and have a redirect query parameter
  const l = window.location;
  const pathSegmentsToKeep = 1; // For /FinERP/ repository

  if (l.search.startsWith('?/')) {
    const path = l.search.slice(2).replace(/~and~/g, '&');
    window.history.replaceState(null, '', '/FinERP/' + path + l.hash);
  }

  // Mobile performance: Reduce navigation delays
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Disable smooth scrolling on mobile for better performance
    document.documentElement.style.scrollBehavior = 'auto';
  }
}

export { router };

router.beforeEach(async (to, from, next) => {
  // Skip loading page to avoid infinite loop
  if (to.path === '/auth-loading') {
    next();
    return;
  }

  const publicPages = ['/login', '/register', '/error'];
  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // Check for wallet connection
  const hasWallet = hasWalletConnection();

  if (authRequired) {
    if (hasWallet) {
      // Wallet connected, proceed
      console.log('[Router] Wallet connected, allowing access');
      next();
    } else {
      // No wallet connection, redirect to landing page
      console.log('[Router] No wallet connection, redirecting to landing page');
      next('/');
    }
  } else if (hasWallet && (to.path === '/')) {
    // User has wallet connected and is on landing page, redirect to dashboard
    next('/dashboard');
  } else {
    next();
  }
});
