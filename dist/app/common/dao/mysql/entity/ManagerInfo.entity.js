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
exports.ManagerInfo = void 0;
const typeorm_1 = require("typeorm");
let ManagerInfo = class ManagerInfo {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ManagerInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "用户名"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "用户名密码"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "passWord", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "后台管理人员编号"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "后台备注信息"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "存储代理账号"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "存储代理账号uid"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "platformUid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "账号角色"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        nullable: true,
        comment: "白名单ip"
    }),
    __metadata("design:type", Object)
], ManagerInfo.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "顶部总代账号"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "rootAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "父级账号"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "parentAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "token"
    }),
    __metadata("design:type", String)
], ManagerInfo.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], ManagerInfo.prototype, "createTime", void 0);
ManagerInfo = __decorate([
    (0, typeorm_1.Entity)("Sp_ManagerInfo")
], ManagerInfo);
exports.ManagerInfo = ManagerInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFuYWdlckluZm8uZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L01hbmFnZXJJbmZvLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkc7QUFNN0csSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQWlGdkIsQ0FBQTtBQS9FRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBTVg7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7OzZDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDOzs2Q0FDZTtBQU1qQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7OENBQ2dCO0FBTWxCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzsyQ0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzswQ0FDWTtBQU9kO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsV0FBVztLQUN2QixDQUFDOztnREFDa0I7QUFPcEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O3lDQUNXO0FBT2I7SUFKQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFDO1FBQ1gsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDOzt1Q0FDTTtBQU9SO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzs4Q0FDZ0I7QUFPbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2dEQUNrQjtBQU9wQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQzs7MENBQ1k7QUFLZDtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7K0NBQUM7QUEvRVIsV0FBVztJQUR2QixJQUFBLGdCQUFNLEVBQUMsZ0JBQWdCLENBQUM7R0FDWixXQUFXLENBaUZ2QjtBQWpGWSxrQ0FBVyJ9