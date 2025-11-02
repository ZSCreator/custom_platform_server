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
exports.SignRecord = void 0;
const typeorm_1 = require("typeorm");
let SignRecord = class SignRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SignRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SignRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SignRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SignRecord.prototype, "beginGold", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SignRecord.prototype, "lastGold", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SignRecord.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], SignRecord.prototype, "createDate", void 0);
SignRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_SignRecord")
], SignRecord);
exports.SignRecord = SignRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnblJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvU2lnblJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlGO0FBS2pGLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVU7Q0FpQ3RCLENBQUE7QUE5Qkc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztzQ0FDZDtBQUtYO0lBREMsSUFBQSxnQkFBTSxHQUFFOzt1Q0FDRztBQUtaO0lBREMsSUFBQSxnQkFBTSxHQUFFOzt3Q0FDSTtBQUliO0lBREMsSUFBQSxnQkFBTSxHQUFFOzs2Q0FDUztBQUlsQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7NENBQ1E7QUFJakI7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O3dDQUNJO0FBS2I7SUFIQyxJQUFBLDBCQUFnQixFQUFDO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDVSxJQUFJOzhDQUFDO0FBOUJSLFVBQVU7SUFEdEIsSUFBQSxnQkFBTSxFQUFDLGVBQWUsQ0FBQztHQUNYLFVBQVUsQ0FpQ3RCO0FBakNZLGdDQUFVIn0=