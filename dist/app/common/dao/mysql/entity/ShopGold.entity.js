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
exports.ShopGold = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let ShopGold = class ShopGold {
    initCreateDate() {
        this.createDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ShopGold.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopGold.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopGold.prototype, "dese", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], ShopGold.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopGold.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], ShopGold.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { default: 1 }),
    __metadata("design:type", Boolean)
], ShopGold.prototype, "isOpen", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], ShopGold.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShopGold.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopGold.prototype, "initCreateDate", null);
ShopGold = __decorate([
    (0, typeorm_1.Entity)("Sp_ShopGold")
], ShopGold);
exports.ShopGold = ShopGold;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcEdvbGQuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1Nob3BHb2xkLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkY7QUFDN0YscURBQXlDO0FBS3pDLElBQWEsUUFBUSxHQUFyQixNQUFhLFFBQVE7SUF1Q1QsY0FBYztRQUVsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztDQUlKLENBQUE7QUEzQ0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztvQ0FDZDtBQUtYO0lBREMsSUFBQSxnQkFBTSxHQUFFOztzQ0FDSTtBQUliO0lBREMsSUFBQSxnQkFBTSxHQUFFOztzQ0FDSTtBQUliO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7dUNBQ2Y7QUFJZDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7MENBQ1E7QUFJakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztzQ0FDaEI7QUFJYjtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3dDQUNqQjtBQUloQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3NDQUNoQjtBQUliO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7NENBQUM7QUFHakI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7OENBSWQ7QUExQ1EsUUFBUTtJQURwQixJQUFBLGdCQUFNLEVBQUMsYUFBYSxDQUFDO0dBQ1QsUUFBUSxDQThDcEI7QUE5Q1ksNEJBQVEifQ==