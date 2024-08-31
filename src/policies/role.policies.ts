import { UserDto } from 'src/user/dto/user.dto';
import { PolicyHandler } from './policies.interface';

function getPermissions(user: UserDto): string[] {
  return (
    user.role?.rolePermissions?.map((rolePermission) => {
      return rolePermission.permission.name;
    }) || []
  );
}

export class ViewAnyRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('view-any-roles');
  }
}

export class CreateNewRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('create-new-roles');
  }
}

export class UpdateAnyRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('update-any-roles');
  }
}

export class DeleteAnyRoles implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('delete-any-roles');
  }
}
