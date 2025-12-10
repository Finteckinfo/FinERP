const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'Landing',
      path: '/',
      component: () => import('@/views/pages/LandingPage.vue')
    },
    {
      name: 'Error 404',
      path: '/error',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    {
      name: 'SSO - callback',
      path: '/sso-callback',
      component: () => import('@/views/authentication/SSOCallback.vue')
    }
  ]
};

export default PublicRoutes;
