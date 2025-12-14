const MainRoutes = {
  path: '/dashboard',
  meta: { requiresAuth: true },
  redirect: '/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    { name: 'Default', path: '/dashboard/default', component: () => import('@/views/dashboards/default/DefaultDashboard.vue') },
    { name: 'CreateProject', path: '/projects/create', component: () => import('@/views/projects/CreateProjectProtected.vue') },
    { name: 'ProjectView', path: '/projects', component: () => import('@/views/projects/ProjectView.vue') },
    { name: 'ProjectDetails', path: '/projects/:id', component: () => import('@/views/projects/ProjectDetails.vue') },
    { name: 'ProjectWorkspace', path: '/projects/:id/workspace', component: () => import('@/views/projects/ProjectWorkspace.vue') },
    { name: 'FundEscrow', path: '/projects/:id/fund-escrow', component: () => import('@/views/projects/FundEscrow.vue') },
    { name: 'Starter', path: '/starter', component: () => import('@/views/StarterPage.vue') },
    { name: 'Tabler Icons', path: '/icons/tabler', component: () => import('@/views/utilities/icons/TablerIcons.vue') },
    { name: 'Material Icons', path: '/icons/material', component: () => import('@/views/utilities/icons/MaterialIcons.vue') },
    { name: 'Typography', path: '/utils/typography', component: () => import('@/views/utilities/typography/TypographyPage.vue') },
    { name: 'Shadows', path: '/utils/shadows', component: () => import('@/views/utilities/shadows/ShadowPage.vue') },
    { name: 'Colors', path: '/utils/colors', component: () => import('@/views/utilities/colors/ColorPage.vue') },
    { name: 'TaskCalendar', path: '/tasks/calendar', component: () => import('@/views/pages/tasks/taskCalender.vue') },
    // Trello-style boards (keep /kanban for backward compatibility)
    { name: 'Boards', path: '/boards', component: () => import('@/views/pages/kanban/KanbanBoard.vue') },
    { name: 'KanbanBoard', path: '/kanban', component: () => import('@/views/pages/kanban/KanbanBoard.vue') },
    { name: 'Analytics', path: '/analytics', component: () => import('@/views/pages/analytics/index.vue') },
    { name: 'Payments', path: '/payments', component: () => import('@/views/pages/payments/index.vue') },
    { name: 'Settings', path: '/settings', component: () => import('@/views/pages/settings/index.vue') },
    { name: 'Messages', path: '/messages', component: () => import('@/views/pages/communications/messages/index.vue') },
    { name: 'TeamChat', path: '/team-chat', component: () => import('@/views/pages/communications/teamChat/index.vue') },
    { name: 'Invitations', path: '/invitations', component: () => import('@/views/pages/invitations/index.vue') }
  ]
};

export default MainRoutes;
