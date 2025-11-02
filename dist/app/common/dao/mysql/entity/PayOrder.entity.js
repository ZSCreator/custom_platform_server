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
exports.PayOrder = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let PayOrder = class PayOrder {
    initCreateDate() {
        this.createDate = new Date();
    }
    updateDate() {
        this.updatedDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({}),
    __metadata("design:type", String)
], PayOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "fk_uid"
    }),
    __metadata("design:type", String)
], PayOrder.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PayOrder.prototype, "money", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayOrder.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayOrder.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayOrder.prototype, "payType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PayOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", String)
], PayOrder.prototype, "field1", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: -1 }),
    __metadata("design:type", String)
], PayOrder.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], PayOrder.prototype, "reissue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], PayOrder.prototype, "isLock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayOrder.prototype, "callBackTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PayOrder.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PayOrder.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayOrder.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayOrder.prototype, "updateDate", null);
PayOrder = __decorate([
    (0, typeorm_1.Entity)("Sp_PayOrder")
], PayOrder);
exports.PayOrder = PayOrder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5T3JkZXIuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BheU9yZGVyLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkY7QUFDN0YscURBQXlDO0FBS3pDLElBQWEsUUFBUSxHQUFyQixNQUFhLFFBQVE7SUFvRVQsY0FBYztRQUVsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUdPLFVBQVU7UUFDZCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUVKLENBQUE7QUEzRUc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztvQ0FDZDtBQUtYO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsQ0FBQzs7NkNBQ1M7QUFPcEI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFFBQVE7S0FDakIsQ0FBQzs7cUNBQ1U7QUFJWjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7dUNBQ1Q7QUFJZDtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7d0NBQ1o7QUFJZjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7MENBQ1Y7QUFJakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O3lDQUNYO0FBSWhCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt3Q0FDUjtBQUlmO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt3Q0FDUjtBQUlmO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7O3dDQUNUO0FBSWY7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3lDQUNOO0FBSWpCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt3Q0FDUDtBQUloQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs4QkFDYixJQUFJOzhDQUFDO0FBS25CO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7NENBQUM7QUFLakI7SUFGQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDMUIsSUFBQSx3QkFBTSxHQUFFOzhCQUNJLElBQUk7NkNBQVE7QUFHekI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7OENBSWQ7QUFHRDtJQURDLElBQUEsc0JBQVksR0FBRTs7OzswQ0FHZDtBQTVFUSxRQUFRO0lBRHBCLElBQUEsZ0JBQU0sRUFBQyxhQUFhLENBQUM7R0FDVCxRQUFRLENBOEVwQjtBQTlFWSw0QkFBUSJ9