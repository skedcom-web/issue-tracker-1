"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const issues_service_1 = require("../../issues/services/issues.service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const api_response_interface_1 = require("../../../common/types/global/api-response.interface");
let DashboardController = class DashboardController {
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    async stats(projectId) {
        const pid = projectId ? Number(projectId) : undefined;
        const data = await this.issuesService.getStats(pid);
        return (0, api_response_interface_1.ok)(data, 'Dashboard stats retrieved');
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "stats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/dashboard'),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map