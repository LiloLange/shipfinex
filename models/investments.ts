import mongoose from "mongoose";

const Schema = mongoose.Schema;
const investmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "project",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Investment = mongoose.model("investment", investmentSchema);
export default Investment;
