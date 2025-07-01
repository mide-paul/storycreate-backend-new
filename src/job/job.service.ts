import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './job.schema';
import { SavedJob, SavedJobDocument } from './saved-job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>,
  ) {}

  async fetchAvailableJobs(): Promise<Job[]> {
    const jobs = await this.jobModel
      .find()
      .populate({
        path: 'postedBy',
        select: 'username email person',
        populate: {
          path: 'person',
          select: 'firstName middleName lastName',
        },
      })
      .exec();

    return jobs.map(job => {
      const postedBy = job.postedBy as any;
      let fullName = postedBy.person?.firstName || '';
      if (postedBy.person?.middleName) {
        fullName += ' ' + postedBy.person.middleName;
      }
      if (postedBy.person?.lastName) {
        fullName += ' ' + postedBy.person.lastName;
      }
      return {
        ...job.toObject(),
        postedBy: {
          ...postedBy,
          fullName: fullName.trim(),
        },
      };
    });
  }

  async fetchSavedJobs(userId: string): Promise<Job[]> {
    const savedJobs = await this.savedJobModel.find({ userId: new Types.ObjectId(userId) }).exec();
    const jobIds = savedJobs.map(sj => sj.jobId);
    const jobs = await this.jobModel
      .find({ _id: { $in: jobIds } })
      .populate({
        path: 'postedBy',
        select: 'username email person',
        populate: {
          path: 'person',
          select: 'firstName middleName lastName',
        },
      })
      .exec();

    return jobs.map(job => {
      const postedBy = job.postedBy as any;
      let fullName = postedBy.person?.firstName || '';
      if (postedBy.person?.middleName) {
        fullName += ' ' + postedBy.person.middleName;
      }
      if (postedBy.person?.lastName) {
        fullName += ' ' + postedBy.person.lastName;
      }
      return {
        ...job.toObject(),
        postedBy: {
          ...postedBy,
          fullName: fullName.trim(),
        },
      };
    });
  }

  async createJob(createJobDto: CreateJobDto): Promise<Job> {
    const createdJob = new this.jobModel({
      title: createJobDto.title,
      description: createJobDto.description,
      postedBy: new Types.ObjectId(createJobDto.postedById),
    });
    return createdJob.save();
  }

  async saveJob(userId: string, jobId: string): Promise<void> {
    const exists = await this.savedJobModel.findOne({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });
    if (!exists) {
      const savedJob = new this.savedJobModel({
        userId: new Types.ObjectId(userId),
        jobId: new Types.ObjectId(jobId),
      });
      await savedJob.save();
    }
  }

  async updateJob(jobId: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const updatedJob = await this.jobModel.findByIdAndUpdate(
      jobId,
      { $set: updateJobDto },
      { new: true },
    );
    if (!updatedJob) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }
    return updatedJob;
  }

  async deleteJob(jobId: string): Promise<void> {
    const result = await this.jobModel.findByIdAndDelete(jobId);
    if (!result) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }
    // Also delete saved jobs referencing this job
    await this.savedJobModel.deleteMany({ jobId: new Types.ObjectId(jobId) });
  }
}
