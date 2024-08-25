import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Get()
  @Render('task/index')
  async index(): Promise<{ pageTitle: string }> {
    return {
      pageTitle: 'Tasks',
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
  ): Promise<{ id: number; pageTitle: string }> {
    return {
      id,
      pageTitle: 'Edit Task',
    };
  }
  @Get(':id/delete')
  @Render('task/delete')
  async delete(
    @Param('id') id: number,
  ): Promise<{ id: number; pageTitle: string }> {
    return {
      id,
      pageTitle: 'Delete Task',
    };
  }
}
