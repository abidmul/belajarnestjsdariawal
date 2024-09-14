import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';

import { PrismaClient, Status, Task as TaskModel } from '@prisma/client';

import { GetUser } from 'src/common/decorators/user.decorator';
import { Task } from 'src/task/dto/create-task-dto';

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
  async store(@Body() task: Task, @GetUser('id') userId: number) {
    const data = {
      ...task,
      userId,
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

  @Get('progress')
  @Render('task/progress')
  async progress(): Promise<{
    pageTitle: string;
    groupedTasks: Record<Status, TaskModel[]>;
  }> {
    const pageTitle = 'Task Progress';
    let tasks = [];

    tasks = await prisma.task.findMany();

    const groupedTasks = tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<Status, TaskModel[]>,
    );

    return {
      pageTitle,
      groupedTasks,
    };
  }
  @Patch('move/:id')
  @Redirect('/task/progress')
  async move(@Param('id') id: string, @Query('status') status: Status) {
    await prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });
  }
}
