import { Schema, model } from 'mongoose';

interface ActivityLogEntry {
  action: 'created' | 'updated' | 'deleted' | 'toggled';
  timestamp: Date;
  detail: string;
}

interface TaskMetadataDocument {
  taskId: number;
  activityLog: ActivityLogEntry[];
}

const activityLogSchema = new Schema<ActivityLogEntry>({
  action: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
});

const taskMetadataSchema = new Schema<TaskMetadataDocument>({
  taskId: { type: Number, required: true, unique: true, index: true },
  activityLog: [activityLogSchema],
});

export const TaskMetadataModel = model<TaskMetadataDocument>(
  'TaskMetadata',
  taskMetadataSchema,
  'task_metadata',  // explicit collection name — snake_case plural per project convention
);

export type { ActivityLogEntry, TaskMetadataDocument };
