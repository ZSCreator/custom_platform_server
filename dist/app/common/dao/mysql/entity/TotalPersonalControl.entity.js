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
exports.TotalPersonalControl = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let TotalPersonalControl = class TotalPersonalControl {
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
], TotalPersonalControl.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 8,
        unique: true
    }),
    __metadata("design:type", String)
], TotalPersonalControl.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 100
    }),
    __metadata("design:type", String)
], TotalPersonalControl.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)("float"),
    __metadata("design:type", Number)
], TotalPersonalControl.prototype, "killCondition", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 15
    }),
    __metadata("design:type", String)
], TotalPersonalControl.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], TotalPersonalControl.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TotalPersonalControl.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TotalPersonalControl.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TotalPersonalControl.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TotalPersonalControl.prototype, "everyUpdate", null);
TotalPersonalControl = __decorate([
    (0, typeorm_1.Entity)('Sp_TotalPersonalControl')
], TotalPersonalControl);
exports.TotalPersonalControl = TotalPersonalControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG90YWxQZXJzb25hbENvbnRyb2wuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1RvdGFsUGVyc29uYWxDb250cm9sLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBeUY7QUFDekYscURBQXVDO0FBTXZDLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBQWpDO1FBZ0RJLGVBQVUsR0FBZ0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQW9CekMsQ0FBQztJQVRXLFdBQVc7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUdPLFdBQVc7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztDQUVKLENBQUE7QUFsRUc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztnREFDZDtBQVNYO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLElBQUk7S0FDZixDQUFDOztpREFDVTtBQVFaO0lBSEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO0tBQ2QsQ0FBQzs7b0RBQ2E7QUFNZjtJQURDLElBQUEsZ0JBQU0sRUFBQyxPQUFPLENBQUM7OzJEQUNNO0FBUXRCO0lBSEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxFQUFFO0tBQ2IsQ0FBQzs7dURBQ2dCO0FBTWxCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssQ0FBQzs7eURBQ007QUFTcEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDO0lBQ0QsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7d0RBQXFCO0FBT3JDO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7d0RBQUU7QUFJbEI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7dURBR2Q7QUFHRDtJQURDLElBQUEscUJBQVcsR0FBRTs7Ozt1REFHYjtBQWxFUSxvQkFBb0I7SUFEaEMsSUFBQSxnQkFBTSxFQUFDLHlCQUF5QixDQUFDO0dBQ3JCLG9CQUFvQixDQW9FaEM7QUFwRVksb0RBQW9CIn0=