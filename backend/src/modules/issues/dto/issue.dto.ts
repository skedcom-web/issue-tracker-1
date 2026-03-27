import {
  IsString, IsOptional, IsEnum, IsInt,
  IsDateString, MaxLength, IsNotEmpty,
} from 'class-validator';
import {
  IssueType, IssuePriority, IssueSeverity,
  IssueStatus, IssueEnvironment,
} from '@common/constants/enums';

export class CreateIssueDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  title: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsEnum(IssueType)
  type: IssueType = IssueType.Bug;

  @IsEnum(IssuePriority)
  priority: IssuePriority;

  @IsEnum(IssueSeverity)
  severity: IssueSeverity = IssueSeverity.Major;

  @IsInt()
  projectId: number;

  @IsOptional() @IsString()
  assigneeId?: string;

  @IsOptional() @IsString()
  contactPersonId?: string;

  @IsOptional() @IsString()
  reporterId?: string;

  @IsOptional() @IsEnum(IssueEnvironment)
  environment?: IssueEnvironment;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  module?: string;

  @IsOptional() @IsString()
  stepsToReproduce?: string;

  @IsOptional() @IsString()
  expectedResult?: string;

  @IsOptional() @IsString()
  actualResult?: string;

  // File attachment — stored as base64 data URL
  @IsOptional() @IsString()
  fileName?: string;

  @IsOptional() @IsString()
  fileUrl?: string;
}

export class UpdateIssueDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(IssueType)
  type?: IssueType;

  @IsOptional() @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional() @IsEnum(IssueSeverity)
  severity?: IssueSeverity;

  @IsOptional() @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional() @IsEnum(IssueEnvironment)
  environment?: IssueEnvironment;

  @IsOptional() @IsString()
  assigneeId?: string;

  @IsOptional() @IsString()
  contactPersonId?: string;

  @IsOptional() @IsString()
  reporterId?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  module?: string;

  @IsOptional() @IsString()
  stepsToReproduce?: string;

  @IsOptional() @IsString()
  expectedResult?: string;

  @IsOptional() @IsString()
  actualResult?: string;

  @IsOptional() @IsString()
  resolution?: string;

  @IsOptional() @IsInt()
  projectId?: number;

  @IsOptional() @IsString()
  fileName?: string;

  @IsOptional() @IsString()
  fileUrl?: string;
}

export class CreateCommentDto {
  @IsString()
  body: string;

  @IsOptional() @IsEnum(IssueStatus)
  statusChange?: IssueStatus;

  @IsOptional() @IsString()
  reopenReason?: string;

  @IsOptional() @IsString()
  resolution?: string;
}

export class IssueQueryDto {
  @IsOptional() page?: number = 1;
  @IsOptional() limit?: number = 20;
  @IsOptional() status?: string;
  @IsOptional() priority?: string;
  @IsOptional() type?: string;
  @IsOptional() projectId?: string;
  @IsOptional() environment?: string;
  @IsOptional() overdue?: string;
  @IsOptional() search?: string;
  @IsOptional() assigneeId?: string;
  @IsOptional() severity?: string;
}
