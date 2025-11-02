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
exports.SystemConfig = void 0;
const typeorm_1 = require("typeorm");
let SystemConfig = class SystemConfig {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "tixianBate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "tixianRabate", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "signData", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SystemConfig.prototype, "startGold", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SystemConfig.prototype, "h5GameUrl", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "languageForWeb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "inputGoldThan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "winGoldThan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "winAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "cellPhoneGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Boolean)
], SystemConfig.prototype, "isOpenH5", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Boolean)
], SystemConfig.prototype, "isCloseApi", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "closeNid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "gameResultUrl", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "backButton", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "hotGameButton", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "bankList", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "apiTestAgent", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], SystemConfig.prototype, "unlimitedList", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], SystemConfig.prototype, "openUnlimited", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], SystemConfig.prototype, "iplRebate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], SystemConfig.prototype, "defaultChannelCode", void 0);
SystemConfig = __decorate([
    (0, typeorm_1.Entity)("Sys_SystemConfig")
], SystemConfig);
exports.SystemConfig = SystemConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtQ29uZmlnLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9TeXN0ZW1Db25maWcuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFrRTtBQUdsRSxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0NBa0h4QixDQUFBO0FBL0dHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7d0NBQ2Q7QUFNWDtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOztnREFDaUI7QUFPbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7a0RBQ21CO0FBSXJCO0lBREMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7OENBQ3JCO0FBSWQ7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OytDQUNTO0FBSWxCO0lBREMsSUFBQSxnQkFBTSxHQUFFOzsrQ0FDUztBQUdsQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7OENBQ2xDO0FBSWpCO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUcsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOztvREFDNUI7QUFPdkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7bURBQ29CO0FBTXRCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O2lEQUNrQjtBQU1wQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzsrQ0FDZ0I7QUFNbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7bURBQ29CO0FBS3RCO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs4Q0FDZ0I7QUFLbEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O2dEQUNrQjtBQUlwQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7OzhDQUNyQjtBQUlkO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7bURBQ2hCO0FBSXRCO0lBREMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7Z0RBQ25CO0FBS2hCO0lBRkMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7bURBRWhCO0FBRW5CO0lBREMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7OENBQ3JCO0FBSWQ7SUFEQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O2tEQUM5QjtBQUlyQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O21EQUNmO0FBSW5CO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzttREFDRDtBQU92QjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzsrQ0FDZ0I7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7d0RBQ2I7QUFoSG5CLFlBQVk7SUFEeEIsSUFBQSxnQkFBTSxFQUFDLGtCQUFrQixDQUFDO0dBQ2QsWUFBWSxDQWtIeEI7QUFsSFksb0NBQVkifQ==