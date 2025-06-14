export enum Role {
  ADMIN = 'admin',
  BIOMEDICAL_ENGINEER = 'biomedical engineer',
  LAB_TECHNICIAN = 'laboratory technician',
  MAINTENANCE_TECHNICIAN = 'maintenance technician'
}

export const rolePermissions = {
  [Role.ADMIN]: [
    'manage_users',
    'manage_equipment',
    'manage_maintenance',
    'view_reports',
    'manage_budgets'
  ],
  [Role.BIOMEDICAL_ENGINEER]: [
    'manage_equipment',
    'manage_maintenance',
    'view_reports',
    'manage_budgets'
  ],
  [Role.LAB_TECHNICIAN]: [
    'report_issues',
    'view_equipment',
    'view_maintenance'
  ],
  [Role.MAINTENANCE_TECHNICIAN]: [
    'manage_maintenance',
    'view_equipment',
    'view_reports'
  ]
}; 