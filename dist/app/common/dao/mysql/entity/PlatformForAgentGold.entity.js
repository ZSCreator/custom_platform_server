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
exports.PlatformForAgentGold = void 0;
const typeorm_1 = require("typeorm");
let PlatformForAgentGold = class PlatformForAgentGold {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlatformForAgentGold.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        comment: "操作人"
    }),
    __metadata("design:type", String)
], PlatformForAgentGold.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "平台号"
    }),
    __metadata("design:type", String)
], PlatformForAgentGold.prototype, "platformName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "代理号"
    }),
    __metadata("design:type", String)
], PlatformForAgentGold.prototype, "agentName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0,
        comment: "金币变化前数值"
    }),
    __metadata("design:type", Number)
], PlatformForAgentGold.prototype, "goldChangeBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0,
        comment: "金币变化数值"
    }),
    __metadata("design:type", Number)
], PlatformForAgentGold.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0,
        comment: "金币变化后数值"
    }),
    __metadata("design:type", Number)
], PlatformForAgentGold.prototype, "goldChangeAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], PlatformForAgentGold.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlatformForAgentGold.prototype, "createDateTime", void 0);
PlatformForAgentGold = __decorate([
    (0, typeorm_1.Entity)("Log_PlatformForAgentGold")
], PlatformForAgentGold);
exports.PlatformForAgentGold = PlatformForAgentGold;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Gb3JBZ2VudEdvbGQuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BsYXRmb3JtRm9yQWdlbnRHb2xkLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FRaUI7QUFPakIsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7Q0EwRGhDLENBQUE7QUF4REc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztnREFDZDtBQU1YO0lBSEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O3NEQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzswREFDbUI7QUFNckI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O3VEQUNnQjtBQU9sQjtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBQyxRQUFRO1FBQ2IsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzs4REFDdUI7QUFPekI7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7a0RBQ1c7QUFPYjtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzs2REFDc0I7QUFReEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7O29EQUNhO0FBS2Y7SUFIQyxJQUFBLDBCQUFnQixFQUFDO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDYyxJQUFJOzREQUFDO0FBdERaLG9CQUFvQjtJQURoQyxJQUFBLGdCQUFNLEVBQUMsMEJBQTBCLENBQUM7R0FDdEIsb0JBQW9CLENBMERoQztBQTFEWSxvREFBb0IifQ==