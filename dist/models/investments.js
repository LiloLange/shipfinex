"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInvestmentsNumberByProjectOwner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const investmentSchema = new Schema({
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
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const Investment = mongoose_1.default.model("investment", investmentSchema);
const findInvestmentsNumberByProjectOwner = (projectOwnerId) => __awaiter(void 0, void 0, void 0, function* () {
    const objectId = new mongoose_1.default.Types.ObjectId(projectOwnerId);
    try {
        const result = yield Investment.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.projectOwner": objectId,
                },
            },
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                    status: { $first: "$user.status" },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        let active, inactive;
        if (result[0]["_id"]) {
            active = result[0]["count"];
            inactive = result[1]["count"];
        }
        else {
            inactive = result[0]["count"];
            active = result[1]["count"];
        }
        return {
            total: active + inactive,
            active,
            inactive,
        };
    }
    catch (error) {
        console.error(error);
        // Handle error
    }
});
exports.findInvestmentsNumberByProjectOwner = findInvestmentsNumberByProjectOwner;
exports.default = Investment;
//# sourceMappingURL=investments.js.map