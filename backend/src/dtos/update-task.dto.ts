import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskPriority } from '../entities/Task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
