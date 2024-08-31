import { UserDto } from 'src/user/dto/user.dto';
import { PolicyHandler } from './policies.interface';

function getPermissions(user: UserDto): string[] {
  return (
    user.role?.rolePermissions?.map((rolePermission) => {
      return rolePermission.permission.name;
    }) || []
  );
}

export class ViewUsersAndRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('view-users-and-roles');
  }
}

export class ManageUserRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('manage-user-roles');
  }
}
