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
exports.userRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const users_1 = __importDefault(require("../models/users"));
const config_1 = __importDefault(require("../config"));
const user_1 = require("../validation/user");
const user_2 = require("../swagger/user");
const otp_1 = __importDefault(require("../utils/otp"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const options = { abortEarly: false, stripUnknown: true };
exports.userRoute = [
    {
        method: "POST",
        path: "/register",
        options: {
            description: "Register User",
            plugins: user_2.createUserSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.createUserSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const email = request.payload["email"];
                const user = yield users_1.default.findOne({ email });
                if (user) {
                    return response.response({ msg: "User already exists." }).code(409);
                }
                const newUser = new users_1.default(request.payload);
                const { password } = newUser;
                const hash = yield bcrypt_1.default.hash(password, 10);
                newUser.password = hash;
                const result = yield newUser.save();
                const token = jsonwebtoken_1.default.sign({ userId: result._id, email: result.email }, config_1.default.jwtSecret, {
                    expiresIn: "3m",
                });
                const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
                console.log(baseUrl);
                const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
                (0, sendMail_1.default)(result.email, content);
                return response
                    .response({
                    email: result.email,
                    firstName: result.firstName,
                    lastName: result.lastName,
                })
                    .code(201);
                // return token;
            }
            catch (error) {
                return response.response(error).code(500);
            }
        }),
    },
    {
        method: "POST",
        path: "/login",
        options: {
            description: "Login",
            plugins: user_2.loginUserSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.loginUserSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield users_1.default.findOne({ email: request.payload["email"] });
            if (user) {
                const hpass = yield bcrypt_1.default.compare(request.payload["password"], user.password);
                if (hpass) {
                    if (user.emailVerified) {
                        const otp = (0, otp_1.default)();
                        user.otp = otp;
                        const result = yield user.save();
                        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your OTP code :</p><button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">${result.otp}</button></div>`;
                        (0, sendMail_1.default)(result.email, content);
                        return response.response({
                            msg: "OTP Code has just sent to your email.",
                            // otp: result.otp,
                        });
                        //Generate and send OTP
                    }
                    else {
                        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, config_1.default.jwtSecret, {
                            expiresIn: "3m",
                        });
                        // sendMail(user.email, token);
                        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
                        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
                        (0, sendMail_1.default)(user.email, content);
                        return response.response({
                            msg: "Email verification has sent to your email",
                        });
                    }
                }
                else {
                    return response.response({ msg: "Password is incorrect." }).code(400);
                }
            }
            return response.response({ msg: "User not found." }).code(404);
        }),
    },
    {
        method: "POST",
        path: "/verify-otp",
        options: {
            description: "Verify OTP",
            plugins: user_2.otpSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.otpSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield users_1.default.findOne({ email: request.payload["email"] });
            if (user) {
                if (user.otp === request.payload["otp"]) {
                    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, config_1.default.jwtSecret, {
                        expiresIn: "1h",
                    });
                    const fullName = user.firstName + " " + user.lastName;
                    return response
                        .response({ token, fullName, role: user.role })
                        .code(200);
                }
            }
            return response.response({ msg: "OTP Verification Failed." }).code(400);
        }),
    },
    {
        method: "GET",
        path: "/verify-email/{token}",
        options: {
            description: "Verify Email",
            plugins: user_2.verifyEmailSwagger,
            tags: ["api", "user"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            const success = fs_1.default.readFileSync("./utils/emailVeriffSucess.txt");
            const failed = fs_1.default.readFileSync("./utils/emailVeriffFail.txt");
            const decoded = jsonwebtoken_1.default.decode(request.params.token);
            if (decoded === null) {
                return failed.toLocaleString();
            }
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                return failed.toLocaleString();
            }
            const user = yield users_1.default.findById(decoded.userId);
            if (user) {
                user.emailVerified = true;
                yield user.save();
                return success.toLocaleString();
            }
            return failed.toLocaleString();
        }),
    },
    {
        method: "GET",
        path: "/current",
        options: {
            auth: "jwt",
            description: "Get current user by token",
            plugins: user_2.currentUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const user = yield users_1.default.findById(userId);
                const userData = {
                    _id: userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    doneMilestones: user.doneMilestones,
                    transactions: user.transactions,
                };
                return userData;
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all user information",
            plugins: user_2.getAllUserSwawgger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const user = yield users_1.default.findById(userId);
                if (user.role === "admin") {
                    const allUser = yield users_1.default.find({ role: { $ne: "admin" } });
                    return allUser;
                }
                return response
                    .response({ msg: "You have no permission to access." })
                    .code(403);
            }),
        },
    },
    {
        method: "GET",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Get signle user's information",
            plugins: user_2.getSingleUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                if (authUser.role === "admin") {
                    const user = yield users_1.default.findById(request.params.userId);
                    if (user)
                        return user;
                    return response
                        .response({ msg: "Cannot find the specific user's information." })
                        .code(400);
                }
                return response
                    .response({ msg: "You have no permission to access." })
                    .code(403);
            }),
        },
    },
    {
        method: "PUT",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Get single user's information",
            plugins: user_2.getSingleUserSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.userUpdateSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const payload = request.payload;
                if (payload.password) {
                    const hash = yield bcrypt_1.default.hash(payload.password, 10);
                    payload.password = hash;
                }
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                if (authUser.role === "admin" || request.params.userId === userId) {
                    const user = yield users_1.default.findOneAndUpdate({ _id: request.params.userId }, { $set: payload }, { new: true });
                    return user;
                }
                return response.response({ msg: "Cannot update" }).code(400);
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Delete single user",
            plugins: user_2.deleteSingleUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                console.log(authUser.role);
                if (authUser.role === "admin" || request.params.userId === userId) {
                    yield users_1.default.findOneAndRemove({ _id: request.params.userId });
                    return response.response({ msg: "User deleted successfully." });
                }
                return response.response({ msg: "Cannot delete user." }).code(400);
            }),
        },
    },
    {
        method: "GET",
        path: "/milestone/:completeId",
        handler: (request, response) => {
            return "Hello World!";
        },
    },
];
//# sourceMappingURL=user.js.map