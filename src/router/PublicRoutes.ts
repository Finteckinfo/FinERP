const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'Login',
      path: '/',
      component: () => import('@/views/authentication/LoginPage.vue')
    },
    {
      name: 'LoginRedirect',
      path: '/login',
      redirect: '/'
    },
    {
      name: 'Register',
      path: '/register',
      redirect: '/login'
    },
    {
      name: 'Error 404',
      path: '/error',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    }
  ]
};

export default PublicRoutes;
