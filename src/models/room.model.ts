import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  name: string;
  description?: string;
  type: "public" | "private";
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [3, "Room name must be at least 3 characters"],
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 📊 INDEXES
roomSchema.index({ name: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ members: 1 });

export const Room = mongoose.model<IRoom>("Room", roomSchema);





