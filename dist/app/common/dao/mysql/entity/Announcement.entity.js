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
exports.Announcement = void 0;
const typeorm_1 = require("typeorm");
let Announcement = class Announcement {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Announcement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公告内容"
    }),
    __metadata("design:type", String)
], Announcement.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "是否关闭0 弹出 1 就是打开 2 就是关闭"
    }),
    __metadata("design:type", Number)
], Announcement.prototype, "openType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "公告排序"
    }),
    __metadata("design:type", Number)
], Announcement.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "公告标题"
    }),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], Announcement.prototype, "createDate", void 0);
Announcement = __decorate([
    (0, typeorm_1.Entity)("Sp_Announcement")
], Announcement);
exports.Announcement = Announcement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5ub3VuY2VtZW50LmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9Bbm5vdW5jZW1lbnQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFnRztBQU1oRyxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0NBZ0N4QixDQUFBO0FBN0JHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7d0NBQ2Q7QUFLWDtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzZDQUNjO0FBTWhCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsd0JBQXdCO0tBQ3BDLENBQUM7OzhDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzswQ0FDVztBQU1iO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzsyQ0FDWTtBQUtkO0lBSEMsSUFBQSwwQkFBZ0IsRUFBQztRQUNkLE9BQU8sRUFBQyxNQUFNO0tBQ2pCLENBQUM7OEJBQ1UsSUFBSTtnREFBQztBQS9CUixZQUFZO0lBRHhCLElBQUEsZ0JBQU0sRUFBQyxpQkFBaUIsQ0FBQztHQUNiLFlBQVksQ0FnQ3hCO0FBaENZLG9DQUFZIn0=