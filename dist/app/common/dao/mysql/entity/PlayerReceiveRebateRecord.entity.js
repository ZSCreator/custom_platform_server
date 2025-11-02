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
exports.PlayerReceiveRebateRecord = void 0;
const typeorm_1 = require("typeorm");
let PlayerReceiveRebateRecord = class PlayerReceiveRebateRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerReceiveRebateRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerReceiveRebateRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], PlayerReceiveRebateRecord.prototype, "rebate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlayerReceiveRebateRecord.prototype, "createDate", void 0);
PlayerReceiveRebateRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerReceiveRebateRecord")
], PlayerReceiveRebateRecord);
exports.PlayerReceiveRebateRecord = PlayerReceiveRebateRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmVjZWl2ZVJlYmF0ZVJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvUGxheWVyUmVjZWl2ZVJlYmF0ZVJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBS2lCO0FBS2pCLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0NBb0JyQyxDQUFBO0FBakJHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7cURBQ2Q7QUFJWDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7c0RBQ0c7QUFNWjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FBRSxDQUFDOzt5REFDRjtBQUtmO0lBSEMsSUFBQSwwQkFBZ0IsRUFBQztRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ1UsSUFBSTs2REFBQztBQWxCUix5QkFBeUI7SUFEckMsSUFBQSxnQkFBTSxFQUFDLDhCQUE4QixDQUFDO0dBQzFCLHlCQUF5QixDQW9CckM7QUFwQlksOERBQXlCIn0=