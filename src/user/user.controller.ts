import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserListDto } from './dto/user-list.dto';
import { RoleListDto } from './dto/role-list.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PoliciesGuard } from 'src/policies/policies.guard';
import { Policies } from 'src/common/decorators/policies.decorator';
import {
  ManageUserRoles,
  ViewUsersAndRoles,
} from 'src/policies/user-roles.policies';

const prisma = new PrismaClient();

@UseGuards(JwtAuthGuard, PoliciesGuard) // Daftarkan Decorator PoliciesGuard
@Controller('user')
export class UserController {
  @Get()
  @Policies(new ViewUsersAndRoles()) // Tambahkan Policy ViewUsersAndRoles
  @Render('user/index')
  async index(): Promise<{ pageTitle: string; users: UserListDto[] }> {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return {
      pageTitle: 'Users',
      users,
    };
  }
  @Get(':id/edit')
  @Policies(new ManageUserRoles()) // Tambahkan Policy ManageUserRoles
  @Render('user/edit_role')
  async edit(@Param('id') userId): Promise<{
    pageTitle: string;
    user: UserListDto;
    roles: RoleListDto[];
  }> {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        role: true,
      },
    });
    const roles = await prisma.role.findMany();
    return {
      pageTitle: 'Edit User Role',
      user,
      roles,
    };
  }
  @Put(':id/update')
  @Policies(new ManageUserRoles()) // Tambahkan Policy ManageUserRoles
  async update(
    @Param('id') userId,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res() res: Response,
  ) {
    const { roleId } = updateRoleDto;
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.user.update({
          where: { id: Number(userId) },
          data: { roleId: Number(roleId) },
        });
      });

      res.redirect('/user');
    } catch (error) {
      console.error('Update user role error:', error);
      res.redirect(`/user/${userId}/edit/`);
    }
  }
}
