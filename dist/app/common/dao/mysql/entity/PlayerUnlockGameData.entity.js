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
exports.PlayerUnlockGameData = void 0;
const typeorm_1 = require("typeorm");
let PlayerUnlockGameData = class PlayerUnlockGameData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerUnlockGameData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true, unique: true }),
    __metadata("design:type", String)
], PlayerUnlockGameData.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255, nullable: true }),
    __metadata("design:type", String)
], PlayerUnlockGameData.prototype, "unlockGames", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlayerUnlockGameData.prototype, "createTime", void 0);
PlayerUnlockGameData = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerUnlockGameData")
], PlayerUnlockGameData);
exports.PlayerUnlockGameData = PlayerUnlockGameData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyVW5sb2NrR2FtZURhdGEuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BsYXllclVubG9ja0dhbWVEYXRhLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBa0Y7QUFNbEYsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7Q0FlaEMsQ0FBQTtBQVpHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7Z0RBQ2Q7QUFHWDtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUcsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDOztpREFDckQ7QUFHWjtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7eURBQy9CO0FBS3BCO0lBSEMsSUFBQSwwQkFBZ0IsRUFBQztRQUNkLE9BQU8sRUFBQyxNQUFNO0tBQ2pCLENBQUM7OEJBQ1UsSUFBSTt3REFBQztBQWRSLG9CQUFvQjtJQURoQyxJQUFBLGdCQUFNLEVBQUMseUJBQXlCLENBQUM7R0FDckIsb0JBQW9CLENBZWhDO0FBZlksb0RBQW9CIn0=