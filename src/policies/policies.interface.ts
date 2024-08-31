import { UserDto } from 'src/user/dto/user.dto';

export interface PolicyHandler {
  handle(user: UserDto, context: any): boolean;
}

export type Policy = PolicyHandler | ((user: UserDto, context: any) => boolean);
