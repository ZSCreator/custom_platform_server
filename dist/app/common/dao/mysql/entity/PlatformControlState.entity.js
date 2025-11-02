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
exports.PlatformControlStateEntity = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../../services/newControl/constants");
let PlatformControlStateEntity = class PlatformControlStateEntity {
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
], PlatformControlStateEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'state_type',
        length: 3,
    }),
    __metadata("design:type", String)
], PlatformControlStateEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 30,
        default: ''
    }),
    __metadata("design:type", String)
], PlatformControlStateEntity.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 3,
    }),
    __metadata("design:type", String)
], PlatformControlStateEntity.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 10,
        default: ''
    }),
    __metadata("design:type", String)
], PlatformControlStateEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)('float', {
        default: 0,
    }),
    __metadata("design:type", Number)
], PlatformControlStateEntity.prototype, "killRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PlatformControlStateEntity.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PlatformControlStateEntity.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformControlStateEntity.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformControlStateEntity.prototype, "everyUpdate", null);
PlatformControlStateEntity = __decorate([
    (0, typeorm_1.Entity)('Sp_PlatformControlState')
], PlatformControlStateEntity);
exports.PlatformControlStateEntity = PlatformControlStateEntity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sU3RhdGUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1BsYXRmb3JtQ29udHJvbFN0YXRlLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBeUY7QUFDekYscURBQXVDO0FBQ3ZDLHlFQUE4RTtBQU05RSxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQUF2QztRQXdESSxlQUFVLEdBQWdCLElBQUksSUFBSSxFQUFFLENBQUM7SUFvQnpDLENBQUM7SUFUVyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FFSixDQUFBO0FBMUVHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7c0RBQ2Q7QUFTWDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsQ0FBQztLQUNaLENBQUM7O3dEQUN3QjtBQVMxQjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQzs7OERBQ2lCO0FBUW5CO0lBSEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxDQUFDO0tBQ1osQ0FBQzs7dURBQ1U7QUFTWjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQzs7NERBQ2U7QUFTakI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsT0FBTyxFQUFFO1FBQ2IsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs0REFDZTtBQVVqQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO0tBQ2pCLENBQUM7SUFDRCxJQUFBLHdCQUFNLEdBQUU7OEJBQ0csSUFBSTs4REFBcUI7QUFPckM7SUFGQyxJQUFBLGdCQUFNLEdBQUU7SUFDUixJQUFBLHdCQUFNLEdBQUU7OEJBQ0csSUFBSTs4REFBRTtBQUlsQjtJQURDLElBQUEsc0JBQVksR0FBRTs7Ozs2REFHZDtBQUdEO0lBREMsSUFBQSxxQkFBVyxHQUFFOzs7OzZEQUdiO0FBMUVRLDBCQUEwQjtJQUR0QyxJQUFBLGdCQUFNLEVBQUMseUJBQXlCLENBQUM7R0FDckIsMEJBQTBCLENBNEV0QztBQTVFWSxnRUFBMEIifQ==