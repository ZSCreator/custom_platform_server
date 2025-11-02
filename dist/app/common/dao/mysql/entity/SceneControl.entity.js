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
exports.SceneControl = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let SceneControl = class SceneControl {
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
], SceneControl.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'game_id',
        length: 3,
    }),
    __metadata("design:type", String)
], SceneControl.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "name_zh",
        length: 12
    }),
    __metadata("design:type", String)
], SceneControl.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 12
    }),
    __metadata("design:type", String)
], SceneControl.prototype, "sceneName", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], SceneControl.prototype, "baseSystemWinRate", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], SceneControl.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], SceneControl.prototype, "bankerKillProbability", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], SceneControl.prototype, "weights", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], SceneControl.prototype, "bankerGame", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], SceneControl.prototype, "lockPool", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SceneControl.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SceneControl.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SceneControl.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SceneControl.prototype, "everyUpdate", null);
SceneControl = __decorate([
    (0, typeorm_1.Entity)('Sp_SceneControl')
], SceneControl);
exports.SceneControl = SceneControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDb250cm9sLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9TY2VuZUNvbnRyb2wuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUEwRjtBQUMxRixxREFBdUM7QUFNdkMsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJQUF6QjtRQWdESSxlQUFVLEdBQWdCLElBQUksSUFBSSxFQUFFLENBQUM7SUFrQnpDLENBQUM7SUFUVyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FFSixDQUFBO0FBaEVHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7d0NBQ2Q7QUFTWDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxDQUFDO0tBQ1osQ0FBQzs7eUNBQ1U7QUFPWjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO0tBQ2IsQ0FBQzs7OENBQ2U7QUFNakI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7S0FDYixDQUFDOzsrQ0FDZ0I7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxDQUFDOzt1REFDWTtBQUkxQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLENBQUM7OzZDQUNFO0FBR2hCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssQ0FBQzs7MkRBQ2dCO0FBRzlCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssQ0FBQzs7NkNBQ0U7QUFHaEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxDQUFDOztnREFDRTtBQUdwQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLENBQUM7OzhDQUNBO0FBSWxCO0lBRkMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzFCLElBQUEsd0JBQU0sR0FBRTs4QkFDRyxJQUFJO2dEQUFxQjtBQUtyQztJQUZDLElBQUEsZ0JBQU0sR0FBRTtJQUNSLElBQUEsd0JBQU0sR0FBRTs4QkFDRyxJQUFJO2dEQUFFO0FBSWxCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7OytDQUdkO0FBR0Q7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7K0NBR2Q7QUFoRVEsWUFBWTtJQUR4QixJQUFBLGdCQUFNLEVBQUMsaUJBQWlCLENBQUM7R0FDYixZQUFZLENBa0V4QjtBQWxFWSxvQ0FBWSJ9