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
exports.SystemGameType = void 0;
const typeorm_1 = require("typeorm");
let SystemGameType = class SystemGameType {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemGameType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SystemGameType.prototype, "typeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SystemGameType.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SystemGameType.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SystemGameType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255, default: "" }),
    __metadata("design:type", String)
], SystemGameType.prototype, "nidList", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255, default: "" }),
    __metadata("design:type", String)
], SystemGameType.prototype, "hotNidList", void 0);
SystemGameType = __decorate([
    (0, typeorm_1.Entity)("Sys_SystemGameType")
], SystemGameType);
exports.SystemGameType = SystemGameType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtR2FtZVR5cGUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1N5c3RlbUdhbWVUeXBlLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkY7QUFHN0YsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBYztDQXNCMUIsQ0FBQTtBQW5CRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7OzBDQUNkO0FBR1g7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzhDQUNNO0FBR2Y7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzRDQUNJO0FBR2I7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzRDQUNLO0FBR2Q7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzRDQUNJO0FBR2I7SUFEQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7OytDQUNoQztBQUdoQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQzs7a0RBQzdCO0FBckJWLGNBQWM7SUFEMUIsSUFBQSxnQkFBTSxFQUFDLG9CQUFvQixDQUFDO0dBQ2hCLGNBQWMsQ0FzQjFCO0FBdEJZLHdDQUFjIn0=