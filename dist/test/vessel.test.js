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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
describe("Post /", () => {
    let server;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        server = yield (0, index_1.default)();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield server.stop();
    }));
    it("should return status code 200", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)((yield server).listener).post("/api/v1/vessel/register");
        expect(response.statusCode).toEqual(200);
    }));
    it("should return the expected response", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)((yield server).listener).post("/api/v1/vessel/register");
        expect(response.text).toEqual("KYC Hello World!");
    }));
});
//# sourceMappingURL=vessel.test.js.map