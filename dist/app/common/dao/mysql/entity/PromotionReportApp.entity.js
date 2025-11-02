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
exports.PromotionReportApp = void 0;
const typeorm_1 = require("typeorm");
let PromotionReportApp = class PromotionReportApp {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PromotionReportApp.prototype, "agentUid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PromotionReportApp.prototype, "agentName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PromotionReportApp.prototype, "platformName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "todayPlayer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "todayAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "todayTixian", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "todayFlow", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PromotionReportApp.prototype, "todayCommission", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PromotionReportApp.prototype, "createDate", void 0);
PromotionReportApp = __decorate([
    (0, typeorm_1.Entity)("Sp_PromotionReportApp")
], PromotionReportApp);
exports.PromotionReportApp = PromotionReportApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW90aW9uUmVwb3J0QXBwLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9Qcm9tb3Rpb25SZXBvcnRBcHAuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUlpQjtBQUtqQixJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtDQXdDOUIsQ0FBQTtBQXJDRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7OzhDQUNkO0FBSVg7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O29EQUNRO0FBSWpCO0lBREMsSUFBQSxnQkFBTSxHQUFFOztxREFDUztBQUlsQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7d0RBQ1k7QUFJckI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3VEQUNGO0FBSXBCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt1REFDRjtBQUlwQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7dURBQ0Y7QUFHcEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3FEQUNKO0FBR2xCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzsyREFDRTtBQUt4QjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ1UsSUFBSTtzREFBQztBQXRDUixrQkFBa0I7SUFEOUIsSUFBQSxnQkFBTSxFQUFDLHVCQUF1QixDQUFDO0dBQ25CLGtCQUFrQixDQXdDOUI7QUF4Q1ksZ0RBQWtCIn0=