import { UserRoleDto } from './user-role.dto';

export class UserListDto {
  id: number;
  name: string;

  role: UserRoleDto;
}
