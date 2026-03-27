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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employees_service_1 = require("../services/employees.service");
const employee_dto_1 = require("../dto/employee.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../../../common/guards/rbac.guard");
const enums_1 = require("../../../common/constants/enums");
const api_response_interface_1 = require("../../../common/types/global/api-response.interface");
let EmployeesController = class EmployeesController {
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async findAll(query) {
        const result = await this.employeesService.findAll(query);
        return (0, api_response_interface_1.paginated)(result.items, result.total, result.page, result.limit);
    }
    async findOne(id) {
        const data = await this.employeesService.findOne(id);
        return (0, api_response_interface_1.ok)(data);
    }
    async create(dto) {
        const data = await this.employeesService.create(dto);
        return (0, api_response_interface_1.ok)(data, 'Employee created');
    }
    async bulkUpsert(body) {
        const data = await this.employeesService.bulkUpsert(body.rows);
        return (0, api_response_interface_1.ok)(data, `Imported: ${data.inserted} new, ${data.updated} updated`);
    }
    async update(id, dto) {
        const data = await this.employeesService.update(id, dto);
        return (0, api_response_interface_1.ok)(data, 'Employee updated');
    }
    async remove(id) {
        await this.employeesService.remove(id);
        return (0, api_response_interface_1.ok)(null, 'Employee deleted');
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.EmployeeQueryDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "bulkUpsert", null);
__decorate([
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, rbac_guard_1.Roles)(enums_1.Role.Admin, enums_1.Role.Manager),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map