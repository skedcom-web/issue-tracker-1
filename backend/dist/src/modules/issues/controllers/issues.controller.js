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
exports.IssuesController = void 0;
const common_1 = require("@nestjs/common");
const issues_service_1 = require("../services/issues.service");
const issue_dto_1 = require("../dto/issue.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const api_response_interface_1 = require("../../../common/types/global/api-response.interface");
let IssuesController = class IssuesController {
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    async findAll(query) {
        const data = await this.issuesService.findAll(query);
        return (0, api_response_interface_1.ok)(data, 'Issues retrieved');
    }
    async stats(projectId) {
        const pid = projectId ? Number(projectId) : undefined;
        const data = await this.issuesService.getStats(pid);
        return (0, api_response_interface_1.ok)(data, 'Stats retrieved');
    }
    async findOne(id) {
        const data = await this.issuesService.findOne(id);
        return (0, api_response_interface_1.ok)(data, 'Issue retrieved');
    }
    async create(dto, req) {
        const data = await this.issuesService.create(dto, req.user.id);
        return (0, api_response_interface_1.ok)(data, 'Issue created');
    }
    async update(id, dto, req) {
        const data = await this.issuesService.update(id, dto, req.user.id);
        return (0, api_response_interface_1.ok)(data, 'Issue updated');
    }
    async addComment(id, dto, req) {
        const data = await this.issuesService.addComment(id, dto, req.user.id);
        return (0, api_response_interface_1.ok)(data, 'Comment added');
    }
};
exports.IssuesController = IssuesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_dto_1.IssueQueryDto]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_dto_1.CreateIssueDto, Object]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, issue_dto_1.UpdateIssueDto, Object]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, issue_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "addComment", null);
exports.IssuesController = IssuesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/issues'),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], IssuesController);
//# sourceMappingURL=issues.controller.js.map