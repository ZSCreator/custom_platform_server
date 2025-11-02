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
exports.SystemMenu = void 0;
const typeorm_1 = require("typeorm");
let SystemMenu = class SystemMenu {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemMenu.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "菜单名字"
    }),
    __metadata("design:type", String)
], SystemMenu.prototype, "menuName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "菜单排序"
    }),
    __metadata("design:type", Number)
], SystemMenu.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "菜单等级  1为主菜单  2 为测菜单"
    }),
    __metadata("design:type", Number)
], SystemMenu.prototype, "menuLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
        comment: "菜单编码 : 11,12"
    }),
    __metadata("design:type", String)
], SystemMenu.prototype, "menuNum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "对应前端网页编码"
    }),
    __metadata("design:type", String)
], SystemMenu.prototype, "webIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "编码图标"
    }),
    __metadata("design:type", String)
], SystemMenu.prototype, "menuCoin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "上一层菜单编码"
    }),
    __metadata("design:type", String)
], SystemMenu.prototype, "parentMenuNum", void 0);
SystemMenu = __decorate([
    (0, typeorm_1.Entity)("Sys_SystemMenu")
], SystemMenu);
exports.SystemMenu = SystemMenu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtTWVudS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvU3lzdGVtTWVudS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTZGO0FBTTdGLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVU7Q0FnRHRCLENBQUE7QUE5Q0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztzQ0FDZDtBQU1YO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzs0Q0FDZTtBQUtqQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7d0NBQ1c7QUFLYjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLHFCQUFxQjtLQUNqQyxDQUFDOzs2Q0FDZ0I7QUFNbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxjQUFjO0tBQzFCLENBQUM7OzJDQUNjO0FBT2hCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDOzs0Q0FDZTtBQU9qQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NENBQ2U7QUFPakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUM7O2lEQUNvQjtBQTdDYixVQUFVO0lBRHRCLElBQUEsZ0JBQU0sRUFBQyxnQkFBZ0IsQ0FBQztHQUNaLFVBQVUsQ0FnRHRCO0FBaERZLGdDQUFVIn0=