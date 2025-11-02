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
exports.PlayerAgent = void 0;
const typeorm_1 = require("typeorm");
let PlayerAgent = class PlayerAgent {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerAgent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "fk_uid",
        length: 8,
        unique: true,
        comment: "自有平台玩家编号"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "platform_name",
        length: 50,
        default: "",
        unique: true,
        comment: "平台名称"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "platformName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "platform_gold",
        default: 0,
        type: "double",
        comment: "平台金币"
    }),
    __metadata("design:type", Number)
], PlayerAgent.prototype, "platformGold", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "root_uid",
        length: 8,
        comment: "根玩家编号"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "rootUid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "parent_uid",
        length: 8,
        comment: "上级玩家编号"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "parentUid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "deep_level",
        comment: "关系层级"
    }),
    __metadata("design:type", Number)
], PlayerAgent.prototype, "deepLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "role_type",
        default: 1,
        comment: "关系类型 1: 玩家；2: 平台; 3: 代理"
    }),
    __metadata("design:type", Number)
], PlayerAgent.prototype, "roleType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 1,
        comment: "关系状态 1: 启用; 2: 停用"
    }),
    __metadata("design:type", Number)
], PlayerAgent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 'chinese_zh',
        comment: "语言类型"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "关闭的游戏有哪些"
    }),
    __metadata("design:type", String)
], PlayerAgent.prototype, "closeGameList", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], PlayerAgent.prototype, "createDateTime", void 0);
PlayerAgent = __decorate([
    (0, typeorm_1.Entity)("Sp_Player_Agent")
], PlayerAgent);
exports.PlayerAgent = PlayerAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQWdlbnQuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BsYXllckFnZW50LmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBcUc7QUFNckcsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQTZGdkIsQ0FBQTtBQTFGRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBUVg7SUFOQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxNQUFNLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxJQUFJO1FBQ1osT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7d0NBQ1U7QUF1Qlo7SUFQQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLGVBQWU7UUFDckIsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsRUFBRTtRQUNYLE1BQU0sRUFBRSxJQUFJO1FBQ1osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7aURBQ21CO0FBUXJCO0lBTkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGVBQWU7UUFDckIsT0FBTyxFQUFFLENBQUM7UUFDVixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2lEQUNtQjtBQU9yQjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsVUFBVTtRQUNoQixNQUFNLEVBQUUsQ0FBQztRQUNULE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7OzRDQUNjO0FBT2hCO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7OENBQ2dCO0FBTWxCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFlBQVk7UUFDbEIsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7OENBQ2dCO0FBT2xCO0lBTEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFdBQVc7UUFDakIsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUseUJBQXlCO0tBQ3JDLENBQUM7OzZDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsbUJBQW1CO0tBQy9CLENBQUM7OzJDQUNhO0FBTWY7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsWUFBWTtRQUNyQixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzs2Q0FDZTtBQU9qQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7a0RBQ29CO0FBSXRCO0lBREMsSUFBQSwwQkFBZ0IsR0FBRTs7bURBQ0k7QUE1RmQsV0FBVztJQUR2QixJQUFBLGdCQUFNLEVBQUMsaUJBQWlCLENBQUM7R0FDYixXQUFXLENBNkZ2QjtBQTdGWSxrQ0FBVyJ9