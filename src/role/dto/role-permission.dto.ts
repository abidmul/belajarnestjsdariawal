import { PermissionDto } from './permission.dto';

export class RolePermissionDto {
  roleId: number;
  permissionId: number;
  permission: PermissionDto;
}
