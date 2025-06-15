export enum Role {
  ADMIN = 'Admin',
  BIOMEDICAL_ENGINEER = 'BiomedicalEngineer',
  MAINTENANCE_TECHNICIAN = 'MaintenanceTechnician',
  LAB_TECHNICIAN = 'LabTechnician'
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