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
exports.Robot = void 0;
const typeorm_1 = require("typeorm");
const RoleEnum_1 = require("../../../constant/player/RoleEnum");
const class_validator_1 = require("class-validator");
const hallConst_1 = require("../../../../consts/hallConst");
const PositionEnum_1 = require("../../../constant/player/PositionEnum");
let Robot = class Robot {
    afterLoad() {
        this.onLine = false;
        this.isOnLine = false;
    }
    init() {
        this.createTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Robot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "pk_uid",
        length: 8,
        unique: true
    }),
    __metadata("design:type", String)
], Robot.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 15 }),
    __metadata("design:type", String)
], Robot.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 10 }),
    __metadata("design:type", String)
], Robot.prototype, "headurl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Robot.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        default: hallConst_1.LANGUAGE.DEFAULT,
        length: 15
    }),
    __metadata("design:type", String)
], Robot.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Robot.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        default: RoleEnum_1.RoleEnum.ROBOT
    }),
    __metadata("design:type", Number)
], Robot.prototype, "isRobot", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "sid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "vipScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: PositionEnum_1.PositionEnum.HALL }),
    __metadata("design:type", Number)
], Robot.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "" }),
    __metadata("design:type", String)
], Robot.prototype, "guestid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Robot.prototype, "robotOnLine", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Robot.prototype, "afterLoad", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Robot.prototype, "init", null);
Robot = __decorate([
    (0, typeorm_1.Entity)("Sp_Robot")
], Robot);
exports.Robot = Robot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3QuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1JvYm90LmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBMEY7QUFDMUYsZ0VBQTZEO0FBQzdELHFEQUE2QztBQUM3Qyw0REFBd0Q7QUFDeEQsd0VBQXFFO0FBR3JFLElBQWEsS0FBSyxHQUFsQixNQUFhLEtBQUs7SUFpSE4sU0FBUztRQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFHTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDSixDQUFBO0FBdkhHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7aUNBQ2Q7QUFVWDtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLElBQUk7S0FDZixDQUFDOztrQ0FDVTtBQU1aO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQzs7dUNBQ2pCO0FBTWpCO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQzs7c0NBQ2xCO0FBWWhCO0lBTkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7SUFDRCxJQUFBLHVCQUFLLEdBQUU7SUFDUCxJQUFBLHFCQUFHLEVBQUMsQ0FBQyxDQUFDOzttQ0FDTTtBQVNiO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE9BQU8sRUFBRSxvQkFBUSxDQUFDLE9BQU87UUFDekIsTUFBTSxFQUFFLEVBQUU7S0FDYixDQUFDOzt1Q0FDZTtBQU9qQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs4QkFDRyxJQUFJO3lDQUFDO0FBU2pCO0lBSEMsSUFBQSxnQkFBTSxFQUFDLEtBQUssRUFBRTtRQUNYLE9BQU8sRUFBRSxtQkFBUSxDQUFDLEtBQUs7S0FDMUIsQ0FBQzs7c0NBQ2dCO0FBT2xCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOztrQ0FDZjtBQU1aO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt1Q0FDTjtBQU9qQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSwyQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDOzt1Q0FDaEI7QUFPdkI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7O3NDQUNSO0FBTWhCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzswQ0FDRjtBQWtCckI7SUFEQyxJQUFBLG1CQUFTLEdBQUU7Ozs7c0NBSVg7QUFHRDtJQURDLElBQUEsc0JBQVksR0FBRTs7OztpQ0FHZDtBQXpIUSxLQUFLO0lBRGpCLElBQUEsZ0JBQU0sRUFBQyxVQUFVLENBQUM7R0FDTixLQUFLLENBMEhqQjtBQTFIWSxzQkFBSyJ9