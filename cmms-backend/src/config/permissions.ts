export enum Role {
  ADMIN = 'Admin',
  BIOMEDICAL_ENGINEER = 'BiomedicalEngineer',
  MAINTENANCE_TECHNICIAN = 'MaintenanceTechnician',
  LAB_TECHNICIAN = 'LabTechnician',
}

export const ROLES = [
 Role.ADMIN,
 Role.BIOMEDICAL_ENGINEER,
 Role.MAINTENANCE_TECHNICIAN,
 Role.LAB_TECHNICIAN,
];

export enum Permission {
  // Admin
  MANAGE_USERS = 'manage_users',
  VIEW_ALL_REPORTS = 'view_all_reports',
  MANAGE_BUDGETS = 'manage_budgets',
  MANAGE_COMPLIANCE_FULL = 'manage_compliance_full',
  MANAGE_EQUIPMENT_FULL = 'manage_equipment_full',
  MANAGE_CONTRACTS_FULL = 'manage_contracts_full',
  VIEW_MAINTENANCE_HISTORY_FULL = 'view_maintenance_history_full',
  VIEW_WORK_ORDERS_FULL = 'view_work_orders_full',
  MANAGE_SPARE_PARTS_FULL = 'manage_spare_parts_full',

  // Biomedical Engineer
  MANAGE_EQUIPMENT = 'manage_equipment',
  ASSIGN_WORK_ORDERS = 'assign_work_orders',
  CREATE_WORK_ORDERS = 'create_work_orders',
  VIEW_EQUIPMENT_STATUS = 'view_equipment_status',
  VIEW_REPORTS_TECHNICAL = 'view_reports_technical',
  MANAGE_CONTRACTS = 'manage_contracts',
  ORDER_SPARE_PARTS = 'order_spare_parts',
  VIEW_MAINTENANCE_HISTORY = 'view_maintenance_history',
  VIEW_WORK_ORDERS = 'view_work_orders',

  // Maintenance Technician
  VIEW_ASSIGNED_WORK_ORDERS = 'view_assigned_work_orders',
  UPDATE_WORK_ORDERS = 'update_work_orders',
  UPDATE_SPARE_PARTS_USAGE = 'update_spare_parts_usage',
  REQUEST_SPARE_PARTS_RESTOCK = 'request_spare_parts_restock',
  VIEW_EQUIPMENT_DETAILS = 'view_equipment_details',

  // Lab Technician
  REPORT_EQUIPMENT_ISSUES = 'report_equipment_issues',
  VIEW_EQUIPMENT_STATUS_SIMPLE = 'view_equipment_status_simple',
  VIEW_OWN_WORK_ORDERS_STATUS = 'view_own_work_orders_status',

  // Common/General
  VIEW_SPARE_PARTS = 'view_spare_parts',
}

export const PERMISSIONS = Object.values(Permission);

export const permissionsByRole: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_REPORTS,
    Permission.MANAGE_BUDGETS,
    Permission.MANAGE_COMPLIANCE_FULL,
    Permission.MANAGE_EQUIPMENT_FULL,
    Permission.MANAGE_CONTRACTS_FULL,
    Permission.VIEW_MAINTENANCE_HISTORY_FULL,
    Permission.VIEW_WORK_ORDERS_FULL,
    Permission.MANAGE_SPARE_PARTS_FULL,
    Permission.VIEW_SPARE_PARTS, // Admins should also be able to see spare parts
  ],
  [Role.BIOMEDICAL_ENGINEER]: [
    Permission.MANAGE_EQUIPMENT,
    Permission.ASSIGN_WORK_ORDERS,
    Permission.CREATE_WORK_ORDERS,
    Permission.VIEW_EQUIPMENT_STATUS,
    Permission.VIEW_REPORTS_TECHNICAL,
    Permission.MANAGE_CONTRACTS,
    Permission.ORDER_SPARE_PARTS,
    Permission.VIEW_MAINTENANCE_HISTORY,
    Permission.VIEW_WORK_ORDERS,
    Permission.VIEW_SPARE_PARTS,
  ],
  [Role.MAINTENANCE_TECHNICIAN]: [
    Permission.VIEW_ASSIGNED_WORK_ORDERS,
    Permission.UPDATE_WORK_ORDERS,
    Permission.UPDATE_SPARE_PARTS_USAGE,
    Permission.REQUEST_SPARE_PARTS_RESTOCK,
    Permission.VIEW_EQUIPMENT_DETAILS,
    Permission.VIEW_SPARE_PARTS,
  ],
  [Role.LAB_TECHNICIAN]: [
    Permission.REPORT_EQUIPMENT_ISSUES,
    Permission.VIEW_EQUIPMENT_STATUS_SIMPLE,
    Permission.VIEW_OWN_WORK_ORDERS_STATUS,
  ],
};
