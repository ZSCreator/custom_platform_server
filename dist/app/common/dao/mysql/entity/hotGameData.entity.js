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
exports.HotGameData = void 0;
const typeorm_1 = require("typeorm");
let HotGameData = class HotGameData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HotGameData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏nid"
    }),
    __metadata("design:type", String)
], HotGameData.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏场"
    }),
    __metadata("design:type", Number)
], HotGameData.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "登陆人数"
    }),
    __metadata("design:type", Number)
], HotGameData.prototype, "playerNum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], HotGameData.prototype, "createTime", void 0);
HotGameData = __decorate([
    (0, typeorm_1.Entity)("Sp_HotGameData")
], HotGameData);
exports.HotGameData = HotGameData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90R2FtZURhdGEuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L2hvdEdhbWVEYXRhLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBa0Y7QUFNbEYsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQXdCdkIsQ0FBQTtBQXJCRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBS1g7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDOzt3Q0FDVTtBQUtaO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7NENBQ2M7QUFLaEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzs4Q0FDZ0I7QUFLbEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUMsTUFBTTtLQUNqQixDQUFDOzhCQUNVLElBQUk7K0NBQUM7QUF2QlIsV0FBVztJQUR2QixJQUFBLGdCQUFNLEVBQUMsZ0JBQWdCLENBQUM7R0FDWixXQUFXLENBd0J2QjtBQXhCWSxrQ0FBVyJ9