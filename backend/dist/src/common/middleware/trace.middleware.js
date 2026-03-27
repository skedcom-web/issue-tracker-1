"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceMiddleware = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let TraceMiddleware = class TraceMiddleware {
    use(req, res, next) {
        const incoming = req.headers['traceparent'];
        let traceId;
        let spanId;
        if (incoming && this.isValidTraceparent(incoming)) {
            const parts = incoming.split('-');
            traceId = parts[1];
            spanId = this.generateSpanId();
        }
        else {
            traceId = (0, uuid_1.v4)().replace(/-/g, '');
            spanId = this.generateSpanId();
        }
        req.traceId = traceId;
        req.spanId = spanId;
        const outgoing = `00-${traceId}-${spanId}-01`;
        res.setHeader('traceparent', outgoing);
        next();
    }
    isValidTraceparent(value) {
        return /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(value);
    }
    generateSpanId() {
        return [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }
};
exports.TraceMiddleware = TraceMiddleware;
exports.TraceMiddleware = TraceMiddleware = __decorate([
    (0, common_1.Injectable)()
], TraceMiddleware);
//# sourceMappingURL=trace.middleware.js.map