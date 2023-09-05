import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
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
    kycStatus: {
      type: Number,
      default: 0,
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
    wallet: {
      id: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
export default User;
