import { Controller, Get, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Get()
  index(): string {
    return 'Menampilkan semua task';
  }

  @Get(':id/detail')
  detail(@Param('id') id: number): string {
    return `Mengembalikan data task detail dengan id: ${id}`;
  }
}
