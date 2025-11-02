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
exports.ScratchCardResult = void 0;
const typeorm_1 = require("typeorm");
let ScratchCardResult = class ScratchCardResult {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ScratchCardResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", String)
], ScratchCardResult.prototype, "cardNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "" }),
    __metadata("design:type", String)
], ScratchCardResult.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        default: 0
    }),
    __metadata("design:type", Number)
], ScratchCardResult.prototype, "rebate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScratchCardResult.prototype, "jackpotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ScratchCardResult.prototype, "status", void 0);
ScratchCardResult = __decorate([
    (0, typeorm_1.Entity)("Sys_ScratchCardResult")
], ScratchCardResult);
exports.ScratchCardResult = ScratchCardResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyYXRjaENhcmRSZXN1bHQuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1NjcmF0Y2hDYXJkUmVzdWx0LmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBb0c7QUFNcEcsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBaUI7Q0FzQjdCLENBQUE7QUFwQkc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOzs2Q0FDZDtBQUlYO0lBRkMsSUFBQSxlQUFLLEdBQUU7SUFDUCxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2tEQUNQO0FBR2hCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDOztpREFDVDtBQUtmO0lBSEMsSUFBQSxnQkFBTSxFQUFDLEtBQUssRUFBRTtRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7aURBQ2E7QUFHZjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7b0RBQ1M7QUFHbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2lEQUNSO0FBcEJOLGlCQUFpQjtJQUQ3QixJQUFBLGdCQUFNLEVBQUMsdUJBQXVCLENBQUM7R0FDbkIsaUJBQWlCLENBc0I3QjtBQXRCWSw4Q0FBaUIifQ==