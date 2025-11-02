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
exports.PromoteDown = void 0;
const typeorm_1 = require("typeorm");
let PromoteDown = class PromoteDown {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PromoteDown.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "邀请码"
    }),
    __metadata("design:type", String)
], PromoteDown.prototype, "inviteCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "渠道备注"
    }),
    __metadata("design:type", String)
], PromoteDown.prototype, "platformName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "设备名称 ios android"
    }),
    __metadata("design:type", String)
], PromoteDown.prototype, "rom_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "创建状态，如果玩家登陆了就为 1，否则默认为0"
    }),
    __metadata("design:type", Number)
], PromoteDown.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "手机id"
    }),
    __metadata("design:type", String)
], PromoteDown.prototype, "phoneId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PromoteDown.prototype, "createDate", void 0);
PromoteDown = __decorate([
    (0, typeorm_1.Entity)("Sp_PromoteDown")
], PromoteDown);
exports.PromoteDown = PromoteDown;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW90ZURvd24uZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1Byb21vdGVEb3duLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBZ0c7QUFNaEcsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQXVDdkIsQ0FBQTtBQXBDRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3VDQUNkO0FBTVg7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7OytDQUNpQjtBQU1uQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7aURBQ21CO0FBTXJCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsa0JBQWtCO0tBQzlCLENBQUM7OzZDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUseUJBQXlCO0tBQ3JDLENBQUM7OzJDQUNhO0FBTWY7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzRDQUNjO0FBS2hCO0lBSEMsSUFBQSwwQkFBZ0IsRUFBQztRQUNkLE9BQU8sRUFBQyxNQUFNO0tBQ2pCLENBQUM7OEJBQ1UsSUFBSTsrQ0FBQztBQXRDUixXQUFXO0lBRHZCLElBQUEsZ0JBQU0sRUFBQyxnQkFBZ0IsQ0FBQztHQUNaLFdBQVcsQ0F1Q3ZCO0FBdkNZLGtDQUFXIn0=