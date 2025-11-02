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
exports.DayApiData = void 0;
const typeorm_1 = require("typeorm");
let DayApiData = class DayApiData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DayApiData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "登陆玩家人数"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "loginLength", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "新增玩家人数"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "createLength", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "码量"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "betNum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "返奖率"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "backRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "带入带出差额"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "entryAndLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "持有金币"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "selfGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "带入金币"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "entryGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "带出金币"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "leaveGold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "最大在线人数"
    }),
    __metadata("design:type", Number)
], DayApiData.prototype, "maxOnline", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], DayApiData.prototype, "createDate", void 0);
DayApiData = __decorate([
    (0, typeorm_1.Entity)("Sp_DayApiData")
], DayApiData);
exports.DayApiData = DayApiData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5QXBpRGF0YS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvRGF5QXBpRGF0YS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWdHO0FBTWhHLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVU7Q0EyRHRCLENBQUE7QUF4REc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztzQ0FDZDtBQU1YO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzsrQ0FDa0I7QUFNcEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7O2dEQUNtQjtBQU1yQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQzs7MENBQ2E7QUFNZjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7NENBQ2U7QUFNakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7O2lEQUNvQjtBQUt0QjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NENBQ2U7QUFLakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzZDQUNnQjtBQUtsQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NkNBQ2dCO0FBS2xCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzs2Q0FDZ0I7QUFLbEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUMsTUFBTTtLQUNqQixDQUFDOzhCQUNVLElBQUk7OENBQUM7QUExRFIsVUFBVTtJQUR0QixJQUFBLGdCQUFNLEVBQUMsZUFBZSxDQUFDO0dBQ1gsVUFBVSxDQTJEdEI7QUEzRFksZ0NBQVUifQ==