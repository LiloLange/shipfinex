import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  referralCode: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["investor", "prowner", "admin"],
  },
  doneMilestones: [
    {
      milestoneId: {
        type: Schema.Types.ObjectId,
        ref: "milestone",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  otp: {
    type: String,
  },
  transactions: [
    {
      transactionId: {
        type: Schema.Types.ObjectId,
        ref: "transaction",
      },
    },
  ],
});

const User = mongoose.model("user", userSchema);
export default User;
