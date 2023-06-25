"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awilix_1 = require("awilix");
const kv_1 = require("@vercel/kv");
exports.default = async ({ container }) => {
    container.register({
        redis: (0, awilix_1.asValue)(kv_1.kv),
    });
};
//# sourceMappingURL=index.js.map