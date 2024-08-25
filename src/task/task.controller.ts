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

  @Get(':id/detail')
  detail(@Param('id') id: number): string {
    return `Mengembalikan data task detail dengan id: ${id}`;
  }
}
