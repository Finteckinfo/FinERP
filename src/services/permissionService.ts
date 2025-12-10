import type { UserRole, Department, Task, Project } from './projectApi';

export const permissionService = {
  // Check if user can edit project
  canEditProject: (userRole: UserRole, project: Project): boolean => {
    return userRole.role === 'PROJECT_OWNER' || 
           (userRole.role === 'PROJECT_MANAGER' && userRole.managedDepartments.length > 0);
  },
  
  // Check if user can edit department
  canEditDepartment: (userRole: UserRole, department: Department): boolean => {
    return userRole.role === 'PROJECT_OWNER' || 
           userRole.managedDepartments.some(d => d.id === department.id);
  },
  
  // Check if user can edit task
  canEditTask: (userRole: UserRole, task: Task): boolean => {
    return userRole.role === 'PROJECT_OWNER' || 
           userRole.role === 'PROJECT_MANAGER' ||
           task.assignedRoleId === userRole.id;
  },
  
  // Check if user can delete project
  canDeleteProject: (userRole: UserRole): boolean => {
    return userRole.role === 'PROJECT_OWNER';
  },
  
  // Check if user can delete department
  canDeleteDepartment: (userRole: UserRole, department: Department): boolean => {
    return userRole.role === 'PROJECT_OWNER' || 
           userRole.managedDepartments.some(d => d.id === department.id);
  },
  
  // Check if user can delete task
  canDeleteTask: (userRole: UserRole): boolean => {
    return userRole.role === 'PROJECT_OWNER' || userRole.role === 'PROJECT_MANAGER';
  },
  
  // Check if user can invite others
  canInviteUsers: (userRole: UserRole): boolean => {
    return userRole.role === 'PROJECT_OWNER' || userRole.role === 'PROJECT_MANAGER';
  },
  
  // Check if user can manage team roles
  canManageTeam: (userRole: UserRole): boolean => {
    return userRole.role === 'PROJECT_OWNER';
  },
  
  // Check if user can view project
  canViewProject: (userRole: UserRole): boolean => {
    return !!userRole; // Any user with a role can view the project
  },
  
  // Get user's department access level
  getUserDepartmentAccess: (userRole: UserRole): {
    canManage: Department[];
    canAccess: Department[];
  } => {
    // PROJECT_OWNER has access to all departments
    if (userRole.role === 'PROJECT_OWNER') {
      return {
        canManage: [], // Will be populated with all departments from the project
        canAccess: []  // Will be populated with all departments from the project
      };
    }
    
    return {
      canManage: userRole.managedDepartments || [],
      canAccess: userRole.accessibleDepartments || []
    };
  }
};
