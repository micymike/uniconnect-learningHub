import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, IsIn, IsUrl, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';

  @IsNumber()
  @Min(0)
  duration_hours: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  is_free: boolean;

  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @IsOptional()
  @IsUrl()
  intro_video_url?: string;

  @IsOptional()
  @IsUrl()
  video_content_url?: string;

  @IsOptional()
  @IsString()
  prerequisites?: string;

  @IsArray()
  @IsString({ each: true })
  learning_objectives: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsIn(['draft', 'published'])
  status: 'draft' | 'published';

  @IsBoolean()
  is_featured: boolean;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_hours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @IsOptional()
  @IsUrl()
  intro_video_url?: string;

  @IsOptional()
  @IsUrl()
  video_content_url?: string;

  @IsOptional()
  @IsString()
  prerequisites?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learning_objectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}