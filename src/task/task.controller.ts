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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Task } from './dto/task-dto';
import { PrismaClient, Status, Task as TaskModel } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { Response } from 'express';
import { promisify } from 'util';
import { unlink } from 'fs';
import { Policies } from 'src/common/decorators/policies.decorator';
import { DeleteTasks, EditTasks } from 'src/policies/task.policies';

const prisma = new PrismaClient();

const unlinkAsync = promisify(unlink);

@UseGuards(JwtAuthGuard)
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
  @Render('task/edit')
  async edit(
    @Param('id') id: number,
  ): Promise<{ pageTitle: string; task: Task; dueDate: string }> {
    const task: Task = await prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        files: true,
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
  @Policies(new DeleteTasks()) // Cek permission untuk delete
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
  @Policies(new DeleteTasks()) // Cek permission untuk delete
  @Redirect('/task')
  async destroy(@Param('id') id: string) {
    await prisma.task.delete({
      where: {
        id: Number(id),
      },
    });
  }

  @Post('store')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @Redirect('/task')
  async store(
    @Body() task: Task,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req['user'];
    const data = {
      ...task,
      userId: user.id,
      dueDate: new Date(task.dueDate),
    };

    const newTask = await prisma.task.create({
      data,
    });

    if (file) {
      data['filePath'] = file.path;

      await prisma.taskFile.create({
        data: {
          taskId: newTask.id,
          name: file.originalname,
          path: file.path,
        },
      });
    }
  }

  @Put(':id/update')
  @Policies(new EditTasks()) // Cek permission untuk update
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
  @Post(':taskId/file/store')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async storeFile(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    await prisma.taskFile.create({
      data: {
        taskId: Number(taskId),
        name: file.originalname,
        path: file.path,
      },
    });
    res.redirect(`/task/${taskId}/edit`);
  }
  @Delete(':taskId/file/:fileId')
  async deleteFile(
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    try {
      const file = await prisma.taskFile.findUnique({
        where: {
          id: Number(fileId),
        },
      });
      const filePath = resolve(file.path);
      await unlinkAsync(filePath);

      await prisma.taskFile.delete({
        where: {
          id: Number(fileId),
        },
      });

      res.redirect(`/task/${taskId}/edit`);
    } catch (error) {
      console.log(error);
    }
  }
}
