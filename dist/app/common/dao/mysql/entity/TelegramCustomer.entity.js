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
exports.TelegramCustomer = void 0;
const typeorm_1 = require("typeorm");
let TelegramCustomer = class TelegramCustomer {
    firstInsert() {
        this.createDateTime = new Date();
    }
    everyUpdate() {
        this.updateDateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TelegramCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        comment: "tele 链接"
    }),
    __metadata("design:type", String)
], TelegramCustomer.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        comment: "昵称",
    }),
    __metadata("design:type", String)
], TelegramCustomer.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "下发比例",
        default: 0
    }),
    __metadata("design:type", Number)
], TelegramCustomer.prototype, "per", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "状态: 0停用,1启用",
        default: 0
    }),
    __metadata("design:type", Number)
], TelegramCustomer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], TelegramCustomer.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "最近更新时间"
    }),
    __metadata("design:type", Date)
], TelegramCustomer.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TelegramCustomer.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TelegramCustomer.prototype, "everyUpdate", null);
TelegramCustomer = __decorate([
    (0, typeorm_1.Entity)("Sp_TelegramCustomer")
], TelegramCustomer);
exports.TelegramCustomer = TelegramCustomer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVsZWdyYW1DdXN0b21lci5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvVGVsZWdyYW1DdXN0b21lci5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTRGO0FBRzVGLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBMkNqQixXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFBO0FBaERHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7NENBQ2Q7QUFRWDtJQUhDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzs2Q0FDVTtBQU1aO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBQztRQUNkLE9BQU8sRUFBRSxJQUFJO0tBRWhCLENBQUM7O2tEQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07UUFDZixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7OzZDQUNVO0FBTVo7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsYUFBYTtRQUN0QixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O2dEQUNhO0FBS2Y7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNjLElBQUk7d0RBQUM7QUFNckI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OEJBQ2MsSUFBSTt3REFBQztBQUdyQjtJQURDLElBQUEsc0JBQVksR0FBRTs7OzttREFHZDtBQUdEO0lBREMsSUFBQSxxQkFBVyxHQUFFOzs7O21EQUdiO0FBbERRLGdCQUFnQjtJQUQ1QixJQUFBLGdCQUFNLEVBQUMscUJBQXFCLENBQUM7R0FDakIsZ0JBQWdCLENBbUQ1QjtBQW5EWSw0Q0FBZ0IifQ==