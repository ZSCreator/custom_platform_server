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
exports.PersonalControl = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let PersonalControl = class PersonalControl {
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
], PersonalControl.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'game_id',
        length: 3,
    }),
    __metadata("design:type", String)
], PersonalControl.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "name_zh",
        length: 12
    }),
    __metadata("design:type", String)
], PersonalControl.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 12
    }),
    __metadata("design:type", String)
], PersonalControl.prototype, "sceneName", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 20,
        default: ''
    }),
    __metadata("design:type", String)
], PersonalControl.prototype, "conditionDescription", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PersonalControl.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PersonalControl.prototype, "playersCount", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        comment: "调控玩家",
        nullable: true
    }),
    __metadata("design:type", Object)
], PersonalControl.prototype, "controlPlayersMap", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PersonalControl.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PersonalControl.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonalControl.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonalControl.prototype, "everyUpdate", null);
PersonalControl = __decorate([
    (0, typeorm_1.Entity)('Sp_PersonalControl')
], PersonalControl);
exports.PersonalControl = PersonalControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc29uYWxDb250cm9sLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9QZXJzb25hbENvbnRyb2wuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUF5RjtBQUN6RixxREFBdUM7QUFNdkMsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUE1QjtRQXFFSSxlQUFVLEdBQWdCLElBQUksSUFBSSxFQUFFLENBQUM7SUFvQnpDLENBQUM7SUFUVyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FFSixDQUFBO0FBdkZHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7MkNBQ2Q7QUFTWDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxDQUFDO0tBQ1osQ0FBQzs7NENBQ1U7QUFTWjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO0tBQ2IsQ0FBQzs7aURBQ2U7QUFRakI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7S0FDYixDQUFDOztrREFDZ0I7QUFTbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7OzZEQUMyQjtBQU83QjtJQURDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLENBQUM7O2dEQUNFO0FBTWhCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssQ0FBQzs7cURBQ087QUFTckI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDOzswREFDcUI7QUFVdkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDO0lBQ0QsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7bURBQXFCO0FBT3JDO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7bURBQUU7QUFJbEI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7a0RBR2Q7QUFHRDtJQURDLElBQUEscUJBQVcsR0FBRTs7OztrREFHYjtBQXZGUSxlQUFlO0lBRDNCLElBQUEsZ0JBQU0sRUFBQyxvQkFBb0IsQ0FBQztHQUNoQixlQUFlLENBeUYzQjtBQXpGWSwwQ0FBZSJ9