// All enums defined locally — Prisma client does not export enum types directly

export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Developer = 'Developer',
  QA = 'QA',
  Reporter = 'Reporter',
}

export enum IssueStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Reopened = 'Reopened',
}

export enum IssuePriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum IssueSeverity {
  Critical = 'Critical',
  Blocker = 'Blocker',
  Major = 'Major',
  Minor = 'Minor',
}

export enum IssueType {
  Bug = 'Bug',
  Task = 'Task',
  FeatureRequest = 'FeatureRequest',
  Improvement = 'Improvement',
}

export enum IssueEnvironment {
  Dev = 'Dev',
  QA = 'QA',
  UAT = 'UAT',
  Production = 'Production',
}
