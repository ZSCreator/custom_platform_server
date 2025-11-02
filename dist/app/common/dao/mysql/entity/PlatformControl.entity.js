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
exports.PlatformControlEntity = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../../services/newControl/constants");
let PlatformControlEntity = class PlatformControlEntity {
    constructor() {
        this.updateTime = new Date();
    }
    firstInsert() {
        this.createTime = new Date();
    }
    everyUpdate() {
        this.updateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'record_type',
        length: 3,
    }),
    __metadata("design:type", String)
], PlatformControlEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 30,
        default: ''
    }),
    __metadata("design:type", String)
], PlatformControlEntity.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 20,
        default: ''
    }),
    __metadata("design:type", String)
], PlatformControlEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 3,
        default: null,
    }),
    __metadata("design:type", String)
], PlatformControlEntity.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: null,
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "betGoldAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "betRoundCount", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "serviceCharge", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "controlLossCount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "controlWinCount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "controlEquality", void 0);
__decorate([
    (0, typeorm_1.Column)('float', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "killRate", void 0);
__decorate([
    (0, typeorm_1.Column)('float', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "systemWinRate", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "playerWinCount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "systemWinCount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        default: 0
    }),
    __metadata("design:type", Number)
], PlatformControlEntity.prototype, "equalityCount", void 0);
__decorate([
    (0, typeorm_1.Column)('json', {
        comment: "",
    }),
    __metadata("design:type", Object)
], PlatformControlEntity.prototype, "controlStateStatistical", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        comment: "下注玩家uid集合",
    }),
    __metadata("design:type", Object)
], PlatformControlEntity.prototype, "betPlayersSet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PlatformControlEntity.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PlatformControlEntity.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformControlEntity.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformControlEntity.prototype, "everyUpdate", null);
PlatformControlEntity = __decorate([
    (0, typeorm_1.Entity)('Sp_PlatformControl')
], PlatformControlEntity);
exports.PlatformControlEntity = PlatformControlEntity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9QbGF0Zm9ybUNvbnRyb2wuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUF5RjtBQUN6RixxREFBdUM7QUFDdkMseUVBQXNFO0FBTXRFLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXFCO0lBQWxDO1FBcUtJLGVBQVUsR0FBZ0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQW9CekMsQ0FBQztJQVRXLFdBQVc7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUdPLFdBQVc7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztDQUVKLENBQUE7QUF2TEc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztpREFDZDtBQVNYO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxhQUFhO1FBQ25CLE1BQU0sRUFBRSxDQUFDO0tBQ1osQ0FBQzs7bURBQ2dCO0FBU2xCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFDOzt5REFDaUI7QUFTbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7O3VEQUNlO0FBU2pCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQzs7a0RBQ1U7QUFRWjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNoQixDQUFDOztzREFDYztBQVFoQjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxRQUFRLEVBQUU7UUFDZCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O3FEQUNhO0FBUWY7SUFIQyxJQUFBLGdCQUFNLEVBQUMsUUFBUSxFQUFFO1FBQ2QsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs0REFDb0I7QUFRdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFFO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs0REFDb0I7QUFRdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsUUFBUSxFQUFFO1FBQ2QsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs0REFDb0I7QUFRdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFFO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzsrREFDdUI7QUFRekI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFFO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs4REFDc0I7QUFReEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFFO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs4REFDc0I7QUFReEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsT0FBTyxFQUFFO1FBQ2IsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzt1REFDZTtBQVFqQjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxPQUFPLEVBQUU7UUFDYixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7OzREQUNvQjtBQU90QjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUU7UUFDWCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7OzZEQUNxQjtBQU12QjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUU7UUFDWCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7OzZEQUNxQjtBQU12QjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUU7UUFDWCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7OzREQUNvQjtBQVN0QjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUU7UUFDWixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7O3NFQUMyQjtBQVM3QjtJQUhDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUU7UUFDWixPQUFPLEVBQUUsV0FBVztLQUN2QixDQUFDOzs0REFDaUI7QUFVbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDO0lBQ0QsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7eURBQXFCO0FBT3JDO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7eURBQUU7QUFJbEI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7d0RBR2Q7QUFHRDtJQURDLElBQUEscUJBQVcsR0FBRTs7Ozt3REFHYjtBQXZMUSxxQkFBcUI7SUFEakMsSUFBQSxnQkFBTSxFQUFDLG9CQUFvQixDQUFDO0dBQ2hCLHFCQUFxQixDQXlMakM7QUF6TFksc0RBQXFCIn0=