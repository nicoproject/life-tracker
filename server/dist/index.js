"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promise_1 = __importDefault(require("mysql2/promise"));
const tasks_1 = __importDefault(require("./api/tasks"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173' // URL вашего фронтенда
}));
app.use(express_1.default.json());
app.use('/tasks', tasks_1.default);
exports.pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Shikira98',
    database: 'life_tracker',
});
// Проверка подключения к MySQL
exports.pool
    .getConnection()
    .then(() => console.log('Connected to MySQL'))
    .catch((err) => console.error('MySQL connection error:', err));
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
