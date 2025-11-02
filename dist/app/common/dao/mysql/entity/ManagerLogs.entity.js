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
exports.ManagerLogs = void 0;
const typeorm_1 = require("typeorm");
let ManagerLogs = class ManagerLogs {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ManagerLogs.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "操作人"
    }),
    __metadata("design:type", String)
], ManagerLogs.prototype, "mangerUserName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "请求IP"
    }),
    __metadata("design:type", String)
], ManagerLogs.prototype, "requestIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "请求的接口名"
    }),
    __metadata("design:type", String)
], ManagerLogs.prototype, "requestName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "请求参数"
    }),
    __metadata("design:type", String)
], ManagerLogs.prototype, "requestBody", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], ManagerLogs.prototype, "createDate", void 0);
ManagerLogs = __decorate([
    (0, typeorm_1.Entity)("Sp_ManagerLogs")
], ManagerLogs);
exports.ManagerLogs = ManagerLogs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFuYWdlckxvZ3MuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L01hbmFnZXJMb2dzLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBa0Y7QUFNbEYsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQWdDdkIsQ0FBQTtBQTdCRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBS1g7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzttREFDcUI7QUFNdkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzhDQUNnQjtBQU1sQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7Z0RBQ2tCO0FBTXBCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztnREFDa0I7QUFLcEI7SUFIQyxJQUFBLDBCQUFnQixFQUFDO1FBQ2QsT0FBTyxFQUFDLE1BQU07S0FDakIsQ0FBQzs4QkFDVSxJQUFJOytDQUFDO0FBL0JSLFdBQVc7SUFEdkIsSUFBQSxnQkFBTSxFQUFDLGdCQUFnQixDQUFDO0dBQ1osV0FBVyxDQWdDdkI7QUFoQ1ksa0NBQVcifQ==