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
exports.PlayerGameHistory = void 0;
const typeorm_1 = require("typeorm");
const GameNidEnum_1 = require("../../../constant/game/GameNidEnum");
const PlayerGameHistoryStatus_enum_1 = require("./enum/PlayerGameHistoryStatus.enum");
let PlayerGameHistory = class PlayerGameHistory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerGameHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "玩家编号" }),
    __metadata("design:type", String)
], PlayerGameHistory.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        comment: "游戏编号",
        length: 3,
        default: GameNidEnum_1.GameNidEnum.None
    }),
    __metadata("design:type", String)
], PlayerGameHistory.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "场编号",
        default: -1
    }),
    __metadata("design:type", Number)
], PlayerGameHistory.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "房间编号",
        default: "000"
    }),
    __metadata("design:type", String)
], PlayerGameHistory.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "携带金币" }),
    __metadata("design:type", Number)
], PlayerGameHistory.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "记录类别",
        type: "enum",
        enum: PlayerGameHistoryStatus_enum_1.PlayerGameHistoryStatus,
        default: PlayerGameHistoryStatus_enum_1.PlayerGameHistoryStatus.None
    }),
    __metadata("design:type", Number)
], PlayerGameHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", String)
], PlayerGameHistory.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", String)
], PlayerGameHistory.prototype, "updateDateTime", void 0);
PlayerGameHistory = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerGameHistory")
], PlayerGameHistory);
exports.PlayerGameHistory = PlayerGameHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyR2FtZUhpc3RvcnkuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BsYXllckdhbWVIaXN0b3J5LmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBcUc7QUFDckcsb0VBQWlFO0FBQ2pFLHNGQUE4RTtBQUc5RSxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtDQTJEN0IsQ0FBQTtBQXhERztJQURDLElBQUEsZ0NBQXNCLEdBQUU7OzZDQUNkO0FBTVg7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7OzhDQUNoQjtBQVdaO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE9BQU8sRUFBRSxNQUFNO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPLEVBQUUseUJBQVcsQ0FBQyxJQUFJO0tBQzVCLENBQUM7OzhDQUNlO0FBVWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLEtBQUs7UUFDZCxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQ2QsQ0FBQzs7a0RBQ2M7QUFVaEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtRQUNmLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O2lEQUNhO0FBR2Y7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7OytDQUNmO0FBUWI7SUFOQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLHNEQUF1QjtRQUM3QixPQUFPLEVBQUUsc0RBQXVCLENBQUMsSUFBSTtLQUN4QyxDQUFDOztpREFDOEI7QUFHaEM7SUFEQyxJQUFBLDBCQUFnQixFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDOzt5REFDZjtBQUd2QjtJQURDLElBQUEsMEJBQWdCLEVBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7O3lEQUNmO0FBekRkLGlCQUFpQjtJQUQ3QixJQUFBLGdCQUFNLEVBQUMsc0JBQXNCLENBQUM7R0FDbEIsaUJBQWlCLENBMkQ3QjtBQTNEWSw4Q0FBaUIifQ==