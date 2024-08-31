export class UserDto {
  id: number;
  name: string;
  email: string;
  role: {
    rolePermissions: { permission: { name: string } }[];
  };
}
