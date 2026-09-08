import { Role } from './index';

export type Permission = 
  | 'members.read' | 'members.write'
  | 'entrepreneurs.read' | 'entrepreneurs.write'
  | 'donations.read' | 'donations.write'
  | 'projects.read' | 'projects.write'
  | 'content.read' | 'content.write'
  | 'settings.read' | 'settings.write'
  | 'audit.read'
  | 'marketplace.read' | 'marketplace.create' | 'marketplace.update' | 'marketplace.delete' | 'marketplace.manage'
  | 'orders.read' | 'orders.update' | 'orders.manage'
  | 'inventory.read' | 'inventory.update';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'members.read', 'members.write', 
    'entrepreneurs.read', 'entrepreneurs.write',
    'donations.read', 'donations.write',
    'projects.read', 'projects.write',
    'content.read', 'content.write',
    'settings.read', 'settings.write',
    'audit.read',
    'marketplace.read', 'marketplace.create', 'marketplace.update', 'marketplace.delete', 'marketplace.manage',
    'orders.read', 'orders.update', 'orders.manage',
    'inventory.read', 'inventory.update'
  ],
  ADMIN: [
    'members.read', 'members.write', 
    'entrepreneurs.read', 'entrepreneurs.write',
    'donations.read', 'donations.write',
    'projects.read', 'projects.write',
    'content.read', 'content.write',
    'marketplace.read', 'marketplace.create', 'marketplace.update', 'marketplace.delete', 'marketplace.manage',
    'orders.read', 'orders.update', 'orders.manage',
    'inventory.read', 'inventory.update'
  ],
  MODERATOR: [
    'members.read',
    'entrepreneurs.read', 'entrepreneurs.write',
    'marketplace.read',
    'orders.read'
  ],
  CONTENT_MANAGER: [
    'projects.read', 'projects.write',
    'content.read', 'content.write',
    'marketplace.read'
  ],
  FINANCE_MANAGER: [
    'donations.read', 'donations.write',
    'projects.read',
    'orders.read', 'orders.update', 'orders.manage'
  ],
  TRAINER: [],
  ENTREPRENEUR: [
    'marketplace.read'
  ],
  MEMBER: [
    'marketplace.read'
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.includes(permission) : false;
}
