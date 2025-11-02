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
exports.SlotsWinLimit = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let SlotsWinLimit = class SlotsWinLimit {
    constructor() {
        this.updateTime = new Date();
    }
    everyUpdate() {
        this.updateTime = new Date();
    }
    initCreateDate() {
        this.createTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SlotsWinLimit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SlotsWinLimit.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)('json', {
        comment: '具体配置'
    }),
    __metadata("design:type", Object)
], SlotsWinLimit.prototype, "winLimitConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SlotsWinLimit.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlotsWinLimit.prototype, "everyUpdate", null);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SlotsWinLimit.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlotsWinLimit.prototype, "initCreateDate", null);
SlotsWinLimit = __decorate([
    (0, typeorm_1.Entity)("Sp_SlotsWinLimit")
], SlotsWinLimit);
exports.SlotsWinLimit = SlotsWinLimit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xvdHNXaW5MaW1pdC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvU2xvdHNXaW5MaW1pdC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTZGO0FBQzdGLHFEQUF5QztBQUt6QyxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBQTFCO1FBcUJJLGVBQVUsR0FBZ0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQW9CekMsQ0FBQztJQWpCVyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFRTyxjQUFjO1FBRWxCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0NBSUosQ0FBQTtBQXRDRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3lDQUNkO0FBS1g7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzBDQUNHO0FBTVo7SUFIQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7cURBQ3FCO0FBT3ZCO0lBRkMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzFCLElBQUEsd0JBQU0sR0FBRTs4QkFDRyxJQUFJO2lEQUFxQjtBQUdyQztJQURDLElBQUEsc0JBQVksR0FBRTs7OztnREFHZDtBQUtEO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7aURBQUM7QUFHakI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7bURBSWQ7QUFyQ1EsYUFBYTtJQUR6QixJQUFBLGdCQUFNLEVBQUMsa0JBQWtCLENBQUM7R0FDZCxhQUFhLENBeUN6QjtBQXpDWSxzQ0FBYSJ9