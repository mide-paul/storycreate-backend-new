import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './job.schema';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('available')
  async fetchAvailableJobs(): Promise<Job[]> {
    return this.jobService.fetchAvailableJobs();
  }

  @Get('saved/:userId')
  async fetchSavedJobs(@Param('userId') userId: string): Promise<Job[]> {
    return this.jobService.fetchSavedJobs(userId);
  }

  @Post()
  async createJob(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobService.createJob(createJobDto);
  }

  @Post('save')
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveJob(@Body() body: { userId: string; jobId: string }): Promise<void> {
    const { userId, jobId } = body;
    return this.jobService.saveJob(userId, jobId);
  }

  @Put(':jobId')
  async updateJob(@Param('jobId') jobId: string, @Body() updateJobDto: UpdateJobDto): Promise<Job> {
    return this.jobService.updateJob(jobId, updateJobDto);
  }

  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(@Param('jobId') jobId: string): Promise<void> {
    return this.jobService.deleteJob(jobId);
  }
}
