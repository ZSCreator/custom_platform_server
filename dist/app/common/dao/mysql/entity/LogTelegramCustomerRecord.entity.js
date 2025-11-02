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
exports.LogTelegramCustomerRecord = void 0;
const typeorm_1 = require("typeorm");
let LogTelegramCustomerRecord = class LogTelegramCustomerRecord {
    firstInsert() {
        this.createDateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LogTelegramCustomerRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "Sp_TelegramCustomer 表主键"
    }),
    __metadata("design:type", Number)
], LogTelegramCustomerRecord.prototype, "fk_telegramCustomer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], LogTelegramCustomerRecord.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogTelegramCustomerRecord.prototype, "firstInsert", null);
LogTelegramCustomerRecord = __decorate([
    (0, typeorm_1.Entity)("Log_TelegramCustomer_record")
], LogTelegramCustomerRecord);
exports.LogTelegramCustomerRecord = LogTelegramCustomerRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nVGVsZWdyYW1DdXN0b21lclJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvTG9nVGVsZWdyYW1DdXN0b21lclJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQStFO0FBRy9FLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBZ0IxQixXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFBO0FBakJHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7cURBQ2Q7QUFLWDtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSx5QkFBeUI7S0FDckMsQ0FBQzs7eUVBQzZCO0FBTS9CO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDYyxJQUFJO2lFQUFDO0FBR3JCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7OzREQUdkO0FBbEJRLHlCQUF5QjtJQURyQyxJQUFBLGdCQUFNLEVBQUMsNkJBQTZCLENBQUM7R0FDekIseUJBQXlCLENBbUJyQztBQW5CWSw4REFBeUIifQ==