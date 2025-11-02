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
exports.PlayerRebate = void 0;
const typeorm_1 = require("typeorm");
let PlayerRebate = class PlayerRebate {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], PlayerRebate.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "allRebate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "todayRebate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "yesterdayRebate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "sharePeople", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "dayPeople", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebate.prototype, "iplRebate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlayerRebate.prototype, "createDate", void 0);
PlayerRebate = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerRebate")
], PlayerRebate);
exports.PlayerRebate = PlayerRebate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmViYXRlLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9QbGF5ZXJSZWJhdGUuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUtpQjtBQUtqQixJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0NBeUN4QixDQUFBO0FBbENHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7eUNBQ2I7QUFJWjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7K0NBQ0w7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2lEQUNKO0FBSXBCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztxREFDQztBQUl4QjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7aURBQ0g7QUFJcEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7OytDQUNMO0FBSWxCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzsrQ0FDTDtBQUtsQjtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7Z0RBQUM7QUFwQ1IsWUFBWTtJQUR4QixJQUFBLGdCQUFNLEVBQUMsaUJBQWlCLENBQUM7R0FDYixZQUFZLENBeUN4QjtBQXpDWSxvQ0FBWSJ9