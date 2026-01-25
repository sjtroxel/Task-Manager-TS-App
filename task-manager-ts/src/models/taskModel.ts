import mongoose, { Schema, Document } from 'mongoose';

// 1. this is for TypeScript - it defines what a Task looks like in our code
export interface ITask extends Document {
  title: string;
  description: string;
  isCompleted: boolean;
}

// 2. this is for Mongoose - it defines how it's stored in MongoDB
const taskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title!'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description!'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // this automatically creates 'createdAt' and 'updatedAt' fields
  }
);

export default mongoose.model<ITask>('Task', taskSchema);