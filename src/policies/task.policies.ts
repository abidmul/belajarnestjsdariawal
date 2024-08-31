import { UserDto } from 'src/user/dto/user.dto';
import { PolicyHandler } from './policies.interface';

function getPermissions(user: UserDto): string[] {
  return (
    user.role?.rolePermissions?.map((rolePermission) => {
      return rolePermission.permission.name;
    }) || []
  );
}

export class ViewTasks implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('view-tasks');
  }
}

export class EditTasks implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('edit-tasks');
  }
}

export class DeleteTasks implements PolicyHandler {
  handle(user: UserDto): boolean {
    const permissions = getPermissions(user);
    return permissions.includes('delete-tasks');
  }
}
