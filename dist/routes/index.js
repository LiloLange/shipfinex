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
const config_1 = __importDefault(require("../config"));
const kyc_1 = require("./kyc");
const user_1 = require("./user");
const milestone_1 = require("./milestone");
const project_1 = require("./project");
const transaction_1 = require("./transaction");
const vessel_1 = require("./vessel");
const investment_1 = require("./investment");
const deposit_1 = require("./deposit");
const chat_1 = require("./chat");
const prefix = `/api/${config_1.default.apiVersion}`;
const setRoutes = (server) => __awaiter(void 0, void 0, void 0, function* () {
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/user`;
    server.route(user_1.userRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/kyc`;
    server.route(kyc_1.kycRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/milestone`;
    server.route(milestone_1.mileStoneRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/project`;
    server.route(project_1.projectRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/transaction`;
    server.route(transaction_1.transactionRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/vessel`;
    server.route(vessel_1.vesselRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/invest`;
    server.route(investment_1.investmentRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/deposit`;
    server.route(deposit_1.depositRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/chat`;
    server.route(chat_1.chatRoute);
});
exports.default = setRoutes;
//# sourceMappingURL=index.js.map