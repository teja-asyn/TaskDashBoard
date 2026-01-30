import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide project name'],
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
ProjectSchema.index({ ownerId: 1 }); // Index for querying projects by owner
ProjectSchema.index({ createdAt: -1 }); // Index for sorting by creation date
ProjectSchema.index({ ownerId: 1, createdAt: -1 }); // Compound index for owner's projects sorted by date

export default mongoose.model<IProject>('Project', ProjectSchema);