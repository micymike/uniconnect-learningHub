import { Controller, Post, Get, Delete, Put, Body, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { TaskSchedulerService, Schedule } from './task-scheduler.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Controller('task-scheduler')
export class TaskSchedulerController {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  @Post('create')
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto, @Query('userId') userId: string): Promise<Schedule> {
    return this.taskSchedulerService.createScheduleFromNLP(
      userId,
      createScheduleDto.userInput,
      createScheduleDto.preferences
    );
  }

  @Get('schedules')
  async getUserSchedules(@Query('userId') userId: string): Promise<Schedule[]> {
    return this.taskSchedulerService.getUserSchedules(userId);
  }

  @Delete('schedules/:scheduleId')
  async deleteSchedule(@Param('scheduleId') scheduleId: string, @Query('userId') userId: string) {
    await this.taskSchedulerService.deleteSchedule(userId, scheduleId);
    return { message: 'Schedule deleted successfully' };
  }

  @Put('schedules/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Query('userId') userId: string,
    @Body() schedule: Schedule
  ): Promise<Schedule> {
    return this.taskSchedulerService.updateSchedule(userId, scheduleId, schedule);
  }

  @Get('download/:scheduleId')
  async downloadSchedule(
    @Param('scheduleId') scheduleId: string,
    @Query('userId') userId: string,
    @Res() res: Response
  ) {
    const schedules = await this.taskSchedulerService.getUserSchedules(userId);
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const html = this.taskSchedulerService.generateScheduleHTML(schedule);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${schedule.title.replace(/[^a-z0-9]/gi, '_')}.html"`);
    res.send(html);
  }
}