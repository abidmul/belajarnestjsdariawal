import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Redirect,
  Render,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Task } from './dto/create-task-dto';

const prisma = new PrismaClient();

@Controller('task')
export class TaskController {
  @Get()
  @Render('task/index')
  async index(): Promise<{ pageTitle: string; tasks: Task[] }> {
    const tasks: Task[] = await prisma.task.findMany();
    return {
      pageTitle: 'Tasks',
      tasks,
    };
  }

  @Get('create')
  @Render('task/create')
  async create(): Promise<{ pageTitle: string }> {
    return {
      pageTitle: 'Create Task',
    };
  }
  @Get(':id/edit')
  @Render('task/edit')
  async edit(
    @Param('id') id: number,
  ): Promise<{ pageTitle: string; task: Task; dueDate: string }> {
    const task: Task = await prisma.task.findUnique({
      where: {
        id: Number(id),
      },
    });

    const dueDate = new Date(task.dueDate).toISOString().split('T')[0];

    return {
      pageTitle: 'Edit Task',
      task,
      dueDate,
    };
  }
  @Get(':id/delete')
  @Render('task/delete')
  async delete(
    @Param('id') id: number,
  ): Promise<{ pageTitle: string; task: Task }> {
    const task: Task = await prisma.task.findUnique({
      where: {
        id: Number(id),
      },
    });

    return {
      pageTitle: 'Delete Task',
      task,
    };
  }
  @Delete(':id/destroy')
  @Redirect('/task')
  async destroy(@Param('id') id: string) {
    await prisma.task.delete({
      where: {
        id: Number(id),
      },
    });
  }

  @Post('store')
  @Redirect('/task')
  async store(@Body() task: Task) {
    const data = {
      ...task,
      dueDate: new Date(task.dueDate),
    };

    await prisma.task.create({
      data,
    });
  }
  @Put(':id/update')
  @Redirect('/task')
  async update(@Param('id') id: number, @Body() task: Task) {
    const data = {
      ...task,
      dueDate: new Date(task.dueDate),
    };

    await prisma.task.update({
      where: {
        id: Number(id),
      },
      data,
    });
  }
}
