import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  Redirect,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RoleListDto } from './dto/role-list.dto';
import { PermissionDto } from './dto/permission.dto';
import { ManageRoleDto } from './dto/manage-role.dto';
import { Response } from 'express';

const prisma = new PrismaClient();

@Controller('role')
export class RoleController {
  @Render('role/index')
  @Get()
  async index(): Promise<{ pageTitle: string; roles: RoleListDto[] }> {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    return {
      pageTitle: 'Role List',
      roles,
    };
  }
  @Get('create')
  @Render('role/create')
  async create(): Promise<{ pageTitle: string; permissions: PermissionDto[] }> {
    const permissions = await prisma.permission.findMany();
    return {
      pageTitle: 'Create Role',
      permissions,
    };
  }
  @Post('store')
  @Redirect('/role')
  async store(@Body() createRoleDto: ManageRoleDto, @Res() res: Response) {
    const { name, permissionIds } = createRoleDto;
    try {
      await prisma.$transaction(async (prisma) => {
        const role = await prisma.role.create({
          data: { name },
        });

        const rolePermissionsData = permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId: Number(permissionId),
        }));

        await prisma.rolePermission.createMany({
          data: rolePermissionsData,
        });
      });
      res.redirect('/role');
    } catch (error) {
      console.error('Create role error:', error);
      res.redirect('/role/create');
    }
  }
  @Get(':id/edit')
  @Render('role/edit')
  async edit(@Param('id') id: string): Promise<{
    pageTitle: string;
    permissions: PermissionDto[];
    role: RoleListDto;
    selectedPermissionIds: number[];
  }> {
    const permissions = await prisma.permission.findMany();
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    const selectedPermissionIds = role.rolePermissions.map(
      (rolePermission) => rolePermission.permissionId,
    );
    return {
      pageTitle: 'Edit Role',
      permissions,
      role,
      selectedPermissionIds,
    };
  }
  @Put(':id/update')
  @Redirect('/role')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: ManageRoleDto,
    @Res() res: Response,
  ) {
    const { name, permissionIds } = updateRoleDto;
    try {
      await prisma.$transaction(async (prisma) => {
        const role = await prisma.role.update({
          where: { id: Number(id) },
          data: { name },
        });

        const rolePermissionsData = permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId: Number(permissionId),
        }));

        await prisma.rolePermission.deleteMany({
          where: { roleId: role.id },
        });
        await prisma.rolePermission.createMany({
          data: rolePermissionsData,
        });
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.redirect(`/role/${id}/edit`);
    }
  }
  @Get(':id/delete')
  @Render('role/delete')
  async delete(@Param('id') id: string) {
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
    });
    return {
      pageTitle: 'Delete Role',
      role,
    };
  }
  @Delete(':id/destroy')
  @Redirect('/role')
  async destroy(@Param('id') id: string) {
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.rolePermission.deleteMany({
          where: { roleId: Number(id) },
        });
        await prisma.role.delete({
          where: { id: Number(id) },
        });
      });
    } catch (error) {
      console.error('Delete role error:', error);
    }
  }
}
