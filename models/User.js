import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"], // restrict values
      default: "USER",
    },
    dateOfBirth: {
      type: Date, // better than string
    },
    // Token version to invalidate refresh tokens on logout-all
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ensure email index for uniqueness
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
