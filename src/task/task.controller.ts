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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Task } from './dto/task-dto';
import { PrismaClient, Status, Task as TaskModel } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { PoliciesGuard } from 'src/policies/policies.guard';
import { Policies } from 'src/common/decorators/policies.decorator';
import { EditTasks, DeleteTasks } from 'src/policies/task.policies';

const prisma = new PrismaClient();

@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('task')
export class TaskController {
  @Get()
  @Render('task/index')
  async index(
    @Req() req: Request,
  ): Promise<{ pageTitle: string; tasks: Task[] }> {
    const user = req['user'];
    const userPermissions = req['userPermissions'];
    let tasks: Task[];
    if (userPermissions.includes('view-any-tasks')) {
      tasks = await prisma.task.findMany({
        include: {
          user: true,
        },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { userId: user.id },
        include: {
          user: true,
        },
      });
    }
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
  @Policies(new EditTasks())
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
  @Policies(new DeleteTasks())
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
  @Policies(new DeleteTasks())
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
  @Policies(new EditTasks())
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
  async progress(@Req() req: Request): Promise<{
    pageTitle: string;
    groupedTasks: Record<Status, TaskModel[]>;
  }> {
    const pageTitle = 'Task Progress';
    let tasks: TaskModel[];

    const userPermissions = req['userPermissions'];
    const user = req['user'];

    if (userPermissions.includes('view-any-tasks')) {
      tasks = await prisma.task.findMany({
        include: {
          user: true,
        },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { userId: user.id },
        include: {
          user: true,
        },
      });
    }

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
  async move(
    @Param('id') id: string,
    @Query('status') status: Status,
    @Req() req: Request,
  ): Promise<void> {
    const userPermissions = req['userPermissions'];
    const user = req['user'];

    let task: TaskModel;

    if (userPermissions.includes('edit-any-tasks')) {
      task = await prisma.task.findUnique({
        where: { id: Number(id) },
      });
    } else {
      task = await prisma.task.findFirst({
        where: {
          id: Number(id),
          userId: user.id,
        },
      });

      if (!task) {
        throw new Error(
          'Task not found or you do not have permission to move this task.',
        );
      }
    }

    await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
    });
  }
}
