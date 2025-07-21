import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './courses.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async create(data: Partial<Course>): Promise<Course> {
    const created = new this.courseModel(data);
    return created.save();
  }

  async update(id: string, data: Partial<Course>): Promise<Course | null> {
    return this.courseModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.courseModel.findByIdAndDelete(id).exec();
  }
}
