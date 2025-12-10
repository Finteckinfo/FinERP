import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';

// MetaMask Wallet Authentication
const { isConnected, user } = useMetaMaskWallet();

// Check for wallet connection
function hasWalletConnection(): boolean {
  return isConnected.value && !!user.value?.address;
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', component: () => import('@/views/pages/maintenance/error/Error404Page.vue') },
    { path: '/sso-callback', component: () => import('@/views/authentication/SSOCallback.vue') },
    { path: '/auth-loading', component: () => import('@/views/pages/maintenance/AuthLoadingPage.vue') },
    MainRoutes,
    PublicRoutes
  ]
});

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
