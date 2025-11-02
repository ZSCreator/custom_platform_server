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
exports.IPLRecord = void 0;
const typeorm_1 = require("typeorm");
let IPLRecord = class IPLRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], IPLRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)("varchar", {
        length: 8,
        unique: true,
        comment: "本平台用户编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100,
        comment: "板球平台用户编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100,
        comment: "板球平台交易编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "transfer_id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100,
        comment: "本平台交易编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "customer_ref", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100,
        comment: "平台编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "merchant_code", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100,
        comment: "交易日志编号"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "wallet_log_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "旧余额"
    }),
    __metadata("design:type", Number)
], IPLRecord.prototype, "old_balance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "新余额"
    }),
    __metadata("design:type", Number)
], IPLRecord.prototype, "new_balance", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        comment: "交易类型"
    }),
    __metadata("design:type", String)
], IPLRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "变化金额"
    }),
    __metadata("design:type", Number)
], IPLRecord.prototype, "change", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], IPLRecord.prototype, "createTime", void 0);
IPLRecord = __decorate([
    (0, typeorm_1.Entity)("log_IPL_walletRecord")
], IPLRecord);
exports.IPLRecord = IPLRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBMUmVjb3JkLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9JUExSZWNvcmQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFrRztBQUdsRyxJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFTO0NBeUVyQixDQUFBO0FBdEVHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7cUNBQ2Q7QUFVWDtJQUxDLElBQUEsdUJBQWEsRUFBQyxTQUFTLEVBQUU7UUFDdEIsTUFBTSxFQUFFLENBQUM7UUFDVCxNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUM7O3NDQUNVO0FBU1o7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDOzt5Q0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7OENBQ2tCO0FBTXBCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsT0FBTyxFQUFFLFNBQVM7S0FDckIsQ0FBQzs7K0NBQ21CO0FBTXJCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7Z0RBQ29CO0FBTXRCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7Z0RBQ29CO0FBS3RCO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7OENBQ2tCO0FBS3BCO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7OENBQ2tCO0FBTXBCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7dUNBQ1c7QUFLYjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O3lDQUNhO0FBS2Y7SUFIQyxJQUFBLDBCQUFnQixFQUFDO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDVSxJQUFJOzZDQUFDO0FBeEVSLFNBQVM7SUFEckIsSUFBQSxnQkFBTSxFQUFDLHNCQUFzQixDQUFDO0dBQ2xCLFNBQVMsQ0F5RXJCO0FBekVZLDhCQUFTIn0=