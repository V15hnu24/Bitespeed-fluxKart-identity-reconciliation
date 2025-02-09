"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Parse the CA certificate
const ca = (_a = process.env.CA) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n');
const pool = new pg_1.Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 27799,
    ssl: {
        rejectUnauthorized: true,
        ca: ca,
    },
});
exports.default = pool;
