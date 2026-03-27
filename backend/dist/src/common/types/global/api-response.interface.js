"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.paginated = paginated;
function ok(data, message = 'Operation successful') {
    return { success: true, message, data };
}
function paginated(items, total, page, limit, message = 'Data retrieved successfully') {
    return {
        success: true,
        message,
        data: {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=api-response.interface.js.map