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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRole = void 0;
const typeorm_1 = require("typeorm");
let SystemRole = class SystemRole {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemRole.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "系统角色名称"
    }),
    __metadata("design:type", String)
], SystemRole.prototype, "roleName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "角色排序"
    }),
    __metadata("design:type", Number)
], SystemRole.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "角色编码"
    }),
    __metadata("design:type", String)
], SystemRole.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "角色等级"
    }),
    __metadata("design:type", Number)
], SystemRole.prototype, "roleLevel", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        nullable: true,
        comment: "角色拥有哪些菜单"
    }),
    __metadata("design:type", Object)
], SystemRole.prototype, "roleMenu", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        nullable: true,
        comment: "角色拥有哪些请求路由"
    }),
    __metadata("design:type", Object)
], SystemRole.prototype, "roleRoute", void 0);
SystemRole = __decorate([
    (0, typeorm_1.Entity)("Sys_SystemRole")
], SystemRole);
exports.SystemRole = SystemRole;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUm9sZS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvU3lzdGVtUm9sZS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlFO0FBS2pFLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVU7Q0F3Q3RCLENBQUE7QUF0Q0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztzQ0FDZDtBQU1YO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzs0Q0FDZTtBQUtqQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7d0NBQ1c7QUFLYjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7d0NBQ1c7QUFLYjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NkNBQ2dCO0FBS2xCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBQztRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7NENBQ1k7QUFNZDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUM7UUFDWCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxZQUFZO0tBQ3hCLENBQUM7OzZDQUNhO0FBbENOLFVBQVU7SUFEdEIsSUFBQSxnQkFBTSxFQUFDLGdCQUFnQixDQUFDO0dBQ1osVUFBVSxDQXdDdEI7QUF4Q1ksZ0NBQVUifQ==