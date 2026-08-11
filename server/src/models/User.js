import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Hide password by default in queries
    },
    preferences: {
      travelStyle: {
        type: String,
        enum: ['Adventure', 'Relaxed', 'Cultural', 'Luxury', 'Budget', 'Balanced'],
        default: 'Balanced',
      },
      dietary: {
        type: String,
        enum: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Jain'],
        default: 'None',
      },
      pace: {
        type: String,
        enum: ['Fast', 'Moderate', 'Slow'],
        default: 'Moderate',
      },
      interests: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
