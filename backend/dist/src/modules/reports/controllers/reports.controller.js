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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("../services/reports.service");
const report_query_dto_1 = require("../dto/report-query.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../../../common/guards/rbac.guard");
const enums_1 = require("../../../common/constants/enums");
const api_response_interface_1 = require("../../../common/types/global/api-response.interface");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async executiveSummary(query) {
        const data = await this.reportsService.executiveSummary(query);
        return (0, api_response_interface_1.ok)(data, 'Executive summary');
    }
    async byProject(query) {
        const data = await this.reportsService.byProject(query);
        return (0, api_response_interface_1.ok)(data, 'Project-wise report');
    }
    async byReporter(query) {
        const data = await this.reportsService.byReporter(query);
        return (0, api_response_interface_1.ok)(data, 'Reporter workload');
    }
    async byAssignee(query) {
        const data = await this.reportsService.byAssignee(query);
        return (0, api_response_interface_1.ok)(data, 'Assignee workload');
    }
    async overdueAging(query) {
        const data = await this.reportsService.overdueAging(query);
        return (0, api_response_interface_1.ok)(data, 'Overdue aging');
    }
    async issueRegister(query) {
        const data = await this.reportsService.issueRegister(query);
        return (0, api_response_interface_1.ok)(data, 'Issue register');
    }
    async weeklyTrend(query) {
        const data = await this.reportsService.weeklyTrend(query);
        return (0, api_response_interface_1.ok)(data, 'Weekly trend');
    }
    async priorityMatrix(query) {
        const data = await this.reportsService.priorityMatrix(query);
        return (0, api_response_interface_1.ok)(data, 'Priority vs status matrix');
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('executive-summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "executiveSummary", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('by-project'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "byProject", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('by-reporter'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "byReporter", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('by-assignee'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "byAssignee", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('overdue-aging'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "overdueAging", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('issue-register'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "issueRegister", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('weekly-trend'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "weeklyTrend", null);
__decorate([
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Get)('priority-matrix'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "priorityMatrix", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, common_1.Controller)('api/v1/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map