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
exports.WhiteIpRecord = void 0;
const typeorm_1 = require("typeorm");
let WhiteIpRecord = class WhiteIpRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WhiteIpRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "绑定ip"
    }),
    __metadata("design:type", String)
], WhiteIpRecord.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "后台管理账号"
    }),
    __metadata("design:type", String)
], WhiteIpRecord.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "后台管理账号"
    }),
    __metadata("design:type", String)
], WhiteIpRecord.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建ip的账号"
    }),
    __metadata("design:type", String)
], WhiteIpRecord.prototype, "createUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], WhiteIpRecord.prototype, "createTime", void 0);
WhiteIpRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_WhiteIpRecord")
], WhiteIpRecord);
exports.WhiteIpRecord = WhiteIpRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hpdGVJcFJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvV2hpdGVJcFJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQXNHO0FBTXRHLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7Q0FrQ3pCLENBQUE7QUFoQ0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOzt5Q0FDZDtBQUtYO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7eUNBQ1M7QUFLWDtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OzhDQUNjO0FBT2hCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzs4Q0FDYztBQU1oQjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUM7O2lEQUNpQjtBQU1uQjtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7aURBQUM7QUEvQlIsYUFBYTtJQUR6QixJQUFBLGdCQUFNLEVBQUMsa0JBQWtCLENBQUM7R0FDZCxhQUFhLENBa0N6QjtBQWxDWSxzQ0FBYSJ9