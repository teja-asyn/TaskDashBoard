import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ISubtask {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeId?: mongoose.Types.ObjectId | null;
  dueDate?: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId | null;
  dueDate?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  subtasks?: ISubtask[];
  labels?: string[];
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide task title'],
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    subtasks: [SubtaskSchema],
    labels: [String],
    estimatedHours: {
      type: Number,
      min: 0,
      default: null,
    },
    actualHours: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ labels: 1 });
TaskSchema.index({ createdAt: -1 });

// Virtual for completion percentage
TaskSchema.virtual('completionPercentage').get(function(this: ITask) {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'done' ? 100 : 0;
  }
  
  const completed = this.subtasks.filter(st => st.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

export default mongoose.model<ITask>('Task', TaskSchema);