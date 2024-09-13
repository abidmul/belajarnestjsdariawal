import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Task } from '../../task/dto/task-dto';
import { PrismaClient } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const prisma = new PrismaClient();

@Controller('api/v1/task')
export class TaskController {
  @Get()
  @HttpCode(200)
  async index(): Promise<{ message: string; data: Task[]; code: number }> {
    const tasks = await prisma.task.findMany({
      include: {
        user: true,
        files: true,
      },
    });
    return {
      message: 'Data retrieved successfully',
      data: tasks,
      code: 200,
    };
  }
  @Post('store')
  @HttpCode(201)
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
  async store(@Body() task: Task, @UploadedFile() file: Express.Multer.File) {
    const data = {
      ...task,
      userId: 1, // hardcoded userId
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

    return {
      message: 'Task created successfully',
      code: 201,
    };
  }
  @Get(':id')
  @HttpCode(200)
  async show(
    @Param('id') id: string,
  ): Promise<{ message: string; data: Task | null; code: number }> {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        files: true,
      },
    });

    if (!task) {
      return {
        message: 'Task not found',
        data: null,
        code: 404,
      };
    }

    return {
      message: 'Task retrieved successfully',
      data: task,
      code: 200,
    };
  }
  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() task: Task,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ message: string; code: number }> {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTask) {
      return {
        message: 'Task not found',
        code: 404,
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...task,
        dueDate: new Date(task.dueDate),
      },
    });

    if (file) {
      await prisma.taskFile.create({
        data: {
          taskId: updatedTask.id,
          name: file.originalname,
          path: file.path,
        },
      });
    }

    return {
      message: 'Task updated successfully',
      code: 200,
    };
  }
  @Delete(':id')
  @HttpCode(200)
  async delete(
    @Param('id') id: string,
  ): Promise<{ message: string; code: number }> {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return {
        message: 'Task not found',
        code: 404,
      };
    }

    await prisma.taskFile.deleteMany({
      where: { taskId: task.id },
    });

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    return {
      message: 'Task deleted successfully',
      code: 200,
    };
  }
}
