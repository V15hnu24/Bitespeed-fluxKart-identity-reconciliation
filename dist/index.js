"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const contactController_1 = require("./controllers/contactController");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.post("/identify", contactController_1.identifyContact);
app.get('/', (req, res) => {
    res.status(200).send('Hello, World!');
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
