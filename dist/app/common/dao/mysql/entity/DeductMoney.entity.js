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
exports.DeductMoney = void 0;
const typeorm_1 = require("typeorm");
let DeductMoney = class DeductMoney {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DeductMoney.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "扣款金额: 单位分"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "total_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "钱包金额: 单位分"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "walletGoldToGold", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "fk_uid",
        comment: "玩家编号"
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DeductMoney.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "备注信息"
    }),
    __metadata("design:type", String)
], DeductMoney.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "增加的金币"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "addGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "玩家当前身上的金币"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "客服编号"
    }),
    __metadata("design:type", String)
], DeductMoney.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "扣款完最后玩家身上的金币"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "lastGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "扣款过后玩家身上的钱包金币"
    }),
    __metadata("design:type", Number)
], DeductMoney.prototype, "lastWalletGold", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], DeductMoney.prototype, "createDate", void 0);
DeductMoney = __decorate([
    (0, typeorm_1.Entity)("Sp_DeductMoney")
], DeductMoney);
exports.DeductMoney = DeductMoney;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVkdWN0TW9uZXkuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L0RlZHVjdE1vbmV5LmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBMEY7QUFLMUYsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQThEdkIsQ0FBQTtBQTVERztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBTVg7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxXQUFXO0tBQ3ZCLENBQUM7OzhDQUNnQjtBQU1sQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFdBQVc7S0FDdkIsQ0FBQzs7cURBQ3VCO0FBT3pCO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQztJQUNELElBQUEsZUFBSyxHQUFFOzt3Q0FDSTtBQUtaO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7MkNBQ2E7QUFNZjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQzs7NENBQ2M7QUFNaEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxXQUFXO0tBQ3ZCLENBQUM7O3lDQUNXO0FBS2I7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzsrQ0FDaUI7QUFNbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxjQUFjO0tBQzFCLENBQUM7OzZDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsZUFBZTtLQUMzQixDQUFDOzttREFDcUI7QUFLdkI7SUFIQyxJQUFBLDBCQUFnQixFQUFDO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDVSxJQUFJOytDQUFDO0FBNURSLFdBQVc7SUFEdkIsSUFBQSxnQkFBTSxFQUFDLGdCQUFnQixDQUFDO0dBQ1osV0FBVyxDQThEdkI7QUE5RFksa0NBQVcifQ==