import { RolePermissionDto } from './role-permission.dto';

export class RoleListDto {
  id: number;
  name: string;
  rolePermissions: RolePermissionDto[];
}
