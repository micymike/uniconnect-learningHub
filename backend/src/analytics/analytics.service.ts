import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Course, CourseDocument } from '../courses/courses.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async getSummary() {
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.userModel.countDocuments({ role: 'student' });
    const totalAdmins = await this.userModel.countDocuments({ role: 'admin' });
    const totalCourses = await this.courseModel.countDocuments();

    return {
      totalUsers,
      totalStudents,
      totalAdmins,
      totalCourses,
    };
  }
}
