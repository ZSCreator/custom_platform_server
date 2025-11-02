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
exports.TenantControlGame = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let TenantControlGame = class TenantControlGame {
    initCreateDate() {
        this.createDate = new Date();
        this.updatedDate = new Date();
    }
    updateDate() {
        this.updatedDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantControlGame.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantControlGame.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantControlGame.prototype, "sceneName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantControlGame.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TenantControlGame.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TenantControlGame.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlGame.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlGame.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlGame.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlGame.prototype, "updateDate", null);
TenantControlGame = __decorate([
    (0, typeorm_1.Entity)("Sp_TenantControlGame")
], TenantControlGame);
exports.TenantControlGame = TenantControlGame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEdhbWUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1RlbmFudENvbnRyb2xHYW1lLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkY7QUFDN0YscURBQXlDO0FBTXpDLElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBNkNsQixjQUFjO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUdPLFVBQVU7UUFDZCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKLENBQUE7QUFuREc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOzs2Q0FDZDtBQU1YO0lBREMsSUFBQSxnQkFBTSxHQUFFOztpREFDTTtBQU1mO0lBREMsSUFBQSxnQkFBTSxHQUFFOztvREFDUztBQU1sQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7OENBQ0c7QUFPWjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7a0RBQ087QUFNaEI7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O3NEQUNXO0FBSXBCO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7cURBQUM7QUFJakI7SUFGQyxJQUFBLGdCQUFNLEdBQUU7SUFDUixJQUFBLHdCQUFNLEdBQUU7OEJBQ0ksSUFBSTtzREFBUTtBQUd6QjtJQURDLElBQUEsc0JBQVksR0FBRTs7Ozt1REFJZDtBQUdEO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O21EQUdkO0FBckRRLGlCQUFpQjtJQUQ3QixJQUFBLGdCQUFNLEVBQUMsc0JBQXNCLENBQUM7R0FDbEIsaUJBQWlCLENBc0Q3QjtBQXREWSw4Q0FBaUIifQ==