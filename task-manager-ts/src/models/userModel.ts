import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name!'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email!'],
      unique: true,         // this prevents two people from using the same email
    },
    password: {
      type: String,
      required: [true, 'Please add a password!'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);