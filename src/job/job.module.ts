import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './job.schema';
import { SavedJob, SavedJobSchema } from './saved-job.schema';
import { JobService } from './job.service';
import { JobController } from './job.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: SavedJob.name, schema: SavedJobSchema }]),
  ],
  providers: [JobService],
  controllers: [JobController],
  exports: [JobService],
})
export class JobModule {}
