"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_bus_1 = __importDefault(require("./services/event-bus"));
const service = event_bus_1.default;
const moduleDefinition = {
    service,
};
exports.default = moduleDefinition;
//# sourceMappingURL=index.js.map